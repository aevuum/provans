'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaChevronDown, FaFilter, FaTimes } from 'react-icons/fa';

interface ProductFiltersProps {
  filters?: {
    priceRange?: { min: number; max: number };
    materials?: string[];
    countries?: string[];
    categories?: string[];
  };
  currentPath?: string;
}

export default function ProductFilters({ 
  filters = {
    priceRange: { min: 0, max: 15000 },
    materials: ['дерево', 'металл', 'ткань', 'керамика', 'стекло', 'пластик'],
    countries: ['Россия', 'Италия', 'Франция', 'Германия', 'Китай', 'Нидерланды'],
    categories: []
  },
  currentPath = '/catalog'
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    material: false,
    country: false,
    category: false
  });

  const [tempFilters, setTempFilters] = useState({
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    material: searchParams.get('material') || '',
    country: searchParams.get('country') || '',
    category: searchParams.get('category') || ''
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(tempFilters).forEach(([key, value]) => {
      if (value && value.trim()) {
        params.set(key, value.trim());
      } else {
        params.delete(key);
      }
    });

    params.delete('page');
    router.push(`${currentPath}?${params.toString()}`);
  };

  const clearFilters = () => {
    setTempFilters({
      minPrice: '',
      maxPrice: '',
      material: '',
      country: '',
      category: ''
    });
    
    const params = new URLSearchParams(searchParams);
    ['minPrice', 'maxPrice', 'material', 'country', 'category', 'page'].forEach(key => {
      params.delete(key);
    });
    
    router.push(`${currentPath}?${params.toString()}`);
  };

  const hasActiveFilters = Object.values(tempFilters).some(value => value && value.trim());

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 w-full min-w-[320px] max-w-md h-fit">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FaFilter className="text-[#E5D3B3]" />
          Фильтры
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1"
          >
            <FaTimes className="text-xs" />
            Сбросить
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900">Цена</span>
            <FaChevronDown 
              className={`transition-transform text-gray-400 ${
                expandedSections.price ? 'rotate-180' : ''
              }`} 
            />
          </button>
          {expandedSections.price && (
            <div className="px-4 pb-4  border-gray-100 bg-gray-50">
              <div className="flex gap-3 mt-3">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">От</label>
                  <input
                    type="number"
                    placeholder={filters.priceRange?.min.toString() || "0"}
                    value={tempFilters.minPrice}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E5D3B3] focus:border-transparent text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">До</label>
                  <input
                    type="number"
                    placeholder={filters.priceRange?.max.toString() || "15000"}
                    value={tempFilters.maxPrice}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E5D3B3] focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={applyFilters}
          className="w-full bg-[#E5D3B3] hover:bg-[#D4C2A1] text-gray-800 font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
        >
          Применить фильтры
        </button>
      </div>
    </div>
  );
}
