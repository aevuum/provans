'use client';

import { useEffect, useState } from 'react';
import ProductCardClient from '@/app/components/ProductCardClient';
import CategoryFilter from '@/app/components/CategoryFilter';
import ReusableFilters from '@/app/components/ReusableFilters';
import { Product, Category } from '@/types';

export default function DecorCategoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['decor']);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useState(new URLSearchParams());

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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append('limit', '1000');
      params.append('categories', selectedCategories.join(','));
      
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
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategories, selectedSubcategories, searchParams]);

  // Фильтруем категории только для декора
  const decorCategories = categories.filter(cat => cat.slug === 'decor');

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Декор</h1>
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Декор</h1>
        <p className="text-gray-600">Украсьте свой дом стильными декоративными элементами</p>
      </div>
      
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Фильтры */}
        <div className="lg:col-span-1 space-y-6">
          <CategoryFilter
            categories={decorCategories}
            selectedCategories={selectedCategories}
            selectedSubcategories={selectedSubcategories}
            onCategoryChange={setSelectedCategories}
            onSubcategoryChange={setSelectedSubcategories}
          />
          
          <ReusableFilters 
            showSearch={true}
            showCategory={false}
            showPrice={true}
            baseUrl="/catalog/decor-new"
          />
        </div>

        {/* Продукты */}
        <div className="lg:col-span-3">
          <div className="mb-6">
            <p className="text-gray-600">
              Найдено товаров: <span className="font-semibold">{products.length}</span>
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Товары не найдены</p>
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
