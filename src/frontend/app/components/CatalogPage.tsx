'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';
import { ProductSort, SortOption } from './ProductSort';
import Pagination from './Pagination';
import { Breadcrumbs, generateCatalogBreadcrumbs } from './Breadcrumbs';
import { Product } from '../../types';
import ReusableFilters from './ReusableFilters';
import ProductCardClient from './ProductCardClient';

interface CatalogPageProps {
  title: string;
  description?: string;
  apiEndpoint?: string; // при необходимости можно задать тип (new/discount и т.п.)
  showCounter?: boolean;
  emptyMessage?: string;
  category?: string; 
  showCategoryFilter?: boolean; 
  emptyAlign?: 'left' | 'center' | 'right';
  pageSize?: number; // новый проп: размер страницы (по умолчанию 24)
  highlightNew?: boolean; // помечать карточки бейджем NEW
}

function CatalogPageInner({
  title,
  description,
  apiEndpoint,
  showCounter = true,
  emptyMessage = 'Мы работаем над наполнением категории.',
  category,
  showCategoryFilter = false,
  emptyAlign = 'center',
  pageSize = 24,
  highlightNew = false,
}: CatalogPageProps) {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSort, setCurrentSort] = useState<SortOption>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Поиск (простое includes, без регистра и пробелов)
  const searchQuery = (searchParams.get('search') || '').toString();
  const isSearchMode = searchQuery.trim().length > 0;
  const PAGE_LIMIT = isSearchMode ? 1000 : pageSize;

  // Исправление: ASCII fallback пути
  const baseUrl = typeof window !== 'undefined' ? window.location.pathname : '/catalog/all-shop';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const endpoint = apiEndpoint || '/api/products';
        const url = new URL(endpoint, window.location.origin);

        // Пагинация
        url.searchParams.set('page', isSearchMode ? '1' : String(currentPage));
        url.searchParams.set('limit', String(PAGE_LIMIT));

        // Фильтры из URL передаём как есть
        const pass = (key: string) => {
          const val = searchParams.get(key);
          if (val) url.searchParams.set(key, val);
        };
  ['search', 'categories', 'minPrice', 'maxPrice', 'onlyDiscounts', 'available'].forEach(pass);

        // Жёстко фиксируем категорию для страниц категории: всегда передаем slug
        if (category) {
          url.searchParams.delete('categories');
          url.searchParams.delete('category');
          url.searchParams.set('categories', category);
          url.searchParams.set('category', category);
        }

        // Сортировка
        if (currentSort === 'price-asc') {
          url.searchParams.set('sortBy', 'price');
          url.searchParams.set('sortOrder', 'asc');
        } else if (currentSort === 'price-desc') {
          url.searchParams.set('sortBy', 'price');
          url.searchParams.set('sortOrder', 'desc');
        } else if (currentSort === 'name-asc') {
          url.searchParams.set('sortBy', 'title');
          url.searchParams.set('sortOrder', 'asc');
        } else if (currentSort === 'popular') {
          url.searchParams.set('sortBy', 'createdAt');
          url.searchParams.set('sortOrder', 'desc');
        } else {
          url.searchParams.set('sortBy', 'createdAt');
          url.searchParams.set('sortOrder', 'desc');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(url.toString(), { signal: controller.signal, cache: 'no-store' });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: Ошибка загрузки товаров`);
        }

        const data = await response.json();

        let productsData: Product[] = [];
        let total = 0;
        if (data?.success && data?.data) {
          productsData = data.data.products || [];
          total = data.data.pagination?.total ?? productsData.length;
        } else if (Array.isArray(data)) {
          productsData = data;
          total = data.length;
        } else if (data?.products) {
          productsData = data.products;
          total = data.total || data.products.length;
        } else if (data?.data) {
          productsData = data.data;
          total = data.total || productsData.length;
        }

        
        if (isSearchMode) {
          const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '');
          const q = norm(searchQuery);
          const filtered = productsData.filter((p: Product) => norm(p.title || '').includes(q));
          setProducts(filtered);
          setTotalProducts(filtered.length);
          setTotalPages(1);
        } else {
          setProducts(productsData);
          setTotalProducts(total);
          setTotalPages(Math.max(1, Math.ceil(total / PAGE_LIMIT)));
        }
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : 'Произошла ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiEndpoint, currentPage, currentSort, searchParams, isSearchMode, PAGE_LIMIT, searchQuery, category]);

  const handleSortChange = (sort: SortOption) => {
    setCurrentSort(sort);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (isSearchMode) return;
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const hasPrevPage = !isSearchMode && currentPage > 1;
  const hasNextPage = !isSearchMode && currentPage < totalPages;

  const breadcrumbs = useMemo(() => generateCatalogBreadcrumbs(category), [category]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center text-red-600 mb-4">{error}</div>
        <div className="text-center">
          <button
            onClick={() => typeof window !== 'undefined' && window.location.reload()}
            className="bg-[#E5D3B3] hover:bg-[#D4C2A1] text-gray-800 py-2 px-4 rounded-md"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  const emptyAlignClass = emptyAlign === 'left' ? 'text-left' : emptyAlign === 'right' ? 'text-right' : 'text-center';

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
   
      <Breadcrumbs items={breadcrumbs} className="mb-4 md:mb-6" />

      {/* Заголовок */}
      <div className="flex flex-col gap-2 md:gap-3 mb-4 md:mb-6">
        {/* <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">{title}</h1>
        {description && (
          <p className="text-gray-600 text-sm md:text-base max-w-3xl">{description}</p>
        )} */}
        {showCounter && (
          <span className="text-sm text-gray-500">Найдено: {totalProducts}</span>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6">
        {/* Левая колонка: фильтры */}
        <aside className="xl:col-span-3 xl:sticky xl:top-6 xl:self-start">
          <ReusableFilters
            baseUrl={baseUrl}
            showSearch={true}
            showCategory={showCategoryFilter}
            showPrice={true}
          />
        </aside>

        {/* Правая колонка: список */}
  <section className="xl:col-span-9">
          {/* Сортировка */}
          <div className="flex items-center justify-end mb-4">
            <ProductSort currentSort={currentSort} onSortChange={handleSortChange} />
          </div>

         
          {products.length === 0 ? (
            <div className={`${emptyAlignClass} text-gray-600 py-10`}>{emptyMessage}</div>
          ) : (
            <>
              {/* Сетка товаров */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {products.map((product) => (
                  <ProductCardClient key={product.id} product={product} isNew={highlightNew} />
                ))}
              </div>

              {/* Пагинация */}
              {!isSearchMode && (
                <Pagination
                  className="mt-6"
                  currentPage={currentPage}
                  totalPages={totalPages}
                  hasNextPage={hasNextPage}
                  hasPrevPage={hasPrevPage}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export function CatalogPage(props: CatalogPageProps) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12 text-center">
          <LoadingSpinner />
        </div>
      }
    >
      <CatalogPageInner {...props} />
    </Suspense>
  );
}

export default CatalogPage;