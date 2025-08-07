'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import { Product, getProductImage } from '@/types';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { addToCart } from '@/lib/features/cart/cartSlice';
import { addToFavorites, removeFromFavorites } from '@/lib/features/favorites/favoritesSlice';
import SimilarProducts from '@/app/components/SimilarProducts';
import { AdminEditButton } from '@/app/components/AdminEditButton';
import { Breadcrumbs, generateCatalogBreadcrumbs } from '@/app/components/Breadcrumbs';
import ImageZoom from '@/app/components/ImageZoom';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const { items: favorites } = useAppSelector((state) => state.favorites);
  const isFavorite = favorites.some(item => item.id === product?.id);

  const fetchProduct = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        router.push('/404');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      router.push('/404');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id, fetchProduct]);

  const handleAddToCart = () => {
    if (product) {
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
            onClick={() => router.back()}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
          >
            Назад
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
    <div className="min-h-screen bg-gray-50">
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
                {product.discount && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    -{product.discount}%
                  </span>
                )}
              </div>

              {/* Количество и кнопки */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => (product.quantity || 1) > 1 && setQuantity(Math.max(1, quantity - 1))}
                    disabled={(product.quantity || 1) <= 1}
                    className={`px-4 py-2 transition-colors ${
                      (product.quantity || 1) <= 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
                    }`}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                  <button
                    onClick={() => (product.quantity || 1) > 1 && quantity < (product.quantity || 1) && setQuantity(quantity + 1)}
                    disabled={(product.quantity || 1) <= 1 || quantity >= (product.quantity || 1)}
                    className={`px-4 py-2 transition-colors ${
                      (product.quantity || 1) <= 1 || quantity >= (product.quantity || 1)
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#E5D3B3] hover:bg-[#D4C2A1] text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <FaShoppingCart />
                  <span>Добавить в корзину</span>
                </button>
                <button
                  onClick={handleToggleFavorite}
                  className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                    isFavorite
                      ? 'border-[#E5D3B3] text-[#E5D3B3] bg-[#F5F1E8]'
                      : 'border-gray-300 text-gray-400 hover:border-[#E5D3B3] hover:text-[#E5D3B3]'
                  }`}
                >
                  <FaHeart className="text-xl" />
                </button>
              </div>
            </div>

            {/* Характеристики */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Характеристики</h3>
              <div className="space-y-3">
                {product.material && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Материал:</span>
                    <span className="font-medium">{product.material}</span>
                  </div>
                )}
                {product.size && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Размер:</span>
                    <span className="font-medium">{product.size}</span>
                  </div>
                )}
                {product.country && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Страна:</span>
                    <span className="font-medium">{product.country}</span>
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
