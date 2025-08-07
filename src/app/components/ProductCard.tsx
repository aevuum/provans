import Image from 'next/image';
import Link from 'next/link';
import { FaHeart, FaRegHeart, FaShoppingBag, FaCheck } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { addToCart } from '@/lib/features/cart/cartSlice';
import { toggleFavorite } from '@/lib/features/favorites/favoritesSlice';
import { Product, getProductImage } from '@/types';

interface ProductCardProps {
  product: Product;
  isNew?: boolean;
}

export function ProductCard({ product, isNew = false }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(state => state.cart.items);
  const favorites = useAppSelector(state => state.favorites.items);
  
  const isFavorite = favorites.some(f => f.id === product.id);
  const inCart = cart.some(c => c.id === product.id);

    // Расчёт скидки и финальной цены
  const hasDiscount = product.discount && product.discount > 0;
  const discountedPrice = hasDiscount 
    ? Math.round((product.price * (1 - (product.discount || 0) / 100)) * 100) / 100
    : product.price;

  // Используем хелпер для получения главного изображения
  const mainImage = getProductImage(product);

  return (
    <div className="relative min-w-[180px] max-w-[240px] bg-white rounded-xl shadow hover:shadow-lg transition flex-shrink-0 flex flex-col group">
      {isNew && (
        <span className="absolute left-0 top-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-br-xl rounded-tl-xl z-10 select-none">
          NEW
        </span>
      )}
      <Link href={`/products/${product.id}`} className="cursor-pointer">
        <div className="relative w-full h-36 sm:h-40 rounded-t-xl overflow-hidden flex items-center justify-center">
          <Image
            src={mainImage}
            alt={product.title}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100vw, 220px"
          />
        </div>
        <div className="p-3 flex flex-col flex-1">
          <div className="font-semibold text-sm truncate mb-2 text-center">{product.title}</div>
          {hasDiscount ? (
            <div className="flex flex-col items-center mb-2">
              <span className="text-gray-400 text-sm line-through">{product.price.toLocaleString('ru-RU')} ₽</span>
              <span className="text-red-600 font-bold text-lg">{Math.round(discountedPrice).toLocaleString('ru-RU')} ₽</span>
              <span className="text-white bg-red-500 text-xs px-2 py-1 rounded">-{product.discount}%</span>
            </div>
          ) : (
            <div className="text-black font-bold mb-2 text-center">{product.price.toLocaleString('ru-RU')} ₽</div>
          )}
        </div>
      </Link>
      <div className="px-3 pb-3">
        <div className="flex gap-2 mt-auto">
          {inCart ? (
            <span className="flex-1 bg-[#E5D3B3] text-[#7C5C27] px-3 py-1 rounded text-sm font-semibold flex items-center justify-center gap-1 cursor-default">
              <FaCheck className="inline ml-2" /> В корзине
            </span>
          ) : (
            <button
              className="flex-1 bg-[#E5D3B3] text-[#7C5C27] px-3 py-1 rounded hover:bg-[#d6c2a3] transition text-sm font-semibold cursor-pointer flex items-center justify-center gap-1"
              onClick={(e) => { e.stopPropagation(); dispatch(addToCart(product)); }}
            >
              В корзину
              <FaShoppingBag className="inline ml-2" />
            </button>
          )}
          <button
            className={`p-2 rounded ${isFavorite ? 'text-red-600' : 'text-gray-400'} hover:text-red-600 cursor-pointer`}
            onClick={(e) => { e.stopPropagation(); dispatch(toggleFavorite(product)); }}
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>
      </div>
    </div>
  );
}
