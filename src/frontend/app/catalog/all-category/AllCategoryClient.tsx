"use client";

import React, { useEffect, useState } from 'react';
import ProductCardClient from '@/components/ProductCardClient';
import { useSearchParams } from 'next/navigation';
import { SafeImage } from '@/components/SafeImage';
import Link from 'next/link';
import type { Product } from '@/types/index';

type Item = { title: string; href: string; image: string };

const CategoryCard = ({ title, bgImage, href }: { title: string; bgImage: string; href: string }) => {
  return (
    <Link
      href={href}
      className="block relative aspect-square rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <SafeImage src={bgImage} alt={title} fill className="object-cover" sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/15 to-transparent" />
      <div className="absolute bottom-3 left-3 right-3">
        <div className="inline-block bg-white/80 text-gray-900 px-3 py-1.5 rounded-xl backdrop-blur-sm max-w-full">
          <span className="block font-semibold text-[0.78rem] xs:text-[0.8rem] sm:text-sm md:text-base leading-snug tracking-tight [word-break:break-word] whitespace-nowrap overflow-hidden text-ellipsis" title={title}>
            {title}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default function AllCategoryClient({ items }: { items: Item[] }) {
  const searchParams = useSearchParams();
  const searchQ = searchParams?.get('search') || '';
  const isSearchMode = String(searchQ).trim().length >= 1;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    const fetchProducts = async () => {
      if (!isSearchMode) return;
      try {
        setLoading(true);
        setError(null);
        const q = encodeURIComponent(String(searchQ).trim());
        const res = await fetch(`/api/products?limit=1000&search=${q}`);
        if (!res.ok) throw new Error(`Ошибка загрузки (${res.status})`);
        const json = await res.json();
        if (aborted) return;
        const arr = json?.data?.products || [];
        setProducts(arr);
      } catch (e: any) {
        if (aborted) return;
        console.error('AllCategory search fetch error', e);
        setError(e?.message || 'Ошибка загрузки');
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      aborted = true;
    };
  }, [searchQ, isSearchMode]);

  return (
    <div>
      {isSearchMode ? (
        <div>
          <div className="mb-4 text-center text-gray-700">Результаты поиска по запросу: <strong>{searchQ}</strong></div>

          {loading && <div className="text-gray-500 py-10">Загрузка...</div>}
          {error && !loading && <div className="text-red-500 py-10">{error}</div>}

          {!loading && !error && products.length === 0 && (
            <div className="py-10 text-gray-400">Товаров не найдено.</div>
          )}

          <div className="w-full mx-auto" style={{ maxWidth: 'calc(100% - 120px)' }}>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(p => (
                <div key={p.id} className="w-full min-w-0">
                  <ProductCardClient product={p} isNew={false} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((it, idx) => (
            <div key={`${it.href}-${idx}`} className="flex flex-col">
              <CategoryCard title={it.title} bgImage={it.image} href={it.href} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
