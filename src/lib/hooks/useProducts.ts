// lib/hooks/useProducts.ts
import { useState, useEffect, useCallback } from 'react';
import { Product, ProductFilters, FilterOptions } from '@/types';

// Хук для работы с продуктами с фильтрацией и пагинацией
export function useProducts(initialFilters: ProductFilters = {}) {
  const [data, setData] = useState<Product[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);

  // Функция для загрузки продуктов
  const fetchProducts = useCallback(async (newFilters?: ProductFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const activeFilters = newFilters || filters;
      const params = new URLSearchParams();

      // Добавляем параметры в URL
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value));
        }
      });

      const response = await fetch(`/api/products?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки продуктов');
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data.products);
        setMeta({
          total: result.data.pagination.total,
          page: result.data.pagination.page,
          limit: result.data.pagination.limit,
          totalPages: result.data.pagination.totalPages,
          hasNextPage: result.data.pagination.page < result.data.pagination.totalPages,
          hasPrevPage: result.data.pagination.page > 1
        });
      } else {
        throw new Error(result.error || 'Ошибка загрузки продуктов');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Обновление фильтров
  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }; // Сбрасываем на первую страницу
    setFilters(updatedFilters);
    fetchProducts(updatedFilters);
  }, [filters, fetchProducts]);

  // Переход на страницу
  const goToPage = useCallback((page: number) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    fetchProducts(updatedFilters);
  }, [filters, fetchProducts]);

  // Очистка фильтров
  const clearFilters = useCallback(() => {
    const clearedFilters = { page: 1, limit: filters.limit || 20 };
    setFilters(clearedFilters);
    fetchProducts(clearedFilters);
  }, [filters.limit, fetchProducts]);

  // Первоначальная загрузка
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // Включаем зависимость

  return {
    // Данные
    products: data,
    meta,
    loading,
    error,
    filters,

    // Методы
    fetchProducts,
    updateFilters,
    goToPage,
    clearFilters,
    refetch: () => fetchProducts()
  };
}

// Хук для получения опций фильтров
export function useFilterOptions() {
  const [options, setOptions] = useState<FilterOptions>({
    priceRange: { min: 0, max: 100000 }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/products/filters');
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки опций фильтров');
      }

      const result: FilterOptions = await response.json();
      setOptions(result);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error('Fetch filter options error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return {
    options,
    loading,
    error,
    refetch: fetchOptions
  };
}
