"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { normalizeText } from '@/lib/text/normalize';
import ProductCardClient from '@/components/ProductCardClient';
import type { Product } from '@/types/index';
import { useFullTextSearch } from '@/hooks/useFullTextSearch';
import { FaSearch, FaTimes } from 'react-icons/fa';

interface LightweightProduct {
  id: number;
  title: string;
  price: number;
  category: string | null;
  image: string | null;
  images: string[];
  discount?: number | null;
  originalPrice?: number | undefined;
  isConfirmed?: boolean;
}

interface AllProductsSearchClientProps {
  initialProducts: LightweightProduct[];
}

// Using shared normalizer for consistency across app
const normalize = normalizeText;

export default function AllProductsSearchClient({ initialProducts }: AllProductsSearchClientProps) {
  const [query, setQuery] = useState('');
  // Категория убрана по новой задаче — только глобальный текстовый поиск

  const indexed = useMemo(() => initialProducts.map(p => ({ ...p, _norm: normalize(p.title) })), [initialProducts]);

  // Local filtering (fallback + instant UX before debounce fires)
  const filteredLocal = useMemo(() => {
    const q = normalize(query.trim());
    if (q.length < 2) return indexed; // показываем все до ввода (как раньше — открытый каталог)
    return indexed.filter(p => p._norm.includes(q));
  }, [indexed, query]);

  // Remote full-text (debounced 1s) once query length >=2
  const { data: remote, isFetching } = useFullTextSearch({ query, enabled: true, debounceMs: 300 });
  const isRemoteMode = query.trim().length >= 2;

  const effective = useMemo(() => {
    if (isRemoteMode && remote) {
      return remote.results.map(r => ({
        id: r.id,
        title: r.title,
        price: r.price,
        category: r.category,
        image: r.image,
        images: r.images || (r.image ? [r.image] : []),
        discount: null,
        originalPrice: undefined,
        isConfirmed: true,
      }));
    }
    return filteredLocal;
  }, [isRemoteMode, remote, filteredLocal]);

  const onInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const clearQuery = useCallback(() => setQuery(''), []);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6">Поиск</h1>
        <div className="mb-6">
          <form onSubmit={e => e.preventDefault()} className="relative group">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#7C5C27] transition-colors" />
            <input
              id="searchInput"
              type="text"
              value={query}
              onChange={onInput}
              placeholder="Начните вводить..."
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E5D3B3] focus:border-[#E5D3B3] text-sm sm:text-base bg-white shadow-sm"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={clearQuery}
                aria-label="Очистить"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            )}
          </form>
          <div className="mt-2 text-xs sm:text-sm text-gray-500 flex items-center gap-3">
            <span>
              {isRemoteMode ? (
                remote ? `Найдено: ${remote.count} (сервер, ${remote.timeMs}мс)` : 'Поиск...'
              ) : (
                `Всего товаров: ${indexed.length}`
              )}
            </span>
            {isFetching && <span className="text-yellow-600 animate-pulse">Обновление…</span>}
          </div>
        </div>
        {effective.length === 0 && (
          <div className="py-16 text-center text-gray-500 text-sm">
            Ничего не найдено. Попробуйте изменить запрос.
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-5">
          {effective.map(p => {
            const product: Product = {
              id: p.id,
              title: p.title,
              price: p.price,
              category: p.category,
              image: p.image || undefined,
              images: p.images,
              discount: p.discount ?? null,
              originalPrice: p.originalPrice,
              isConfirmed: p.isConfirmed,
            };
            return <ProductCardClient key={p.id} product={product} />;
          })}
        </div>
      </div>
    </main>
  );
}
