'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCardClient from '@/app/components/ProductCardClient';
import CategoryFilter from '@/app/components/CategoryFilter';
import ReusableFilters from '@/app/components/ReusableFilters';
import { Product } from '@/types';

interface Category {
  id: number;
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
}

function DiscountProductsPageContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const searchParams = useSearchParams();

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (response.ok && data.data) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Ошибка при загрузке категорий:', error);
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append('limit', '1000');
      params.append('type', 'discount'); // Только акции
      params.append('sortBy', 'discount');
      params.append('sortOrder', 'desc');
      
      // Добавляем фильтры категорий
      if (selectedCategories.length > 0) {
        params.append('categories', selectedCategories.join(','));
      }
      if (selectedSubcategories.length > 0) {
        params.append('subcategories', selectedSubcategories.join(','));
      }

      // Добавляем другие фильтры
      const search = searchParams.get('search');
      if (search) params.append('search', search);
      
      const minPrice = searchParams.get('minPrice');
      if (minPrice) params.append('minPrice', minPrice);
      
      const maxPrice = searchParams.get('maxPrice');
      if (maxPrice) params.append('maxPrice', maxPrice);
      
      const material = searchParams.get('material');
      if (material) params.append('material', material);
      
      const country = searchParams.get('country');
      if (country) params.append('country', country);

      const response = await fetch(`/api/products-new?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok && data.data) {
        setProducts(data.data);
      } else {
        console.error('API error:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Ошибка при загрузке товаров:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategories, selectedSubcategories, searchParams]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Акции</h1>
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-red-600">🔥 Акции и скидки</h1>
        <p className="text-gray-600">Товары со скидками - не упустите выгодные предложения!</p>
      </div>
      
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Фильтры */}
        <div className="lg:col-span-1 space-y-6">
          <CategoryFilter
            categories={categories}
            selectedCategories={selectedCategories}
            selectedSubcategories={selectedSubcategories}
            onCategoryChange={setSelectedCategories}
            onSubcategoryChange={setSelectedSubcategories}
          />
          
          <ReusableFilters 
            baseUrl="/catalog/акции-new"
          />
        </div>

        {/* Продукты */}
        <div className="lg:col-span-3">
          <div className="mb-6">
            <p className="text-gray-600">
              Найдено акций: <span className="font-semibold text-red-600">{products.length}</span>
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Акции не найдены</p>
              <p className="text-gray-400 mt-2">Попробуйте изменить фильтры поиска</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCardClient 
                  key={product.id} 
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DiscountProductsPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <DiscountProductsPageContent />
    </Suspense>
  );
}
