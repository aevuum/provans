'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaCheck, FaTimes, FaEdit, FaEye } from 'react-icons/fa';
import { Product } from '@/types';

export default function ModerationPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [moderating, setModerating] = useState<number | null>(null);

  const fetchPendingProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/products?status=pending&limit=500');
      if (response.ok) {
        const result = await response.json();
        // API возвращает объект с data и meta
        const products = result.data || result;
        console.log('Loaded pending products:', products.length);
        setProducts(products);
      } else {
        console.error('Failed to fetch products:', response.status, response.statusText);
        if (response.status === 403) {
          router.push('/admin');
        }
      }
    } catch (_error) {
      console.error('Error fetching products:', _error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session || !(session.user && 'role' in session.user && (session.user as any).role === 'admin')) {
      router.push('/admin');
      return;
    }

    fetchPendingProducts();
  }, [session, router, fetchPendingProducts]);

  const handleApprove = async (productId: number) => {
    // Найдем товар для проверки
    const product = products.find(p => p.id === productId);
    
    // Проверяем наличие фото
    if (!product?.images || product.images.length === 0 || 
        !product.images.some(img => img && img.trim() !== '')) {
      alert('Ошибка: Товар не может быть одобрен без фотографии! Добавьте хотя бы одно изображение.');
      return;
    }

    setModerating(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}/approve`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
      } else {
        const data = await response.json();
        alert(`Ошибка при одобрении: ${data.message || 'Неизвестная ошибка'}`);
      }
    } catch (_error) {
      console.error('Error approving product:', _error);
      alert('Ошибка при одобрении товара');
    } finally {
      setModerating(null);
    }
  };

  const handleReject = async (productId: number) => {
    setModerating(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
      }
    } catch (_error) {
      console.error('Error rejecting product:', _error);
    } finally {
      setModerating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Модерация товаров</h1>
                <p className="text-gray-600">Товары ожидающие подтверждения</p>
              </div>
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                {products.length} товаров на модерации
              </div>
            </div>
          </div>
        </div>

        {/* Products List */}
        {products.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Все товары проверены!</h3>
            <p className="text-gray-600">Нет товаров ожидающих модерации.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white shadow rounded-lg overflow-hidden">
                {/* Product Image */}
                <div className="relative h-56 bg-gray-100 flex items-center justify-center">
                  {product.image && product.image.startsWith('/') ? (
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={(e) => {
                        console.error('Image failed to load:', product.image);
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <FaEye className="w-8 h-8 mb-2" />
                      <span className="text-sm">
                        {product.image ? 'Неверный путь к изображению' : 'Нет изображения'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                  
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Цена:</span>
                      <span className="font-medium">{product.price.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    {product.category && (
                      <div className="flex justify-between">
                        <span>Категория:</span>
                        <span className="font-medium">{product.category}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Артикул:</span>
                      <span className="font-medium">{product.barcode}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(product.id)}
                      disabled={moderating === product.id}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-1"
                    >
                      <FaCheck />
                      <span>Одобрить</span>
                    </button>
                    <button
                      onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                      className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleReject(product.id)}
                      disabled={moderating === product.id}
                      className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
