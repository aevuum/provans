'use client';

import { Product } from '@/types';
import UniversalProductCard from '@/components/UniversalProductCard';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  isNew?: boolean;
  showDiscount?: boolean;
  className?: string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
    large: number;
  };
}

export default function ProductGrid({
  products,
  loading = false,
  isNew = false,
  showDiscount = true,
  className = '',
  emptyMessage = 'Товары не найдены',
  emptyIcon = '🔍',
  columns = {
    mobile: 2,
    tablet: 3,
    desktop: 4,
    large: 5
  }
}: ProductGridProps) {
  
  // Генерация классов колонок
  const gridClasses = `grid grid-cols-${columns.mobile} sm:grid-cols-${columns.tablet} md:grid-cols-${columns.desktop} lg:grid-cols-${columns.large} gap-3 sm:gap-4 md:gap-6`;

  if (loading) {
    return (
      <div className={`${gridClasses} ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-xl mb-4"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <div className="text-6xl text-gray-300 mb-4">
          {typeof emptyIcon === 'string' ? emptyIcon : emptyIcon}
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-600">
          Попробуйте изменить фильтры поиска или вернуться позже
        </p>
      </div>
    );
  }

  return (
    <div className={`${gridClasses} ${className}`}>
      {products.map((product) => (
        <UniversalProductCard 
          key={product.id} 
          product={product}
          isNew={isNew}
          showDiscount={showDiscount}
        />
      ))}
    </div>
  );
}
