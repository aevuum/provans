'use client';

import { LazyImage } from './LazyImage';
import Link from 'next/link';
import { FaHeart, FaRegHeart, FaShoppingBag, FaCheck, FaEye, FaEdit } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { addToCart, removeFromCart } from '@/lib/features/cart/cartSlice';
import { toggleFavorite } from '@/lib/features/favorites/favoritesSlice';
import { Product, formatProductTitle } from '@/types';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

interface ProductCardClientProps {
  product: Product;
  isNew?: boolean;
  renderFooter?: ReactNode;
  hideAdminEditIcon?: boolean;
  hideCartButton?: boolean;
}

export function ProductCardClient({
  product,
  isNew = false,
  renderFooter,
  hideAdminEditIcon = false,
  hideCartButton = false,
}: ProductCardClientProps) {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.items);
  const favorites = useAppSelector((state) => state.favorites.items);
  const { data: session } = useSession();
  const router = useRouter();

  const isFavorite = favorites.some((f) => f.id === product.id);
  const inCart = cart.some((c) => c.id === product.id);

  // Проверяем, является ли пользователь админом по роли из сессии
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAdmin = (session?.user as any)?.role === 'admin';

  // Логика скидки
  const discount = product.discount || 0;
  const hasDiscount = discount > 0;
  const discountedPrice = hasDiscount
    ? Math.round(product.price * (1 - discount / 100) * 100) / 100
    : product.price;

  // Используем только поле image для главного изображения
  const mainImage = product.image || '/placeholder.jpg';

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        ...product,
        count: 1,
      })
    );
  };

  const handleRemoveFromCart = () => {
    dispatch(removeFromCart(product.id));
  };

  const handleCartToggle = () => {
    if (inCart) {
      handleRemoveFromCart();
    } else {
      handleAddToCart();
    }
  };

  const handleToggleFavorite = () => {
    dispatch(
      toggleFavorite({
        id: product.id,
        title: product.title,
        price: product.price,
        image: mainImage,
      })
    );
  };

  return (
    <div className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden h-full flex flex-col">
      {/* Бейджи */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {isNew && (
          <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full uppercase tracking-wider  ring-1 ring-white/60">
            NEW
          </span>
        )}
        {hasDiscount && (
          <span className="text-white bg-red-500 text-xs px-2 py-1 rounded">-{discount}%</span>
        )}
      </div>

      {/* Кнопки в углах */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
        {/* Кнопка избранного */}
        <button
          onClick={handleToggleFavorite}
          className="p-2 sm:p-3 rounded-full bg-white/80 hover:bg-white transition-colors cursor-pointer"
        >
          {isFavorite ? (
            <FaHeart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
          ) : (
            <FaRegHeart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          )}
        </button>

        {/* Кнопка просмотра */}
        <Link href={`/products/${product.id}`}>
          <button className="p-2 sm:p-3 rounded-full bg-white/80 hover:bg-white transition-colors cursor-pointer">
            <FaEye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </Link>

        {/* Кнопка редактирования для админа */}
        {!hideAdminEditIcon && isAdmin && (
          <button
            onClick={() => router.push(`/admin/products/${product.id}/edit`)}
            className="p-2 sm:p-3 rounded-full bg-white/80 hover:bg-white transition-colors cursor-pointer"
            title="Редактировать товар"
          >
            <FaEdit className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </button>
        )}
      </div>

      {/* Изображение товара */}
      <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-gray-100 block">
        <LazyImage
          src={mainImage}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          priority={false}
        />
      </Link>

      {/* Информация о товаре */}
      <div className="p-3 sm:p-4 flex flex-col justify-between flex-grow">
        <div className="font-semibold text-xs sm:text-sm mb-2 text-center min-h-[2.5rem] overflow-hidden">
          <Link href={`/products/${product.id}`} className="line-clamp-2 hover:underline">
            {formatProductTitle(product.title)}
          </Link>
        </div>
        {hasDiscount ? (
          <div className="flex flex-col items-center mb-2">
            <span className="text-gray-400 text-xs sm:text-sm line-through">
              {product.price.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
            </span>
            <span className="text-black font-bold text-lg sm:text-xl">
              {discountedPrice.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
            </span>
          </div>
        ) : (
          <div className="text-black font-bold mb-2 text-center text-lg sm:text-xl">
            {product.price.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
          </div>
        )}

        {/* Кастомный футер, например панель модерации */}
        {renderFooter && <div className="mt-2">{renderFooter}</div>}
      </div>

      {/* Кнопка корзины */}
      {!hideCartButton && (
        <div className="absolute bottom-2 right-2">
          <button
            onClick={handleCartToggle}
            className={`p-2 sm:p-3 rounded-full transition-colors cursor-pointer ${
              inCart
                ? 'bg-green-500 hover:bg-red-500 text-white'
                : 'bg-[#E5D3B3] hover:bg-[#D4C2A1] text-gray-800'
            }`}
            title={inCart ? 'Удалить из корзины' : 'Добавить в корзину'}
          >
            {inCart ? (
              <FaCheck className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
               <FaShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductCardClient;