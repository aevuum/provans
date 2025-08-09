'use client';

import { useEffect, useState, useCallback } from 'react';
import ProductCardClient from '@/app/components/ProductCardClient';
import ReusableFilters from '@/app/components/ReusableFilters';
import { Product } from '@/types';

export default function NewItemsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState(new URLSearchParams());

  // Получаем новинки - товары, добавленные за последние 30 дней
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products?limit=1000'); // Получаем все товары
      const data = await response.json();
      
      if (response.ok && data.data) {
        // Фильтруем только подтверждённые товары и сортируем по дате создания
        const confirmedProducts = data.data
          .filter((product: Product) => product.isConfirmed)
          .sort((a: Product, b: Product) => {
            const dateA = new Date(a.createdAt || '').getTime();
            const dateB = new Date(b.createdAt || '').getTime();
            return dateB - dateA; // Сортировка по убыванию (новые сначала)
          });
        
        // Берём только товары за последние 30 дней или первые 50 товаров
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentProducts = confirmedProducts.filter((product: Product) => {
          const productDate = new Date(product.createdAt || '');
          return productDate >= thirtyDaysAgo;
        });
        
        // Если новинок за 30 дней мало, берём первые 50 самых новых товаров
        const finalProducts = recentProducts.length > 0 ? recentProducts : confirmedProducts.slice(0, 50);
        
        setProducts(finalProducts);
      } else {
        console.error('API error:', data);
        setProducts([]);
      }
    } catch (_error) {
      console.error('Ошибка при загрузке новинок:', _error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...products];

    // Фильтр по поиску
    const search = searchParams.get('search');
    if (search) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Фильтр по цене
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    if (minPrice) {
      filtered = filtered.filter(product => product.price >= parseFloat(minPrice));
    }
    
    if (maxPrice) {
      filtered = filtered.filter(product => product.price <= parseFloat(maxPrice));
    }

    setFilteredProducts(filtered);
  }, [products, searchParams]);

  useEffect(() => {
    fetchProducts();
    
    // Обновляем параметры поиска при изменении URL
    const params = new URLSearchParams(window.location.search);
    setSearchParams(params);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Обновление URL параметров
  const updateSearchParams = () => {
    const params = new URLSearchParams(window.location.search);
    setSearchParams(params);
  };

  useEffect(() => {
    const handlePopState = () => {
      updateSearchParams();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E5D3B3] mx-auto"></div>
            <p className="mt-4 text-gray-600">Загружаем новинки...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Новинки</h1>
          <p className="text-lg text-gray-600">
            Самые свежие поступления в нашем каталоге
          </p>
          <div className="w-24 h-1 bg-[#E5D3B3] mx-auto mt-4"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Боковая панель с фильтрами */}
          <div className="lg:w-1/4">
            <ReusableFilters
              showSearch={true}
              showCategory={false} // Скрываем категории в новинках
              showPrice={true}
              baseUrl="/catalog/new"
            />
          </div>

          {/* Основной контент */}
          <div className="lg:w-3/4">
            {/* Информация о количестве товаров */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Найдено товаров: <span className="font-semibold">{filteredProducts.length}</span>
              </p>
            </div>

            {/* Сетка товаров */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-fr">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="h-full">
                    <ProductCardClient 
                      product={product} 
                      isNew={true} // Все товары в новинках помечаются как новые
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Новинки не найдены</p>
                <p className="text-gray-400 mt-2">Попробуйте изменить параметры фильтрации</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
