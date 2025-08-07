'use client';

import { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Product } from '@/types';
import ProductCardClient from './ProductCardClient';

interface SimilarProductsProps {
  currentProductId: number;
  category?: string | null;
}

export default function SimilarProducts({ currentProductId, category }: SimilarProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        setLoading(true);
        
        // Ищем товары той же категории или просто случайные товары
        const searchParams = new URLSearchParams({
          limit: '12',
          ...(category && { category })
        });

        const response = await fetch(`/api/products?${searchParams}`);
        const data = await response.json();
        
        if (data.success) {
          // Исключаем текущий товар и перемешиваем результат
          const filteredProducts = data.products
            .filter((product: Product) => product.id !== currentProductId)
            .sort(() => Math.random() - 0.5)
            .slice(0, 8);
          
          setProducts(filteredProducts);
        }
      } catch (error) {
        console.error('Error fetching similar products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProducts();
    }, [currentProductId, category]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Похожие товары</h2>
        <div className="flex space-x-4 overflow-hidden">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex-none w-64 animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Похожие товары</h2>
      <div className="relative">
        {/* Кнопка влево */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors cursor-pointer"
          style={{ marginLeft: '-20px' }}
        >
          <FaChevronLeft className="text-gray-600" />
        </button>

        {/* Контейнер с товарами */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div key={product.id} className="flex-none w-64">
              <ProductCardClient product={product} />
            </div>
          ))}
        </div>

        {/* Кнопка вправо */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors cursor-pointer"
          style={{ marginRight: '-20px' }}
        >
          <FaChevronRight className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}
