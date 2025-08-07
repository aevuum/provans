'use client';

import { useState, useEffect } from 'react';
import { SafeImage } from '@/components/SafeImage';
import { Product } from '@/types';

const CATEGORIES = [
  { id: 'vases', name: 'Вазы', icon: '🏺' },
  { id: 'candles', name: 'Подсвечники', icon: '🕯️' },
  { id: 'frames', name: 'Рамки', icon: '🖼️' },
  { id: 'flowers', name: 'Цветы', icon: '🌸' },
  { id: 'boxes', name: 'Шкатулки', icon: '📦' },
  { id: 'figurines', name: 'Фигурки', icon: '🎭' }
];

const ACTIONS = [
  { id: 'approve', name: 'Одобрить товар', icon: '✅', color: 'bg-green-500 hover:bg-green-600' },
  { id: 'approve_all', name: 'Одобрить все', icon: '🎯', color: 'bg-blue-500 hover:bg-blue-600' }
];

export default function ModerationPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchUncategorizedProducts();
  }, []);

  const fetchUncategorizedProducts = async () => {
    try {
      const response = await fetch('/api/admin/products/uncategorized');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  const categorizeProduct = async (productId: number, categoryName: string) => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}/categorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          categoryName,
          isNew: true // Помечаем как новый товар
        }),
      });

      if (!response.ok) throw new Error('Failed to categorize product');
      
      // Переходим к следующему товару
      if (currentIndex < products.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Перезагружаем список
        await fetchUncategorizedProducts();
        setCurrentIndex(0);
      }
      
    } catch (error) {
      console.error('Ошибка категоризации:', error);
      alert('Ошибка при категоризации товара');
    } finally {
      setProcessing(false);
    }
  };

  const approveProduct = async (productId: number) => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isNew: true }),
      });

      if (!response.ok) throw new Error('Failed to approve product');
      
      // Переходим к следующему товару
      if (currentIndex < products.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        await fetchUncategorizedProducts();
        setCurrentIndex(0);
      }
      
    } catch (error) {
      console.error('Ошибка одобрения:', error);
      alert('Ошибка при одобрении товара');
    } finally {
      setProcessing(false);
    }
  };

  const approveAllProducts = async () => {
    if (!confirm('Одобрить все оставшиеся товары?')) return;
    
    setProcessing(true);
    try {
      const response = await fetch('/api/admin/products/approve-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productIds: products.map(p => p.id),
          isNew: true 
        }),
      });

      if (!response.ok) throw new Error('Failed to approve all products');
      
      await fetchUncategorizedProducts();
      setCurrentIndex(0);
      
    } catch (error) {
      console.error('Ошибка массового одобрения:', error);
      alert('Ошибка при одобрении товаров');
    } finally {
      setProcessing(false);
    }
  };

  const skipProduct = () => {
    if (currentIndex < products.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Загрузка товаров для модерации...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2">Все товары обработаны!</h1>
          <p className="text-gray-600">Нет товаров, требующих категоризации</p>
        </div>
      </div>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Модерация товаров</h1>
            <div className="text-sm text-gray-600">
              {currentIndex + 1} из {products.length}
            </div>
          </div>

          {currentProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Изображение товара */}
              <div className="space-y-4">
                <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
                  <SafeImage
                    src={currentProduct.image || '/placeholder.png'}
                    alt={currentProduct.title}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Дополнительные изображения */}
                {currentProduct.images && currentProduct.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {currentProduct.images.slice(0, 4).map((img, idx) => (
                      <div key={idx} className="relative h-20 bg-gray-100 rounded overflow-hidden">
                        <SafeImage
                          src={img}
                          alt={`${currentProduct.title} ${idx + 2}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Информация о товаре */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-2">{currentProduct.title}</h2>
                  <p className="text-gray-600 text-sm">ID: {currentProduct.id}</p>
                  {currentProduct.description && (
                    <p className="text-gray-700 mt-2">{currentProduct.description}</p>
                  )}
                </div>

                <div className="text-lg font-semibold text-green-600">
                  {currentProduct.price?.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
                </div>

                {/* Выбор категории */}
                <div>
                  <h3 className="font-semibold mb-4">Выберите категорию:</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => categorizeProduct(currentProduct.id, category.name)}
                        disabled={processing}
                        className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50"
                      >
                        <span className="text-2xl">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Кнопки одобрения для товаров без фото */}
                {(!currentProduct.image || currentProduct.image === '') && (
                  <div>
                    <h3 className="font-semibold mb-4 text-orange-600">Товар без фотографии:</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {ACTIONS.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => action.id === 'approve' ? approveProduct(currentProduct.id) : approveAllProducts()}
                          disabled={processing}
                          className={`flex items-center space-x-2 p-3 text-white rounded-lg transition-colors disabled:opacity-50 ${action.color}`}
                        >
                          <span className="text-xl">{action.icon}</span>
                          <span className="font-medium">{action.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Кнопки управления */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={skipProduct}
                    disabled={processing}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Пропустить
                  </button>
                  <button
                    onClick={() => categorizeProduct(currentProduct.id, 'Другое')}
                    disabled={processing}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    Другое
                  </button>
                </div>

                {processing && (
                  <div className="text-center text-blue-600">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    Обработка...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Прогресс */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Прогресс</span>
            <span>{Math.round(((currentIndex + 1) / products.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / products.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
