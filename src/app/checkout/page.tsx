'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { clearCart } from '@/lib/features/cart/cartSlice';
import { addNotification } from '@/lib/features/notifications/notificationSlice';
import { CheckoutFormData } from '@/types/order';
import { FaShoppingCart, FaCreditCard, FaTruck, FaMapMarkerAlt } from 'react-icons/fa';
import Image from 'next/image';
import { getProductImage } from '@/types';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.items);
  
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    region: '',
    shippingMethod: 'courier',
    paymentMethod: 'card',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});

  // Расчет стоимости
  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.count || 1), 0);
  // Доставка по Владимиру — 350 ₽, по России — от 300 ₽ (зависит от региона и веса)
  // Бесплатная доставка и порог убраны
  const shippingCost = 350;
  const total = subtotal + shippingCost;

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'Обязательное поле';
    if (!formData.lastName.trim()) newErrors.lastName = 'Обязательное поле';
    if (!formData.email.trim()) newErrors.email = 'Обязательное поле';
    if (!formData.phone.trim()) newErrors.phone = 'Обязательное поле';
    if (!formData.address.trim()) newErrors.address = 'Обязательное поле';
    if (!formData.city.trim()) newErrors.city = 'Обязательное поле';
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }
    
    if (formData.phone && !/^[+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Неверный формат телефона';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (cart.length === 0) return;

    setLoading(true);

    try {
      // Создаем заказ
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          customerAddress: `${formData.address}, ${formData.city}, ${formData.postalCode}, ${formData.region}`,
          shippingMethod: formData.shippingMethod,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.count || 1,
            price: item.price
          }))
        })
      });

      const orderResult = await orderResponse.json();

      if (orderResult.success) {
        const order = orderResult.order;
        
        // Если выбрана оплата картой, создаем платеж
        if (formData.paymentMethod === 'card') {
          const paymentResponse = await fetch('/api/payments/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: total,
              orderId: order.orderNumber,
              customerEmail: formData.email,
              returnUrl: typeof window !== 'undefined' 
                ? `${window.location.origin}/checkout/success`
                : '/checkout/success'
            })
          });

          const paymentResult = await paymentResponse.json();

          if (paymentResult.success) {
            // Перенаправляем на страницу оплаты
            if (typeof window !== 'undefined') {
              window.location.href = paymentResult.payment.confirmation.confirmation_url;
            }
            return;
          } else {
            throw new Error('Ошибка при создании платежа');
          }
        } else {
          // Для других методов оплаты - показываем успешное оформление
          setOrderNumber(order.orderNumber);
          setOrderComplete(true);
          dispatch(clearCart());
          dispatch(addNotification({
            type: 'success',
            message: `Заказ №${order.orderNumber} успешно оформлен!`
          }));
        }
      } else {
        dispatch(addNotification({
          type: 'error',
          message: 'Ошибка при оформлении заказа: ' + orderResult.error
        }));
      }
    } catch (_error) {
      console.error('Checkout error:', _error);
      dispatch(addNotification({
        type: 'error',
        message: 'Произошла ошибка при оформлении заказа'
      }));
    } finally {
      setLoading(false);
    }
  };

  // Обработка изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Очищаем ошибку при изменении поля
    if (errors[name as keyof CheckoutFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Если корзина пуста
  if (cart.length === 0 && !orderComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <FaShoppingCart className="mx-auto text-6xl text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Корзина пуста</h1>
          <p className="text-gray-600 mb-6">Добавьте товары в корзину для оформления заказа</p>
          <button
            onClick={() => router.push('/catalog/все-категории')}
            className="bg-[#B8835A] text-white px-6 py-3 rounded-lg hover:bg-[#9d6e47] transition-colors"
          >
            Перейти к покупкам
          </button>
        </div>
      </div>
    );
  }

  // Страница успешного заказа
  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            <h1 className="text-2xl font-bold mb-2">🎉 Заказ успешно оформлен!</h1>
            <p className="text-lg">Номер заказа: <strong>{orderNumber}</strong></p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Что дальше?</h2>
            <div className="space-y-3 text-left">
              <p>📧 На ваш email отправлено подтверждение заказа</p>
              <p>📞 Мы свяжемся с вами в течение 2 часов для подтверждения</p>
              <p>📦 Заказ будет собран и отправлен в течение 1-2 рабочих дней</p>
              <p>🚚 Вы получите уведомление с трек-номером для отслеживания</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/catalog/все-категории')}
              className="bg-[#B8835A] text-white px-6 py-3 rounded-lg hover:bg-[#9d6e47] transition-colors"
            >
              Продолжить покупки
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Мои заказы
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Оформление заказа</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Форма оформления */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Личная информация */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-[#B8835A]" />
                Контактная информация
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Имя *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8835A] ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Введите имя"
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Фамилия *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8835A] ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Введите фамилию"
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8835A] ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="example@mail.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8835A] ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+7 (999) 123-45-67"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Адрес доставки */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaTruck className="mr-2 text-[#B8835A]" />
                Адрес доставки
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Адрес *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8835A] ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Улица, дом, квартира"
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Город *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8835A] ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Владимир"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Индекс
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8835A]"
                    placeholder="123456"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Регион
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8835A]"
                    placeholder="Владимирская область"
                  />
                </div>
              </div>
            </div>

            {/* Способ доставки и оплаты */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaCreditCard className="mr-2 text-[#B8835A]" />
                Доставка и оплата
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Способ доставки
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="courier"
                        checked={formData.shippingMethod === 'courier'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span>Курьерская доставка</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="pickup"
                        checked={formData.shippingMethod === 'pickup'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span>Самовывоз</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="post"
                        checked={formData.shippingMethod === 'post'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span>Почта России</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Способ оплаты
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span>Банковская карта</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={formData.paymentMethod === 'online'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span>Онлайн-платеж</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={formData.paymentMethod === 'cash'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span>Наличные при получении</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Комментарий к заказу
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8835A]"
                  placeholder="Дополнительные пожелания или инструкции"
                />
              </div>
            </div>

            {/* Кнопка отправки */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#B8835A] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#9d6e47] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Оформление заказа...' : 'ОФОРМИТЬ ЗАКАЗ'}
            </button>
          </form>
        </div>

        {/* Сводка заказа */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Ваш заказ</h2>
            
            {/* Товары */}
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {cart.map((item) => {
                const mainImage = getProductImage(item);
                return (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={mainImage}
                        alt={item.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-gray-500">
                        {item.count || 1} × {item.price.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                    <p className="text-sm font-bold">
                      {(item.price * (item.count || 1)).toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                );
              })}
            </div>
            
            {/* Итоги */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Товары:</span>
                <span>{subtotal.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Доставка:</span>
                <span>{shippingCost.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Итого:</span>
                <span>{total.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
