import { Metadata } from 'next';
import React from 'react';
import ProductFilters from '../components/ProductFilters';
import ProductCardClient from '../components/ProductCardClient';

// Тип для параметров поиска
type SearchParams = {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  material?: string;
  country?: string;
  page?: string;
  limit?: string;
}

// Тип для продукта
type Product = {
  id: number;
  title: string;
  price: number;
  image?: string;
  category?: string;
  material?: string;
  country?: string;
  isConfirmed: boolean;
}

// Функция для получения новых товаров
async function getNewProducts(params: SearchParams) {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.append(key, value);
  });

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products/new?${searchParams}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    return { data: [], meta: { total: 0, page: 1, limit: 12, totalPages: 0 } };
  }
  
  return response.json();
}

export const metadata: Metadata = {
  title: 'Новинки | Provans Decor',
  description: 'Новые поступления товаров для дома от Provans Decor. Последние новинки мебели, декора, посуды и текстиля.',
};

export default async function NewPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const productsData = await getNewProducts(params);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Баннер новинок */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-8 mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            ✨ Новые поступления
          </h1>
          <p className="text-xl mb-4">
            Свежие идеи для вашего дома - только что появились в нашем каталоге
          </p>
          <div className="flex justify-center items-center space-x-4 text-sm">
            <div className="bg-white/20 rounded px-3 py-1">
              🆕 Первыми узнавайте о новинках
            </div>
            <div className="bg-white/20 rounded px-3 py-1">
              🎨 Современный дизайн
            </div>
            <div className="bg-white/20 rounded px-3 py-1">
              ⭐ Высокое качество
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Фильтры */}
          <div className="lg:w-1/4">
            <ProductFilters 
              filters={{
                priceRange: { min: 0, max: 15000 },
                materials: ['дерево', 'металл', 'ткань', 'керамика', 'стекло'],
                countries: ['Россия', 'Италия', 'Франция', 'Германия', 'Китай']
              }}
              currentPath="/new"
            />
            
            {/* Информационный блок */}
            <div className="bg-gradient-to-br from-green-400 to-blue-500 text-white rounded-lg p-6 mt-6">
              <h3 className="font-bold text-lg mb-2">📬 Подпишитесь на новинки!</h3>
              <p className="text-sm mb-3">
                Узнавайте первыми о поступлении новых товаров
              </p>
              <button className="bg-white text-gray-800 px-4 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
                Подписаться
              </button>
            </div>
          </div>

          {/* Основной контент */}
          <div className="lg:w-3/4">
            {/* Статистика */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-wrap justify-between items-center">
                <div className="text-gray-600">
                  Новых товаров: <span className="font-semibold text-gray-900">{productsData.meta.total}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-blue-600 font-medium">
                    🔥 Горячие новинки
                  </div>
                  <div className="text-green-600 font-medium">
                    ✅ В наличии
                  </div>
                </div>
              </div>
            </div>

            {/* Сетка товаров */}
            {productsData.data.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsData.data.map((product: Product) => (
                  <ProductCardClient key={product.id} product={product} isNew={true} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Новые товары не найдены
                </h3>
                <p className="text-gray-600 mb-4">
                  Попробуйте изменить параметры поиска или загляните позже
                </p>
                <a 
                  href="/catalog"
                  className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors inline-block"
                >
                  Перейти к каталогу
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Преимущества новинок */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-2">Актуальные тренды</h3>
            <p className="text-gray-600 text-sm">
              Следим за мировыми тенденциями в дизайне интерьера
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-2">Быстрые поставки</h3>
            <p className="text-gray-600 text-sm">
              Новинки поступают к нам быстро и без задержек
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="font-semibold text-gray-900 mb-2">Отборное качество</h3>
            <p className="text-gray-600 text-sm">
              Только проверенные производители и лучшие материалы
            </p>
          </div>
        </div>

        {/* Новостная рассылка */}
        <div className="mt-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">📧 Не пропустите новинки!</h2>
            <p className="mb-6">
              Подпишитесь на нашу рассылку и узнавайте о новых поступлениях первыми. 
              Также вы будете получать эксклюзивные предложения и советы по декору.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Ваш email"
                className="flex-1 px-4 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-purple-600 px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
                Подписаться
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
