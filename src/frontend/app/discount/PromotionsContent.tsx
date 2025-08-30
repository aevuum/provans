'use client';

import ProductCardClient from '@/components/ProductCardClient';
import React, { useEffect, useState } from 'react';

export default function PromotionsContent() {
  const [specialProducts, setSpecialProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchSpecialProducts = async () => {
      try {
        const res = await fetch('/api/products?type=discount&limit=15&sortBy=discount&sortOrder=desc');
        const data = await res.json();
        if (data?.success && data.data?.products) setSpecialProducts(data.data.products);
      } catch (e) {
        console.error('Ошибка загрузки акций:', e);
      }
    };
    fetchSpecialProducts();
  }, []);

  if (specialProducts.length === 0) return null;

  return (
  <section className="container mx-auto px-4 pt-6 pb-16 md:pb-20 bg-mint-50 rounded-2xl relative">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Специальное предложение</h2>
      </div>
      <div className="relative">
        {/* Левая стрелка */}
        <button
          className="flex items-center justify-center cursor-pointer bg-white shadow-lg rounded-full absolute z-20 hover:shadow-xl transition-shadow w-10 h-10 sm:w-12 sm:h-12 left-0 -translate-x-1/2 top-1/2 -translate-y-1/2"
          onClick={() => { document.getElementById('special-products-scroll')?.scrollBy({ left: -300, behavior: 'smooth' }); }}
          aria-label="Прокрутить влево"
          type="button"
        >
            <svg width="20" height="20" fill="none">
                <path d="M12 4l-6 6 6 6" stroke="#667" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
        </button>
        <div
          id="special-products-scroll"
          className="flex gap-4 lg:gap-6 overflow-x-auto pb-2 md:pb-4 scroll-smooth scrollbar-hide"
          style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none' }}
        >
          {specialProducts.map((product) => (
            <div key={product.id} className="new-card flex-none w-72">
              <ProductCardClient product={product} />
            </div>
          ))}
        </div>
        {/* Правая стрелка */}
        <button
          className="flex items-center justify-center cursor-pointer bg-white shadow-lg rounded-full absolute z-20 hover:shadow-xl transition-shadow w-10 h-10 sm:w-12 sm:h-12 right-0 translate-x-1/2 top-1/2 -translate-y-1/2"
          onClick={() => { document.getElementById('special-products-scroll')?.scrollBy({ left: 300, behavior: 'smooth' }); }}
          aria-label="Прокрутить вправо"
          type="button"
        >
             <svg width="20" height="20" fill="none">
                <path d="M8 4l6 6-6 7" stroke="#667" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
        </button>
      </div>
    </section>
  );
}