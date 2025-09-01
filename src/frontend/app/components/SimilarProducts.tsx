'use client';

import { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ProductCardClient from './ProductCardClient';
import { Product } from '../../types/index';

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
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        setLoading(true);
        
        const searchParams = new URLSearchParams({
          limit: '12',
          ...(category ? { category } : {})
        });

        const response = await fetch(`/api/products?${searchParams}`);
        const result = await response.json();
        
        if (result.success) {
          const list: Product[] = result.data?.products ?? [];
          const filteredProducts = list
            .filter((product: Product) => product.id !== currentProductId)
            .sort(() => Math.random() - 0.5)
            .slice(0, 8);
          
          setProducts(filteredProducts);
        }
      } catch (_error) {
        console.error('Error fetching similar products:', _error);
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
        {/* Кнопка влево (увеличены размеры) */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-xl rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
          style={{ width: 48, height: 48, marginLeft: '-24px' }}
          aria-label="Прокрутить влево"
          type="button"
        >
          <FaChevronLeft className="text-gray-500 w-5 h-5 sm:w-6 sm:h-6" />
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

        {/* Кнопка вправо  */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-xl rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
          style={{ width: 48, height: 48, marginRight: '-24px' }}
          aria-label="Прокрутить вправо"
          type="button"
        >
          <FaChevronRight className="text-gray-500 w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
}
