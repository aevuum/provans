'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaFilter, FaChevronDown, FaChevronUp, FaTimes } from 'react-icons/fa';
import { Product } from '../../types/index';

interface SmartFiltersProps {
  products: Product[];
  onFilterChange: (filtered: Product[]) => void;
}

export default function SmartFilters({ products, onFilterChange }: SmartFiltersProps) {
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });

  // Извлекаем уникальные значения из товаров
  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))] as string[];
  const priceRange = products.length > 0 ? {
    min: Math.min(...products.map(p => p.price)),
    max: Math.max(...products.map(p => p.price))
  } : { min: 0, max: 15000 };

  // Применяем фильтры
  useEffect(() => {
    let filtered = [...products];

    // Поиск
    if (filters.search) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Категория
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Цена
    if (filters.minPrice) {
      filtered = filtered.filter(product => product.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(product => product.price <= parseFloat(filters.maxPrice));
    }

    onFilterChange(filtered);
  }, [filters, products, onFilterChange]);

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-xl shadow-lg sticky top-4 mb-6">
      {/* Заголовок фильтров */}
      <div 
        className="flex items-center justify-between p-6 cursor-pointer border-b hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-3">
          <FaFilter className="text-[#E5D3B3] text-lg" />
          <h3 className="font-semibold text-gray-800 text-lg">Фильтры</h3>
          {hasActiveFilters && (
            <span className="bg-[#E5D3B3] text-[#7C5C27] text-xs px-2 py-1 rounded-full">
              Активны
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetFilters();
              }}
              className="text-red-500 hover:text-red-700 p-1"
              title="Сбросить фильтры"
            >
              <FaTimes />
            </button>
          )}
          {isOpen ? <FaChevronUp className="text-lg" /> : <FaChevronDown className="text-lg" />}
        </div>
      </div>

      {/* Содержимое фильтров */}
      {isOpen && (
        <div className="p-6 space-y-6">
          
          {/* Поиск по названию */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-3">
              Поиск по названию
            </label>
            <input
              type="text"
              placeholder="Введите название товара..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5D3B3] text-base"
            />
          </div>

          {/* Категория */}
          {uniqueCategories.length > 0 && (
            <div>
              <label className="block text-base font-medium text-gray-700 mb-3">
                Категория
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5D3B3] text-base"
              >
                <option value="">Все категории</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Цена */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-3">
              Цена (₽)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="number"
                placeholder={`От ${priceRange.min}`}
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5D3B3] text-base min-w-0"
              />
              <input
                type="number"
                placeholder={`До ${priceRange.max}`}
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5D3B3] text-base min-w-0"
              />
            </div>
          </div>

          {/* Кнопка сброса */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Сбросить все фильтры
            </button>
          )}

        </div>
      )}
    </div>
  );
}

// DEPRECATED: Используйте ReusableFilters. Этот файл оставлен как заглушка.
export function DeprecatedSmartFiltersStub() { return null; }
