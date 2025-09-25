'use client';


import { FaHeart, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import Image from 'next/image';
import { addToCart, decrementCount, removeFromCart, setGiftWrap } from '../../lib/features/cart/cartSlice';
import { toggleFavorite } from '../../lib/features/favorites/favoritesSlice';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import type { RootState } from '@/lib/store';

export default function CartPage() {
  const cart = useAppSelector((state: RootState) => state.cart.items);
  const favorites = useAppSelector((state: RootState) => state.favorites.items);
  const dispatch = useAppDispatch();

  const giftWrap = useAppSelector((state: RootState) => state.cart.giftWrap);
  const giftPrices: Record<string, number> = { S: 500, M: 1000, L: 1500 };
  const giftPrice = giftWrap && giftWrap.size ? giftPrices[giftWrap.size] || 0 : 0;

  // cartTotal was unused; totals are computed below as totalBeforeDiscount and payable

  // Discount thresholds
  const totalBeforeDiscount = cart.reduce((sum: number, item: { price: number; count?: number }) => sum + item.price * (item.count || 1), 0) + giftPrice;
  let discountPercent = 0;
  if (totalBeforeDiscount >= 50000) discountPercent = 10;
  else if (totalBeforeDiscount >= 30000) discountPercent = 7;
  else if (totalBeforeDiscount >= 10000) discountPercent = 5;
  else if (totalBeforeDiscount >= 2000) discountPercent = 3;

  const discountAmount = Math.round((totalBeforeDiscount * discountPercent) / 100);
  const payable = totalBeforeDiscount - discountAmount;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
      {cart.length === 0 ? (
        <div className="text-center text-gray-400 py-12">Корзина пуста</div>
      ) : (
        <div className="space-y-6">
          {cart.map((item: import('../../lib/features/cart/cartSlice').CartItem) => {
            const isFavorite = favorites.some((fav: import('../../../types').Product) => fav.id === item.id);
            return (
              // keep row layout and prevent wrapping so image stays left on mobile
              <div key={item.id} className="flex flex-row flex-nowrap items-start border-b pb-4 gap-4">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 overflow-hidden rounded bg-white">
                  <Image
                    src={item.image || '/images/no-image.png'}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                  <div className="flex-1 min-w-0 flex flex-col items-start">
                    <div className="font-semibold text-base leading-snug line-clamp-2 break-words max-w-full">{item.title}</div>
                    <div className="text-gray-600 text-sm mt-1">
                      {item.originalPrice ? (
                        <>
                          <span className="line-through mr-2 opacity-70">{(item.originalPrice).toLocaleString('ru-RU')} ₽</span>
                          <span className="font-semibold text-[#7C5C27]">{item.price.toLocaleString('ru-RU')} ₽</span>
                        </>
                      ) : (
                        <span className="font-medium">{item.price.toLocaleString('ru-RU')} ₽</span>
                      )} x {item.count}
                    </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      className="p-2 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer"
                      onClick={() => dispatch(decrementCount(item.id))}
                      disabled={item.count <= 1}
                    >
                      <FaMinus />
                    </button>
                    <span className="px-2">{item.count}</span>
                    <button
                      className="p-2 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer"
                      onClick={() => dispatch(addToCart(item))}
                      disabled={(typeof item.quantity === 'number' && item.quantity > 0) && ((item.quantity - (item.reserved || 0)) <= (item.count || 0))}
                      title={(typeof item.quantity === 'number' && item.quantity > 0) && ((item.quantity - (item.reserved || 0)) <= (item.count || 0)) ? 'Достигнут лимит наличия' : 'Добавить'}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-col items-center sm:items-end gap-3 mt-0 ml-auto">
                  <button
                    className={`${isFavorite ? 'text-[#7C5C27]' : 'text-gray-400'} hover:text-[#7C5C27]`}
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
            <div className="text-right">
              <div className="text-sm text-gray-500">Сумма товаров: {totalBeforeDiscount.toLocaleString('ru-RU')} ₽</div>
              <div className="text-sm text-gray-500">Скидка: {discountPercent}% — {discountAmount.toLocaleString('ru-RU')} ₽</div>
              <div className="text-lg font-bold">Итого к оплате: <span className="text-2xl">{payable.toLocaleString('ru-RU')} ₽</span></div>
            </div>
          </div>
          {/* Gift wrap selector */}
          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold mb-2">Подарочная упаковка</h3>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!giftWrap}
                  onChange={(e) => {
                    if (!e.target.checked) dispatch(setGiftWrap(null));
                    else dispatch(setGiftWrap({ size: 'S' }));
                  }}
                />
                <span className="text-sm">Добавить подарочную упаковку</span>
              </label>
            </div>
            {giftWrap && (
              <div className="mt-3 flex items-center gap-3">
                {(['S', 'M', 'L'] as Array<'S'|'M'|'L'>).map((size) => {
                  const label = `${size} — ${giftPrices[size].toLocaleString('ru-RU')} ₽`;
                  return (
                    <label key={size} className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="giftWrapSize"
                        checked={(giftWrap && giftWrap.size) === size}
                        onChange={() => dispatch(setGiftWrap({ size }))}
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  );
                })}
              </div>
            )}
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