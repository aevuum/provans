'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types';
import ProductGrid from './ProductGrid';
import LoadingSpinner from './LoadingSpinner';
import { ProductSort, SortOption } from './ProductSort';
import Pagination from './Pagination';
import { Breadcrumbs, generateCatalogBreadcrumbs } from './Breadcrumbs';

interface CatalogPageProps {
  title: string;
  description?: string;
  apiEndpoint?: string;
  isNew?: boolean;
  showCounter?: boolean;
  emptyMessage?: string;
  category?: string;
}

export function CatalogPage({
  title,
  description,
  apiEndpoint,
  isNew = false,
  showCounter = true,
  emptyMessage = 'Товары не найдены',
  category
}: CatalogPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSort, setCurrentSort] = useState<SortOption>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const PRODUCTS_PER_PAGE = 24;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Используем category для построения URL API
        const endpoint = apiEndpoint || `/api/products?category=${encodeURIComponent(category || '')}&confirmed=true`;
        const url = new URL(endpoint, window.location.origin);
        url.searchParams.set('page', currentPage.toString());
        url.searchParams.set('limit', PRODUCTS_PER_PAGE.toString());
        url.searchParams.set('sort', currentSort);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд timeout
        
        const response = await fetch(url.toString(), {
          signal: controller.signal,
          cache: 'no-store' // Отключаем кэширование для актуальных данных
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: Ошибка загрузки товаров`);
        }
        
        const data = await response.json();
        
        let productsData: Product[] = [];
        let total = 0;
        
        if (data.products) {
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
        
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error instanceof Error ? error.message : 'Произошла ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiEndpoint, category, currentSort, currentPage]);

  const handleSortChange = (sort: SortOption) => {
    setCurrentSort(sort);
    setCurrentPage(1);
  };

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

      {!loading && products.length > 0 && (
        <div className="flex justify-end mb-6">
          <ProductSort
            currentSort={currentSort}
            onSortChange={handleSortChange}
          />
        </div>
      )}

      {loading ? (
        <LoadingSpinner size="lg" message="Загружаем товары..." />
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl text-gray-300 mb-4">📦</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">{emptyMessage}</h3>
          <p className="text-gray-600">Попробуйте изменить параметры поиска или вернитесь позже</p>
        </div>
      ) : (
        <>
          <ProductGrid
            products={products}
            isNew={isNew}
            emptyMessage={emptyMessage}
            emptyIcon="🔍"
          />
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNextPage={currentPage < totalPages}
            hasPrevPage={currentPage > 1}
            onPageChange={handlePageChange}
            className="mt-12"
          />
        </>
      )}
    </div>
  );
}

export default CatalogPage;