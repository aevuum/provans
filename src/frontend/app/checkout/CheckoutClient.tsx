'use client';

import { getProductImage } from '../../types';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppSelector } from '../../lib/hooks';
import { useCheckout } from '../../hooks/useCheckout';

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useAppSelector((state) => state.cart.items);

  const { formData, errors, isPending, handleChange, startPayment } = useCheckout();

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Корзина пуста</h1>
        <button
          onClick={() => router.push('/catalog/все-категории')}
          className="bg-[#B8835A] text-white px-6 py-3 rounded-lg hover:bg-[#9d6e47] transition-colors"
        >
          Перейти к покупкам
        </button>
      </div>
    );
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.count || 1), 0);
  const shippingCost = 350;
  const total = subtotal + shippingCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cartItems = cart.map((item) => ({
      id: item.id.toString(),
      title: item.title,
      price: item.price,
      count: item.count,
    }));
    startPayment(cartItems);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Оплата заказа</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Контактная информация</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Имя *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8835A] ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8835A] ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8835A] ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8835A] ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#B8835A] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#9d6e47] transition-colors disabled:opacity-50"
          >
            {isPending ? 'Создаём платёж...' : `ОПЛАТИТЬ ${total.toLocaleString('ru-RU')} ₽`}
          </button>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Ваш заказ</h2>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {cart.map((item) => {
                const mainImage = getProductImage(item);
                return (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <Image src={mainImage} alt={item.title} width={48} height={48} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-gray-500">
                        {item.count || 1} × {item.price.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                    <p className="text-sm font-bold">{(item.price * (item.count || 1)).toLocaleString('ru-RU')} ₽</p>
                  </div>
                );
              })}
            </div>

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
      </form>
    </div>
  );
}