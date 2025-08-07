'use client';

import { useEffect, useState, useCallback } from 'react';
import ProductCardClient from '@/app/components/ProductCardClient';
import ReusableFilters from '@/app/components/ReusableFilters';
import { Product } from '@/types';

interface CategoryPageProps {
  categoryName: string;
  displayName: string;
  filterType?: 'category' | 'subcategory' | 'material' | 'none';
}

export default function CategoryPage({ 
  categoryName, 
  displayName, 
  filterType = 'category'
}: CategoryPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState(new URLSearchParams());

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products?limit=1000');
      const data = await response.json();
      
      if (response.ok && data.data) {
        let categoryProducts: Product[] = [];
        
        // Фильтруем товары по типу
        categoryProducts = data.data.filter((product: Product) => {
          if (!product.isConfirmed) return false;
          
          switch (filterType) {
            case 'category':
              return product.category === categoryName;
            case 'subcategory':
              return product.subcategory === categoryName;
            case 'material':
              return product.material?.toLowerCase().includes(categoryName.toLowerCase());
            case 'none':
              return true; // Показываем все товары
            default:
              return product.category === categoryName;
          }
        });
        
        setProducts(categoryProducts);
      } else {
        console.error('API error:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...products];

    // Поиск
    const search = searchParams.get('search');
    if (search) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Фильтр по цене
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice) {
      filtered = filtered.filter(product => product.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(product => product.price <= parseFloat(maxPrice));
    }

    // Фильтр по материалу
    const material = searchParams.get('material');
    if (material && material !== 'all') {
      filtered = filtered.filter(product => 
        product.material?.toLowerCase().includes(material.toLowerCase())
      );
    }

    // Фильтр по стране
    const country = searchParams.get('country');
    if (country && country !== 'all') {
      filtered = filtered.filter(product => 
        product.country?.toLowerCase().includes(country.toLowerCase())
      );
    }

    // Сортировка
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'name':
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
      }
      
      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    });

    setFilteredProducts(filtered);
  }, [products, searchParams]);

  useEffect(() => {
    fetchProducts();
    
    // Обновляем параметры поиска при изменении URL
    const params = new URLSearchParams(window.location.search);
    setSearchParams(params);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Обновление URL параметров
  const updateSearchParams = () => {
    const params = new URLSearchParams(window.location.search);
    setSearchParams(params);
  };

  useEffect(() => {
    const handlePopState = () => {
      updateSearchParams();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">Загрузка товаров...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {displayName}
          </h1>
          <p className="text-gray-600">
            {products.length > 0 ? `Найдено товаров: ${filteredProducts.length}` : 'Товары в данной категории отсутствуют'}
          </p>
        </div>
        
        {products.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Фильтры */}
            <div className="lg:w-1/4">
              <ReusableFilters 
                showSearch={true}
                showCategory={false}
                showPrice={true}
                baseUrl={`/catalog/${categoryName}`}
              />
            </div>

            {/* Список товаров */}
            <div className="lg:w-3/4">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCardClient key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Товары не найдены
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Попробуйте изменить параметры поиска
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-[#F5F1E8] p-8 rounded-lg">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                В данной категории пока нет товаров
              </h2>
              <p className="text-gray-600">
                Мы работаем над наполнением каталога
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
