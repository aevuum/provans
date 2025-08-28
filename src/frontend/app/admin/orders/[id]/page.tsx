'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaPrint, FaEnvelope } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import { Order, OrderStatus } from '../../../../types';

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const resolvedParams = use(params);
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Загрузка заказа
  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${resolvedParams.id}`);
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.order);
      } else {
        router.push('/admin/orders');
      }
    } catch (_error) {
      console.error('Error fetching order:', _error);
      router.push('/admin/orders');
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, router]);

  useEffect(() => {
    if (resolvedParams.id) {
      fetchOrder();
    }
  }, [resolvedParams.id, fetchOrder]);

  // Проверка доступа
  if (!session || (session.user as { role?: string })?.role !== 'admin') {
    router.push('/admin');
    return null;
  }

  // Обновление статуса заказа
  const updateOrderStatus = async (newStatus: OrderStatus, trackingNumber?: string) => {
    if (!order) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: newStatus,
          ...(trackingNumber && { trackingNumber })
        })
      });

      if (response.ok) {
        fetchOrder(); // Перезагружаем заказ
      } else {
        alert('Ошибка при обновлении статуса заказа');
      }
    } catch (_error) {
      console.error('Error updating order:', _error);
      alert('Ошибка при обновлении статуса заказа');
    } finally {
      setUpdating(false);
    }
  };

  // Перевод статусов
  const getStatusText = (status: OrderStatus) => {
    const statusMap = {
      [OrderStatus.PENDING]: 'Ожидает подтверждения',
      [OrderStatus.CONFIRMED]: 'Подтвержден',
      [OrderStatus.PROCESSING]: 'В обработке',
      [OrderStatus.SHIPPED]: 'Отправлен',
      [OrderStatus.DELIVERED]: 'Доставлен',
      [OrderStatus.CANCELLED]: 'Отменен',
      [OrderStatus.REFUNDED]: 'Возврат средств'
    };
    return statusMap[status] || status;
  };

  // Цвета статусов
  const getStatusColor = (status: OrderStatus) => {
    const colorMap = {
      [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800 border-blue-200',
      [OrderStatus.PROCESSING]: 'bg-purple-100 text-purple-800 border-purple-200',
      [OrderStatus.SHIPPED]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800 border-green-200',
      [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-200',
      [OrderStatus.REFUNDED]: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8835A]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Заказ не найден</h1>
          <Link
            href="/admin/orders"
            className="bg-[#B8835A] text-white px-6 py-2 rounded-lg hover:bg-[#9d6e47] cursor-pointer"
          >
            Назад к заказам
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/orders"
              className="text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              <FaArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Заказ #{order.orderNumber}
              </h1>
              <p className="text-gray-600">
                от {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 cursor-pointer">
              <FaPrint className="w-4 h-4" />
              <span>Печать</span>
            </button>
            <button className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer">
              <FaEnvelope className="w-4 h-4" />
              <span>Email</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Статус заказа */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Статус заказа</h2>
              <div className="flex items-center space-x-4 mb-4">
                <span className={`px-4 py-2 rounded-lg border text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
                {order.trackingNumber && (
                  <div>
                    <span className="text-gray-600 text-sm">Трек-номер: </span>
                    <span className="font-mono text-sm">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(e.target.value as OrderStatus)}
                  disabled={updating}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8835A] cursor-pointer"
                >
                  <option value="PENDING">Ожидает подтверждения</option>
                  <option value="CONFIRMED">Подтвержден</option>
                  <option value="PROCESSING">В обработке</option>
                  <option value="SHIPPED">Отправлен</option>
                  <option value="DELIVERED">Доставлен</option>
                  <option value="CANCELLED">Отменен</option>
                  <option value="REFUNDED">Возврат средств</option>
                </select>
                
                {order.status === 'SHIPPED' && (
                  <input
                    type="text"
                    placeholder="Трек-номер"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8835A]"
                    onBlur={(e) => {
                      if (e.target.value) {
                        updateOrderStatus(order.status, e.target.value);
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {/* Товары */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Товары ({order.items.length})</h2>
              <div className="space-y-4">
                {order.items.map((item) => {
                  const productImage = item.product?.image || '/placeholder.jpg';
                  return (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={productImage}
                          alt={item.product?.title || 'Товар'}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {item.product?.title || `Товар ID: ${item.productId}`}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Количество: {item.quantity} шт.
                        </p>
                        <p className="text-sm text-gray-600">
                          Цена: {item.price.toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Итоги */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Товары:</span>
                    <span>{order.subtotal.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Доставка:</span>
                    <span>{order.shippingCost.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Итого:</span>
                    <span>{order.total.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Комментарии */}
            {order.notes && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Комментарий к заказу</h2>
                <p className="text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            
            {/* Информация о покупателе */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Покупатель</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Имя:</span>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{order.customerEmail}</p>
                </div>
                
                {order.customerPhone && (
                  <div>
                    <span className="text-gray-600">Телефон:</span>
                    <p className="font-medium">{order.customerPhone}</p>
                  </div>
                )}
                
                {order.customerAddress && (
                  <div>
                    <span className="text-gray-600">Адрес:</span>
                    <p className="font-medium">{order.customerAddress}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Доставка и оплата */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Доставка и оплата</h2>
              <div className="space-y-3">
                {order.shippingMethod && (
                  <div>
                    <span className="text-gray-600">Способ доставки:</span>
                    <p className="font-medium">
                      {order.shippingMethod === 'courier' && 'Курьерская доставка'}
                      {order.shippingMethod === 'pickup' && 'Самовывоз'}
                      {order.shippingMethod === 'post' && 'Почта России'}
                    </p>
                  </div>
                )}
                
                {order.paymentMethod && (
                  <div>
                    <span className="text-gray-600">Способ оплаты:</span>
                    <p className="font-medium">
                      {order.paymentMethod === 'card' && 'Банковская карта'}
                      {order.paymentMethod === 'online' && 'Онлайн-платеж'}
                      {order.paymentMethod === 'cash' && 'Наличные при получении'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* История изменений */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">История</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Создан:</span>
                  <span className="text-gray-600">
                    {new Date(order.createdAt).toLocaleString('ru-RU')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Обновлен:</span>
                  <span className="text-gray-600">
                    {new Date(order.updatedAt).toLocaleString('ru-RU')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
