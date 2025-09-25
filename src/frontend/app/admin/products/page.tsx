// app/admin/products/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaCheck, 
  FaPlus,
  FaFilter,
  FaClock
} from 'react-icons/fa';
import { useProducts } from '@/lib/hooks/useProducts';
import type { Product } from '@/types/index';
import Pagination from '../../components/Pagination';


export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    isConfirmed: '',
    priceFrom: '',
    priceTo: ''
  });

  const {
    products,
    loading,
    meta,
    updateFilters,
    goToPage,
    refetch
  } = useProducts({
    search: filters.search,
    isConfirmed: filters.isConfirmed,
    priceFrom: filters.priceFrom ? Number(filters.priceFrom) : undefined,
    priceTo: filters.priceTo ? Number(filters.priceTo) : undefined,
    limit: 20
  });

  // Применение фильтров
  const applyFilters = () => {
    updateFilters({
      search: filters.search,
      isConfirmed: filters.isConfirmed,
      priceFrom: filters.priceFrom ? Number(filters.priceFrom) : undefined,
      priceTo: filters.priceTo ? Number(filters.priceTo) : undefined
    });
  };

  // Сброс фильтров
  const resetFilters = () => {
    const emptyFilters = {
      search: '',
      isConfirmed: '',
      priceFrom: '',
      priceTo: ''
    };
    setFilters(emptyFilters);
    updateFilters({
      search: '',
      priceFrom: undefined,
      priceTo: undefined,
      isConfirmed: ''
    });
  };

  // Выбор всех товаров на странице
  const selectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p: Product) => String(p.id)));
    }
  };

  // Массовые операции
  const bulkOperation = async (action: 'confirm' | 'unconfirm' | 'delete') => {
    if (selectedProducts.length === 0) return;

    try {
      const response = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: selectedProducts,
          action
        })
      });

      if (response.ok) {
        setSelectedProducts([]);
        refetch();
      } else {
        alert('Ошибка при выполнении операции');
      }
    } catch (_error) {
      console.error('Bulk operation error:', _error);
      alert('Ошибка при выполнении операции');
    }
  };

  // Удаление отдельного товара
  const deleteProduct = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        refetch();
      } else {
        alert('Ошибка при удалении товара');
      }
    } catch (_error) {
      console.error('Delete error:', _error);
      alert('Ошибка при удалении товара');
    }
  };

  // Переключение статуса подтверждения
  const toggleConfirm = async (id: number, isConfirmed: boolean | undefined) => {
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isConfirmed: !isConfirmed })
      });

      if (response.ok) {
        refetch();
      } else {
        alert('Ошибка при изменении статуса');
      }
    } catch (_error) {
      console.error('Toggle confirm error:', _error);
      alert('Ошибка при изменении статуса');
    }
  };

  if (status === 'loading') {
    return <AdminProductsLoading />;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session || !(session.user && 'role' in session.user && (session.user as any).role === 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">Нет доступа</h1>
          <Link href="/" className="text-blue-600 hover:underline">На главную</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Назад
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Управление товарами</h1>
                <p className="text-gray-600">
                  {meta ? `${meta.total} товаров, страница ${meta.page} из ${meta.totalPages}` : ''}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaFilter className="mr-2" />
                Фильтры
              </button>
              <Link
                href="/admin/products/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#B8835A] hover:bg-[#9d6e47]"
              >
                <FaPlus className="mr-2" />
                Добавить товар
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Фильтры */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Поиск по названию
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8835A]"
                  placeholder="Название товара..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Статус
                </label>
                <select
                  value={filters.isConfirmed}
                  onChange={(e) => setFilters({ ...filters, isConfirmed: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8835A]"
                >
                  <option value="">Все товары</option>
                  <option value="true">Подтвержденные</option>
                  <option value="false">На модерации</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена от
                </label>
                <input
                  type="number"
                  value={filters.priceFrom}
                  onChange={(e) => setFilters({ ...filters, priceFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8835A]"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена до
                </label>
                <input
                  type="number"
                  value={filters.priceTo}
                  onChange={(e) => setFilters({ ...filters, priceTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8835A]"
                  placeholder="999999"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Сбросить
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#B8835A] hover:bg-[#9d6e47]"
              >
                Применить фильтры
              </button>
            </div>
          </div>
        )}

        {/* Массовые операции */}
        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800">
                Выбрано товаров: {selectedProducts.length}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => bulkOperation('confirm')}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Подтвердить
                </button>
                <button
                  onClick={() => bulkOperation('unconfirm')}
                  className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                >
                  Снять подтверждение
                </button>
                <button
                  onClick={() => bulkOperation('delete')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Таблица товаров */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Список товаров</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onChange={selectAll}
                  className="rounded border-gray-300 text-[#B8835A] focus:ring-[#B8835A]"
                />
                <span className="text-sm text-gray-600">Выбрать все</span>
              </div>
            </div>
          </div>

          {loading ? (
            <ProductTableLoading />
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Товары не найдены</h3>
              <p className="text-gray-600">Попробуйте изменить фильтры или добавьте новые товары</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Товар
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Цена
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product: Product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(String(product.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProducts([...selectedProducts, String(product.id)]);
                              } else {
                                setSelectedProducts(selectedProducts.filter(id => id !== String(product.id)));
                              }
                            }}
                            className="mr-4 rounded border-gray-300 text-[#B8835A] focus:ring-[#B8835A]"
                          />
                          <div className="flex items-center">
                            {product.images && product.images.length > 0 && (
                              <Image
                                src={product.images[0]}
                                alt={product.title}
                                width={48}
                                height={48}
                                className="object-cover rounded-lg mr-4"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {product.id}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.price.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleConfirm(product.id, product.isConfirmed)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.isConfirmed
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          }`}
                        >
                          {product.isConfirmed ? (
                            <>
                              <FaCheck className="mr-1" />
                              Подтвержден
                            </>
                          ) : (
                            <>
                              <FaClock className="mr-1" />
                              На модерации
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Просмотр"
                          >
                            <FaEye />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Редактировать"
                          >
                            <FaEdit />
                          </Link>
                          {product.isConfirmed && (
                            <button
                              onClick={() => toggleConfirm(product.id, product.isConfirmed)}
                              className="text-orange-600 hover:text-orange-900"
                              title="Вернуть в модерацию"
                            >
                              <FaClock />
                            </button>
                          )}
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Удалить"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Пагинация */}
        {meta && meta.totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              hasNextPage={meta.hasNextPage}
              hasPrevPage={meta.hasPrevPage}
              onPageChange={goToPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function AdminProductsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductTableLoading() {
  return (
    <div className="p-6">
      <div className="animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 py-4 border-b border-gray-200">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="flex space-x-2">
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}