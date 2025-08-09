'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/types';
import ProductCardClient from '@/app/components/ProductCardClient';
import LoadingSpinner from './LoadingSpinner';
import { ProductSort, SortOption } from './ProductSort';
import Pagination from './Pagination';
import { Breadcrumbs, generateCatalogBreadcrumbs } from './Breadcrumbs';
import ReusableFilters from '@/app/components/ReusableFilters';

interface CatalogPageProps {
  title: string;
  description?: string;
  apiEndpoint?: string;
  showCounter?: boolean;
  emptyMessage?: string;
  category?: string; // slug для хлебных крошек
  showCategoryFilter?: boolean; // показывать ли выбор категории в фильтрах
}

export function CatalogPage(props: CatalogPageProps) {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 text-center">
        <LoadingSpinner />
      </div>
    }>
      <CatalogPageInner {...props} />
    </Suspense>
  );
}

function CatalogPageInner({
  title,
  description,
  apiEndpoint,
  showCounter = true,
  emptyMessage = 'Мы работаем над наполнением категории.',
  category,
  showCategoryFilter = false
}: CatalogPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSort, setCurrentSort] = useState<SortOption>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const searchParams = useSearchParams();
  
  const PRODUCTS_PER_PAGE = 24;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Базовый endpoint: либо переданный вручную, либо унифицированный /api/products
        const endpoint = apiEndpoint || '/api/products';
        const url = new URL(endpoint, window.location.origin);

        // Если apiEndpoint не задан, и есть slug категории — используем categories
        if (!apiEndpoint && category) {
          url.searchParams.set('categories', category);
        }

        // Пагинация
        url.searchParams.set('page', currentPage.toString());
        url.searchParams.set('limit', PRODUCTS_PER_PAGE.toString());

        // Фильтры из URL
        // Поддерживаем и новый key 'categories', и устаревший 'category' (маппим в categories)
        const rawCategory = searchParams.get('category');
        const categories = searchParams.get('categories') || rawCategory;
        const pass = (key: string) => {
          const val = searchParams.get(key);
          if (val) url.searchParams.set(key, val);
        };
        ['search', 'minPrice', 'maxPrice'].forEach(pass);
        if (categories) {
          url.searchParams.set('categories', categories);
        }

        // Сортировка маппинг
        // API поддерживает: sortBy=createdAt|discount|price и sortOrder
        if (currentSort === 'price-asc') {
          url.searchParams.set('sortBy', 'price');
          url.searchParams.set('sortOrder', 'asc');
        } else if (currentSort === 'price-desc') {
          url.searchParams.set('sortBy', 'price');
          url.searchParams.set('sortOrder', 'desc');
        } else if (currentSort === 'popular') {
          // "Популярность" маппим на createdAt desc как дефолт (или позже добавим реальную логику)
          url.searchParams.set('sortBy', 'createdAt');
          url.searchParams.set('sortOrder', 'desc');
        } else if (currentSort === 'name-asc') {
          // Серверной сортировки по названию нет — оставляем дефолт
          url.searchParams.set('sortBy', 'createdAt');
          url.searchParams.set('sortOrder', 'desc');
        } else {
          url.searchParams.set('sortBy', 'createdAt');
          url.searchParams.set('sortOrder', 'desc');
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(url.toString(), {
          signal: controller.signal,
          cache: 'no-store'
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: Ошибка загрузки товаров`);
        }
        
        const data = await response.json();
        let productsData: Product[] = [];
        let total = 0;
        
        if (data.success && data.data) {
          productsData = data.data.products;
          total = data.data.pagination.total;
        } else if (data.products) {
          productsData = data.products;
          total = data.total || data.products.length;
        } else if (data.data) {
          productsData = data.data.filter((product: Product) => product.isConfirmed);
          total = data.total || productsData.length;
        } else if (Array.isArray(data)) {
          productsData = data;
          total = data.length;
        }
        
        setProducts(productsData);
        setTotalProducts(total);
        setTotalPages(Math.ceil(total / PRODUCTS_PER_PAGE));
      } catch (fetchError) {
        console.error('Error fetching products:', fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'Произошла ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiEndpoint, category, currentSort, currentPage, searchParams]);

  const handleSortChange = (sort: SortOption) => {
    setCurrentSort(sort);
    setCurrentPage(1);
  };

  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.pathname : '/catalog/все-категории';

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-6xl text-red-300 mb-4">⚠️</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Ошибка загрузки</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-[#E5D3B3] hover:bg-[#D4C2A1] text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs 
        items={generateCatalogBreadcrumbs(category)}
        className="mb-6"
      />
      
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{title}</h1>
        {description && (
          <p className="text-gray-600 text-lg mb-2">{description}</p>
        )}
        {showCounter && !loading && (
          <p className="text-gray-500">Всего товаров: {totalProducts}</p>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Левая колонка — фильтры */}
        <div className="lg:col-span-2 space-y-6">
          <ReusableFilters baseUrl={baseUrl} showCategory={showCategoryFilter} />
        </div>

        {/* Правая колонка — список товаров */}
        <div className="lg:col-span-3">
          {!loading && products.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="text-gray-600">Сортировка:</div>
                <ProductSort currentSort={currentSort} onSortChange={handleSortChange} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCardClient key={product.id} product={product} />
                ))}
              </div>

              <div className="mt-8 flex items-center justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  hasPrevPage={hasPrevPage}
                  hasNextPage={hasNextPage}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}

          {loading && (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner />
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-600 mb-6">{emptyMessage}</p>
              <Link
                href="/catalog/все-категории"
                className="inline-flex items-center justify-center bg-[#E5D3B3] hover:bg-[#D4C2A1] text-[#7C5C27] font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Перейти в каталог
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CatalogPage;