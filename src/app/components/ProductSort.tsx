'use client';

import React, { useRef, useState } from 'react';
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
  const [open, setOpen] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openWithDelay = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpen(true), 120);
  };
  const closeWithDelay = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div className={`relative ${className}`} onMouseEnter={openWithDelay} onMouseLeave={closeWithDelay}>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-[#E5D3B3] focus:outline-none focus:ring-2 focus:ring-[#E5D3B3] focus:border-transparent transition-colors"
          onClick={() => setOpen(v => !v)}
        >
          <span className="text-sm text-gray-700">Сортировка:</span>
          <span className="text-sm font-medium text-gray-900">{currentSortLabel}</span>
          <FaChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        <div className={`absolute right-0 top-full z-50 mt-1 w-56 rounded-lg bg-white py-2 shadow-lg border border-gray-200 transition-opacity duration-150 ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
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
  );
}
