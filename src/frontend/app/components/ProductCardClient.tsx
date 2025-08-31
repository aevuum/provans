'use client';

import { LazyImage } from './LazyImage';
import Link from 'next/link';
import { FaHeart, FaRegHeart, FaShoppingBag, FaCheck, FaEye, FaEdit } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { formatProductTitle, Product } from '../../types';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { addToCart, removeFromCart } from '../../lib/features/cart/cartSlice';
import { toggleFavorite } from '../../lib/features/favorites/favoritesSlice';

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAdmin = (session?.user as any)?.role === 'admin';

  const discount = product.discount || 0;
  const hasDiscount = discount > 0;
  const discountedPrice = hasDiscount
    ? Math.round(product.price * (1 - discount / 100) * 100) / 100
    : product.price;

  const mainImage = product.image 
    ? encodeURI(product.image) 
    : '/placeholder.jpg';

  useEffect(() => {
    console.log('Product with adminNote:', product.id, product.adminNote);
  }, [product]);

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, count: 1 }));
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

  // Определяем adminNote и его отображаемый текст
  const adminNote = product.adminNote || '';
  const shortNote = adminNote.length > 11 ? `${adminNote.slice(0, 11)}...` : adminNote;


  return (
  <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col w-full min-h-[400px]">
      {/* Бейджи */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {isNew && (
          <span className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-xs px-3 py-1.5 rounded-full uppercase font-bold tracking-wide ">
            NEW
          </span>
        )}
        {hasDiscount && (
          <span className="text-white bg-red-600 text-sm px-3 py-1.5 rounded-full font-bold">
            -{discount}%
          </span>
        )}
      </div>

      {/* Кнопки в углах */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button
          onClick={handleToggleFavorite}
          className="p-3 rounded-full bg-white/90 hover:bg-white transition-all duration-200 shadow-md"
        >
          {isFavorite ? (
            <FaHeart className="w-5 h-5 text-red-500" />
          ) : (
            <FaRegHeart className="w-5 h-5 text-gray-500" />
          )}
        </button>

        <Link href={`/products/${product.id}`}>
          <button className="p-3 rounded-full bg-white/90 hover:bg-white transition-all duration-200 shadow-md">
            <FaEye className="w-5 h-5 text-gray-600" />
          </button>
        </Link>

        {!hideAdminEditIcon && isAdmin && (
          <button
            onClick={() => router.push(`/admin/products/${product.id}/edit`)}
            className="p-3 rounded-full bg-white/90 hover:bg-white transition-all duration-200 shadow-md"
            title="Редактировать товар"
          >
            <FaEdit className="w-5 h-5 text-blue-600" />
          </button>
        )}
      </div>

      {/* Изображение товара — больше */}
  <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-gray-50 block w-full h-[270px] min-h-[270px] max-h-[270px]">
        <LazyImage
          src={mainImage}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        />

        {/* Оверлей админского комментария */}
        {adminNote && (
          <div
            className="absolute top-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap transition-all duration-200 cursor-pointer z-20"
            title={adminNote}
            style={{
              maxWidth: '80px',
              minWidth: 'auto',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {shortNote}
          </div>
        )}
      </Link>

      {/* Информация о товаре */}
  <div className="p-5 flex flex-col justify-between flex-grow min-h-[170px]">
        <div className="font-semibold text-sm sm:text-base mb-3 text-center min-h-[3rem]">
          <Link href={`/products/${product.id}`} className="line-clamp-2 hover:underline text-gray-800 text-lg">
            {formatProductTitle(product.title)}
          </Link>
        </div>

        {hasDiscount ? (
          <div className="flex flex-col items-center mb-3">
            <span className="text-gray-500 text-sm line-through">
              {product.price.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
            </span>
            <span className="text-black font-bold text-2xl">
              {discountedPrice.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
            </span>
          </div>
        ) : (
          <div className="text-black font-bold text-center text-2xl mb-3">
            {product.price.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
          </div>
        )}

        {renderFooter && <div className="mt-3">{renderFooter}</div>}
      </div>

      {/* Кнопка корзины — больше */}
      {!hideCartButton && (
        <div className="absolute bottom-3 right-3">
          <button
            onClick={handleCartToggle}
            className={`p-3 rounded-full transition-all duration-200 cursor-pointer shadow-lg transform hover:scale-105 ${
              inCart
                ? 'bg-green-600 hover:bg-red-600 text-white'
                : 'bg-[#E5D3B3] hover:bg-[#C5B3A3] text-gray-800'
            }`}
            title={inCart ? 'Удалить из корзины' : 'Добавить в корзину'}
          >
            {inCart ? (
              <FaCheck className="w-5 h-5" />
            ) : (
              <FaShoppingBag className="w-5 h-5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductCardClient;
