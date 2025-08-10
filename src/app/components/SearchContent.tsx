'use client';

import { useSearchParams } from 'next/navigation';
import ProductCardClient from '@/app/components/ProductCardClient';
import { useEffect, useMemo, useState } from 'react';
import { Product } from '@/types';

interface ApiProduct { id: number | string; title: string; price: number; image?: string | null; images?: string[]; category?: string | null; }

export default function SearchContent() {
  const params = useSearchParams();
  const query = (params.get('q') || '').toString();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalize = (s: string) => (s || '').toLowerCase().replace(/\s+/g, '');
  const normalizedQuery = useMemo(() => normalize(query), [query]);

  useEffect(() => {
    const load = async () => {
      if (!query.trim()) {
        setProducts([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch('/api/products?limit=1000');
        if (!resp.ok) throw new Error('Ошибка загрузки продуктов');
        const data = await resp.json();
        const all: ApiProduct[] = data?.data?.products || [];
        const filtered = all.filter((p) => normalize(p.title).includes(normalizedQuery));
        setProducts(filtered);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка поиска');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [query, normalizedQuery]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Поиск товаров...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        <h2 className="text-xl font-semibold mb-2">Ошибка поиска</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {query ? `Результаты поиска: "${query}"` : 'Поиск товаров'}
        </h1>
        {query && (
          <p className="text-gray-600 mt-2">
            Найдено товаров: {products.length}
          </p>
        )}
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCardClient key={product.id} product={product as unknown as Product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {query ? 'Ничего не найдено' : 'Введите поисковый запрос'}
          </h2>
          <p className="text-gray-600 mb-6">
            {query 
              ? 'Попробуйте изменить запрос или проверьте написание'
              : 'Введите запрос в поле поиска выше'}
          </p>
        </div>
      )}
    </div>
  );
}
