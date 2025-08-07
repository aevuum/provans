'use client';

import { useSearchParams } from 'next/navigation';
import ProductCardClient from '@/app/components/ProductCardClient';
import { useProducts } from '@/lib/hooks/useProducts';
import { useEffect } from 'react';
import Pagination from '@/app/components/Pagination';

export default function SearchContent() {
  const params = useSearchParams();
  const query = params.get('q') || '';

  const {
    products,
    meta,
    loading,
    error,
    fetchProducts
  } = useProducts({
    search: query,
    limit: 12
  });

  useEffect(() => {
    if (query) {
      fetchProducts();
    }
  }, [query, fetchProducts]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Поиск товаров...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-semibold mb-2">Ошибка поиска</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {query ? `Результаты поиска: "${query}"` : 'Поиск товаров'}
        </h1>
        {meta.total > 0 && (
          <p className="text-gray-600 mt-2">
            Найдено товаров: {meta.total}
          </p>
        )}
      </div>

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <ProductCardClient key={product.id} product={product} />
            ))}
          </div>

          {meta.totalPages > 1 && (
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              hasNextPage={meta.hasNextPage}
              hasPrevPage={meta.hasPrevPage}
              onPageChange={(page) => {
                const newParams = new URLSearchParams(params);
                newParams.set('page', page.toString());
                if (typeof window !== 'undefined') {
                  window.location.search = newParams.toString();
                }
              }}
            />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {query ? 'Ничего не найдено' : 'Введите поисковый запрос'}
          </h2>
          <p className="text-gray-600 mb-6">
            {query 
              ? 'Попробуйте изменить поисковый запрос или проверить правильность написания'
              : 'Используйте поисковую строку выше для поиска товаров'
            }
          </p>
        </div>
      )}
    </div>
  );
}
