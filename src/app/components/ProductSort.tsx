'use client';

import React from 'react';
import { FaChevronDown } from 'react-icons/fa';

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'popular';

interface ProductSortProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  className?: string;
}

const sortOptions = [
  { value: 'default' as SortOption, label: 'По умолчанию' },
  { value: 'price-asc' as SortOption, label: 'Сначала дешевые' },
  { value: 'price-desc' as SortOption, label: 'Сначала дорогие' },
  { value: 'name-asc' as SortOption, label: 'По названию А-Я' },
  { value: 'popular' as SortOption, label: 'По популярности' },
];

export function ProductSort({ currentSort, onSortChange, className = '' }: ProductSortProps) {
  const currentSortLabel = sortOptions.find(option => option.value === currentSort)?.label || 'По умолчанию';

  return (
    <div className={`relative ${className}`}>
      <div className="group">
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-[#E5D3B3] focus:outline-none focus:ring-2 focus:ring-[#E5D3B3] focus:border-transparent transition-colors"
        >
          <span className="text-sm text-gray-700">Сортировка:</span>
          <span className="text-sm font-medium text-gray-900">{currentSortLabel}</span>
          <FaChevronDown className="w-3 h-3 text-gray-400 transition-transform group-hover:rotate-180" />
        </button>

        {/* Dropdown */}
        <div className="invisible absolute right-0 top-full z-50 mt-1 w-56 rounded-lg bg-white py-2 opacity-0 shadow-lg border border-gray-200 transition-all duration-200 group-hover:visible group-hover:opacity-100">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={`block w-full px-4 py-2 text-left text-sm hover:bg-[#E5D3B3] hover:text-[#7C5C27] transition-colors ${
                currentSort === option.value 
                  ? 'bg-[#E5D3B3] text-[#7C5C27] font-medium' 
                  : 'text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
