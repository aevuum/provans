'use client';


import { FaHeart, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import Image from 'next/image';
import { addToCart, decrementCount, removeFromCart } from '../../lib/features/cart/cartSlice';
import { toggleFavorite } from '../../lib/features/favorites/favoritesSlice';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';

export default function CartPage() {
  const cart = useAppSelector((state) => state.cart.items);
  const favorites = useAppSelector((state) => state.favorites.items);
  const dispatch = useAppDispatch();

  const cartTotal = cart.reduce((sum, item) => sum + item.price * (item.count || 1), 0);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
      <h1 className="text-2xl font-bold mb-6">Ваша корзина</h1>
      {cart.length === 0 ? (
        <div className="text-center text-gray-400 py-12">Ваша корзина пуста</div>
      ) : (
        <div className="space-y-6">
          {cart.map((item) => {
            const isFavorite = favorites.some((fav) => fav.id === item.id);
            return (
              <div key={item.id} className="flex flex-col sm:flex-row items-center border-b pb-4 gap-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={item.image || '/images/no-image.png'}
                    alt={item.title}
                    fill
                    className="object-contain rounded"
                    sizes="(max-width: 640px) 96px, 120px"
                  />
                </div>
                <div className="flex-1 w-full">
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-gray-500 text-sm">{item.price.toLocaleString('ru-RU')} ₽ x {item.count}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      className="p-2 rounded bg-gray-100 hover:bg-gray-200"
                      onClick={() => dispatch(decrementCount(item.id))}
                      disabled={item.count <= 1}
                    >
                      <FaMinus />
                    </button>
                    <span className="px-2">{item.count}</span>
                    <button
                      className="p-2 rounded bg-gray-100 hover:bg-gray-200"
                      onClick={() => dispatch(addToCart(item))}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
                <div className="flex flex-row items-center gap-2 mt-2 sm:mt-0">
                  <button
                    className={`mr-2 ${isFavorite ? 'text-[#7C5C27]' : 'text-gray-400'} hover:text-[#7C5C27]`}
                    onClick={() => dispatch(toggleFavorite(item))}
                    aria-label="В избранное"
                  >
                    <FaHeart />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => dispatch(removeFromCart(item.id))}
                    aria-label="Удалить"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })}
          <div className="flex flex-col sm:flex-row justify-end items-end mt-6 gap-2">
            <span className="text-lg font-bold mr-4">Итого:</span>
            <span className="text-2xl font-bold">{cartTotal.toLocaleString('ru-RU')} ₽</span>
          </div>
          <button 
            className="w-full bg-[#B8835A] text-white py-3 rounded-lg font-bold text-lg mt-4 hover:bg-[#9d6e47] transition-colors cursor-pointer"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/checkout';
              }
            }}
          >
            ПЕРЕЙТИ К ОФОРМЛЕНИЮ
          </button>
        </div>
      )}
    </div>
  );
}