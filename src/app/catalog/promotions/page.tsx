'use client';

import React, { useState, useEffect } from 'react';
import UniversalProductCard from '@/components/UniversalProductCard';
import { Breadcrumbs } from '@/app/components/Breadcrumbs';
import { Product } from '@/types';

export default function PromotionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const breadcrumbItems = [
    { name: 'Главная', label: 'Главная', href: '/' },
    { name: 'Акции и скидки', label: 'Акции и скидки', href: '/catalog/promotions' }
  ];

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await fetch('/api/products/promotions');
      if (!response.ok) throw new Error('Failed to fetch promotions');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Ошибка загрузки акционных товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-8 w-64"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({length: 8}).map((_, i) => (
                <div key={i} className="bg-white rounded-lg h-96"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} className="mb-8" />
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Акции и скидки
          </h1>
          <p className="text-xl text-gray-600">
            Выгодные предложения на декор для дома
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product) => (
              <UniversalProductCard
                key={product.id}
                product={product}
                showDiscount={true}
                className="h-full"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🎁</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Акции скоро появятся
            </h2>
            <p className="text-gray-600 mb-8">
              Следите за обновлениями — скоро здесь будут выгодные предложения!
            </p>
            <a
              href="/catalog/allshop"
              className="inline-flex items-center justify-center bg-[#E5D3B3] hover:bg-[#D4C2A1] text-gray-800 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Смотреть весь каталог
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
