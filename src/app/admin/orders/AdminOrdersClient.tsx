'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Order, OrderStatus } from '@/types/order';
import { FaEye, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import Link from 'next/link';

export default function AdminOrdersClient() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Загрузка заказов
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const _params = new URLSearchParams({
        page: filters.page.toString(),
        limit: '10',
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`/api/orders?${_params}`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
        setPagination(data.pagination);
      }
    } catch (_error) {
      console.error('Error fetching orders:', _error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Проверка доступа
  if (!session || (session.user as { role?: string })?.role !== 'admin') {
    router.push('/admin');
    return null;
  }

  // Обновление статуса заказа
  const updateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchOrders(); // Перезагружаем заказы
      } else {
        alert('Ошибка при обновлении статуса заказа');
      }
    } catch (_error) {
      console.error('Error updating order status:', _error);
      alert('Ошибка при обновлении статуса заказа');
    }
  };

  // Удаление заказа
  const deleteOrder = async (orderId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот заказ?')) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchOrders();
      } else {
        alert('Ошибка при удалении заказа');
      }
    } catch (_error) {
      console.error('Error deleting order:', _error);
      alert('Ошибка при удалении заказа');
    }
  };

  // Цвета статусов
  const getStatusColor = (status: OrderStatus) => {
    const colorMap: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
      [OrderStatus.PROCESSING]: 'bg-purple-100 text-purple-800',
      [OrderStatus.SHIPPED]: 'bg-indigo-100 text-indigo-800',
      [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
      [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
      [OrderStatus.REFUNDED]: 'bg-gray-100 text-gray-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Управление заказами</h1>
          <Link
            href="/admin"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors cursor-pointer"
          >
            Назад в админку
          </Link>
        </div>

        {/* Фильтры */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск по номеру заказа, email, имени..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8835A]"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8835A] cursor-pointer"
              >
                <option value="">Все статусы</option>
                <option value="PENDING">Ожидает</option>
                <option value="CONFIRMED">Подтвержден</option>
                <option value="PROCESSING">В обработке</option>
                <option value="SHIPPED">Отправлен</option>
                <option value="DELIVERED">Доставлен</option>
                <option value="CANCELLED">Отменен</option>
                <option value="REFUNDED">Возврат</option>
              </select>
            </div>
          </div>
        </div>

        {/* Таблица заказов */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8835A]"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Заказ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Покупатель
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Сумма
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{order.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.items.length} товар(ов)
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customerEmail}
                          </div>
                          {order.customerPhone && (
                            <div className="text-sm text-gray-500">
                              {order.customerPhone}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {order.total} ₽
                        </div>
                        {order.shippingCost > 0 && (
                          <div className="text-xs text-gray-500">
                            + {order.shippingCost} ₽ доставка
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${getStatusColor(order.status)}`}
                        >
                          <option value="PENDING">Ожидает</option>
                          <option value="CONFIRMED">Подтвержден</option>
                          <option value="PROCESSING">В обработке</option>
                          <option value="SHIPPED">Отправлен</option>
                          <option value="DELIVERED">Доставлен</option>
                          <option value="CANCELLED">Отменен</option>
                          <option value="REFUNDED">Возврат</option>
                        </select>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-[#B8835A] hover:text-[#9d6e47] cursor-pointer"
                          >
                            <FaEye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="text-red-600 hover:text-red-900 cursor-pointer"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Пагинация */}
            {pagination.pages > 1 && (
              <div className="bg-white px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Показано {Math.min(pagination.limit, pagination.total)} из {pagination.total} заказов
                  </div>
                  <div className="flex space-x-2">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setFilters(prev => ({ ...prev, page }))}
                        className={`px-3 py-1 rounded-md text-sm cursor-pointer ${
                          page === pagination.page
                            ? 'bg-[#B8835A] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {orders.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Заказов не найдено</h2>
            <p className="text-gray-600">
              Пока что нет заказов, соответствующих выбранным фильтрам
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
