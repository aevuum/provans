'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';
import { ProductSort, SortOption } from './ProductSort';
import Pagination from './Pagination';
import { Breadcrumbs, generateCatalogBreadcrumbs } from './Breadcrumbs';
import { Product } from '../../types';
import ReusableFilters from './ReusableFilters';
import { catalogStructure } from '../../lib/catalogStructure';
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
  // title,
  // description,
  apiEndpoint,
  showCounter = true,
  emptyMessage = 'Мы работаем над наполнением категории.',
  category,
  // showCategoryFilter = false,
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
  const [gridCols, setGridCols] = useState(parseInt(searchParams.get('grid') || '4'));
  const [filtersOpen, setFiltersOpen] = useState(false);

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
  ['search', 'categories', 'subcategory', 'minPrice', 'maxPrice', 'onlyDiscounts', 'available'].forEach(pass);

        // Жёстко фиксируем категорию для страниц категории: всегда передаем slug
        if (category) {
          url.searchParams.delete('categories');
          url.searchParams.delete('category');
          const subcategory = searchParams.get('subcategory');
          if (subcategory) {
            url.searchParams.set('categories', subcategory);
            url.searchParams.set('category', subcategory);
          } else {
            url.searchParams.set('categories', category);
            url.searchParams.set('category', category);
          }
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

  useEffect(() => {
    setGridCols(parseInt(searchParams.get('grid') || '4'));
  }, [searchParams]);

  // Ensure URL has grid param — if user opened a link without it, set default 4 (no reload)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has('grid')) {
      params.set('grid', '4');
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
      setGridCols(4);
    }
  }, []);

  const handleSortChange = (sort: SortOption) => {
    setCurrentSort(sort);
    setCurrentPage(1);
  };

  const handleGridChange = (grid: number) => {
    setGridCols(grid);
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

  // Определяем режимы фильтрации
  const isDiscount = apiEndpoint?.includes('discount');
  const isNew = apiEndpoint?.includes('new');
  const isCatalogRoot = !category && !isDiscount && !isNew;
  const currentCat = category ? catalogStructure.find(cat => cat.slug === category) : undefined;
  const isMainCategory = currentCat && currentCat.subcategories && currentCat.subcategories.length > 0;
  const isSubcategory = currentCat && (!currentCat.subcategories || currentCat.subcategories.length === 0);

  // Категории для фильтра
  let categoriesList: Array<{ label: string; value: string; subcategories?: Array<{ label: string; value: string }> }> = [];
  let onlySubcategories = false;
  let showCategory = true;
  let showAllCategoriesOption = false;
  let showDiscountCheckbox = true;
  let showNewCheckbox = true;

  if (isDiscount || isNew || isCatalogRoot) {
    // Для всех товаров, акций, новинок — всегда показываем категории с подкатегориями
    categoriesList = catalogStructure.map(cat => ({
      label: cat.name,
      value: cat.slug,
      subcategories: cat.subcategories && cat.subcategories.length > 0
        ? cat.subcategories.map(sub => ({ label: sub.name, value: sub.slug }))
        : undefined,
    }));
    showAllCategoriesOption = true;
    onlySubcategories = false;
    showCategory = true;
    // Категории всегда показываем для каталога, акций, новинок
    showDiscountCheckbox = !isDiscount;
    showNewCheckbox = !isNew;
  } else if (isMainCategory) {
    // Для главной категории: показываем все товары из подкатегорий
    categoriesList = [
      {
        label: currentCat.name,
        value: currentCat.slug,
        subcategories: currentCat.subcategories && currentCat.subcategories.length > 0
          ? currentCat.subcategories.map(sub => ({ label: sub.name, value: sub.slug }))
          : undefined,
      },
    ];
    onlySubcategories = false;
    showCategory = false;
    showAllCategoriesOption = false;
    // Собираем все товары из подкатегорий
    if (currentCat.subcategories && currentCat.subcategories.length > 0) {
      const subSlugs = currentCat.subcategories.map(sub => sub.slug);
      // Фильтруем продукты по всем подкатегориям этой категории
      setProducts(prev => prev.filter(p => {
        const cat = Array.isArray(p.category) ? p.category[0] : p.category;
        return (cat && (subSlugs.includes(cat) || cat === currentCat.slug));
      }));
    }
  } else if (isSubcategory) {
    categoriesList = [];
    onlySubcategories = false;
    showCategory = false;
    showAllCategoriesOption = false;
  }

  // Пропсы для фильтра (гарантируем передачу категорий)
  const filterProps = {
    baseUrl,
    showSearch: true,
    showPrice: true,
    onGridChange: handleGridChange,
    panelMode: true,
    open: filtersOpen,
    onClose: () => setFiltersOpen(false),
    showGrid: false,
    categoriesList: categoriesList && categoriesList.length > 0 ? categoriesList : catalogStructure.map(cat => ({
      label: cat.name,
      value: cat.slug,
      subcategories: cat.subcategories && cat.subcategories.length > 0
        ? cat.subcategories.map(sub => ({ label: sub.name, value: sub.slug }))
        : undefined,
    })),
    showAllCategoriesOption,
    onlySubcategories,
    showCategory: true,
    showDiscountCheckbox,
    showNewCheckbox,
    showSubcategory: isMainCategory,
  };
  
  function GridIcon({ size = 4, active = false }) {
  const box = 20;
  const cell = box / size - 2;
  const gap = 2;
  return (
    <svg width={24} height={24} viewBox={`0 0 24 24`} fill="none">
      {[...Array(size)].map((_, row) =>
        [...Array(size)].map((_, col) => (
          <rect
            key={row + '-' + col}
            x={gap + col * (cell + gap)}
            y={gap + row * (cell + gap)}
            width={cell}
            height={cell}
            rx="1"
            fill={active ? "#8B5E3C" : "#D1BFA3"}
          />
        ))
      )}
    </svg>
  );
}
  return (
    <div className="w-full px-3 md:px-6 py-6 md:py-10">
      <Breadcrumbs items={breadcrumbs} className="mb-4 md:mb-6" />

      {/* Заголовок */}
      <div className="flex flex-col gap-2 md:gap-3 mb-4 md:mb-6">
        {showCounter && (
          <span className="text-sm text-gray-500">Найдено: {totalProducts}</span>
        )}
      </div>

      
      {/* Панель фильтров  */}

      <div className="mb-3">
        {/* Мобильный (sm и меньше): вертикально */}
        <div className="flex flex-col gap-3 sm:hidden">
          <button
            className="flex items-center gap-3 px-4 py-2 rounded-md bg-white hover:shadow-sm w-full justify-center"
            onClick={() => setFiltersOpen(true)}
          >
            <span className="text-base">Фильтры</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 5h18" stroke="#333" strokeWidth="2" strokeLinecap="round"/><path d="M6 12h12" stroke="#333" strokeWidth="2" strokeLinecap="round"/><path d="M10 19h4" stroke="#333" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <ProductSort currentSort={currentSort} onSortChange={handleSortChange} />
        </div>
        {/* Десктоп (sm+): горизонтально, как было */}
        <div className="hidden sm:flex items-center justify-between">
          <div>
            <button
              className="flex items-center gap-3 px-4 py-2 rounded-md bg-white hover:shadow-sm"
              onClick={() => setFiltersOpen(true)}
            >
              <span className="text-base">Фильтры</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 5h18" stroke="#333" strokeWidth="2" strokeLinecap="round"/><path d="M6 12h12" stroke="#333" strokeWidth="2" strokeLinecap="round"/><path d="M10 19h4" stroke="#333" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <ProductSort currentSort={currentSort} onSortChange={handleSortChange} />
            <div className="flex items-center gap-2">
              <button
                onClick={() => { handleGridChange(4); }}
                className={`p-2 rounded-md transition-colors ${gridCols === 4 ? 'bg-[#E5D3B3] text-gray-800' : 'bg-gray-100 hover:bg-gray-200'}`}
                title="4x4 сетка"
              >
                <GridIcon size={4} active={gridCols === 4} />
              </button>
              <button
                onClick={() => { handleGridChange(5); }}
                className={`p-2 rounded-md transition-colors ${gridCols === 5 ? 'bg-[#E5D3B3] text-gray-800' : 'bg-gray-100 hover:bg-gray-200'}`}
                title="5x5 сетка"
              >
                <GridIcon size={5} active={gridCols === 5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        {/* (Сортировка) */}
        {products.length === 0 ? (
          <div className={`${emptyAlignClass} text-gray-600 py-10`}>{emptyMessage}</div>
        ) : (
          <>
            {/* Сетка товаров*/}
            <div className={`grid gap-3 ${
              gridCols === 4 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4' :
              gridCols === 5 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5' :
              'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
            }`}>
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
      </div>
      {/* Panel-mode filters (slide-out from left) */}
  <ReusableFilters {...filterProps} />
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