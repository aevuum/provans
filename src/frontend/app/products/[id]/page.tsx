'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaHeart, FaRegHeart, FaShoppingBag, FaCheck } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../../lib/hooks';
import { getProductImage, Product } from '../../../types';
import { addToCart, removeFromCart } from '../../../lib/features/cart/cartSlice';
import { addToFavorites, removeFromFavorites } from '../../../lib/features/favorites/favoritesSlice';
import { Breadcrumbs, generateCatalogBreadcrumbs } from '@/components/Breadcrumbs';
import ImageZoom from '@/components/ImageZoom';
import SimilarProducts from '@/components/SimilarProducts';
import { AdminEditButton } from '@/components/AdminEditButton';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const { items: favorites } = useAppSelector((state) => state.favorites);
  const cartItems = useAppSelector((state) => state.cart.items);
  const isFavorite = favorites.some(item => item.id === product?.id);
  const inCart = cartItems.some((c) => c.id === product?.id);

  const fetchProduct = useCallback(async (idRaw: string) => {
    try {
      setLoading(true);
      const idStr = String(idRaw).trim();
      const idNum = Number(idStr);

      // Включаем includeNoImage=1, чтобы детальная страница находила товар даже без фото
      const response = await fetch(`/api/products?limit=2000&includeNoImage=1`);
      if (!response.ok) throw new Error('Failed to load');
      const data = await response.json();
      const items = (data?.data?.products || []) as Product[];

      // Ищем по id (числовое или строковое совпадение)
      let found = items.find((p) => String(p.id) === idStr);

      // Запасной вариант: если id в URL – штрихкод, попробуем по barcode
      if (!found && !Number.isNaN(idNum)) {
        found = items.find((p) => String(p.barcode || '') === idStr);
      }

      if (found) {
        setProduct(found);
      } else {
        setProduct(null);
      }
    } catch (_error) {
      console.error('Error fetching product:', _error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id, fetchProduct]);

  const handleCartToggle = () => {
    if (!product) return;
    if (inCart) {
      dispatch(removeFromCart(product.id));
    } else {
      for (let i = 0; i < quantity; i++) {
        dispatch(addToCart(product));
      }
    }
  };

  const handleToggleFavorite = () => {
    if (product) {
      if (isFavorite) {
        dispatch(removeFromFavorites(product.id));
      } else {
        dispatch(addToFavorites(product));
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Товар не найден</h1>
          <button
            onClick={() => router.push('/catalog/all')}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
          >
            В каталог
          </button>
        </div>
      </div>
    );
  }

  // Получаем все изображения продукта
  const productImages = [
    getProductImage(product),
    ...(product.images ? product.images.filter(img => img !== getProductImage(product)) : [])
  ].filter(Boolean);

  return (
    <div className="min-h-screen ">
      <Head>
        <title>{`${product.title} — Provans Decor`}</title>
        <meta name="description" content={product.comment || product.title} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.title,
              description: product.comment || undefined,
              sku: product.barcode || undefined,
              image: [getProductImage(product), ...(product.images || []).slice(0, 3)],
              offers: {
                '@type': 'Offer',
                priceCurrency: 'RUB',
                price: product.price,
                availability: (product.quantity || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              },
            }),
          }}
        />
      </Head>
      <div className="container mx-auto px-4 py-8">
        {/* Хлебные крошки */}
        <Breadcrumbs 
          items={generateCatalogBreadcrumbs(product.category || '', product.title)} 
          className="mb-8"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Галерея изображений */}
          <div className="space-y-4">
            {/* Основное изображение с зумом */}
            <div className="relative">
              <ImageZoom
                src={productImages[currentImageIndex]}
                alt={product.title}
                width={600}
                height={600}
                className="rounded-lg shadow-lg bg-white"
              />

              {/* Индикатор изображений */}
              {productImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {productImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                        index === currentImageIndex ? 'bg-[#E5D3B3]' : 'bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Миниатюры */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square bg-white rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                      index === currentImageIndex ? 'border-[#E5D3B3]' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Информация о товаре */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Артикул: {product.barcode}</span>
                <span>В наличии: {product.quantity || 1}</span>
              </div>
            </div>

            {/* Цена */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-gray-900">{product.price.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xl line-through text-gray-500">{product.originalPrice.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</span>
                )}
                {(product.discount ?? 0) > 0 && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    -{product.discount}%
                  </span>
                )}
              </div>

              {/* Количество и кнопки */}
              <div className="flex items-center justify-between mb-6 gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className={`px-4 py-2 transition-colors ${
                      quantity <= 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
                    }`}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min((product.quantity || 1), quantity + 1))}
                    disabled={quantity >= (product.quantity || 1)}
                    className={`px-4 py-2 transition-colors ${
                      quantity >= (product.quantity || 1)
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
                    }`}
                  >
                    +
                  </button>
                </div>

                {/* Иконки действий в едином стиле */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCartToggle}
                    className={`p-3 sm:p-4 rounded-full transition-colors cursor-pointer ${
                      inCart 
                        ? 'bg-green-500 hover:bg-red-500 text-white' 
                        : 'bg-[#E5D3B3] hover:bg-[#D4C2A1] text-gray-800'
                    }`}
                    title={inCart ? 'Удалить из корзины' : 'Добавить в корзину'}
                    aria-label={inCart ? 'Удалить из корзины' : 'Добавить в корзину'}
                    type="button"
                  >
                    {inCart ? (
                      <FaCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <FaShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>

                  <button
                    onClick={handleToggleFavorite}
                    className="p-3 sm:p-4 rounded-full bg-white/90 hover:bg-white transition-colors cursor-pointer"
                    title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                    aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                    type="button"
                  >
                    {isFavorite ? (
                      <FaHeart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                    ) : (
                      <FaRegHeart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

 
            </div>

            {/* Характеристики */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Характеристики</h3>
              <div className="space-y-3">
                {product.size && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Размер:</span>
                    <span className="font-medium">{product.size}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Артикул:</span>
                  <span className="font-medium">{product.barcode}</span>
                </div>
              </div>
            </div>

            {/* Описание */}
            {product.comment && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Описание</h3>
                <p className="text-gray-700 leading-relaxed">{product.comment}</p>
              </div>
            )}

            {/* Похожие товары */}
            <SimilarProducts
              currentProductId={product.id} 
              category={product.category} 
            />
          </div>
        </div>
      </div>

      {/* Admin Edit Button */}
      <AdminEditButton productId={product.id.toString()} />
    </div>
  );
}
