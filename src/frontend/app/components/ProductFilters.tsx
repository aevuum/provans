'use client';

import React, { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaChevronDown, FaFilter, FaTimes } from 'react-icons/fa';
import { catalogStructure, Category, Subcategory } from '../../lib/catalogStructure';

interface ProductFiltersProps {
  filters?: {
    priceRange?: { min: number; max: number };
    categories?: string[];
  };
  currentPath?: string;
}

export default function ProductFilters({ 
  filters = {
    priceRange: { min: 0, max: 15000 },
    categories: []
  },
  currentPath = '/catalog'
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    price: true,
    category: false
  });

  // Controls for each category accordion (expand subs) and show-all for long sublists
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [showAllSubs, setShowAllSubs] = useState<Record<string, boolean>>({});

  // show/hide the big category popup (triggered by top "Категория" selector)
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);

  // selected categories: store as set of subcategory slugs
  const initialSelected = () => {
    const q = searchParams.get('categories') || '';
    return new Set(q.split(',').filter(Boolean));
  };

  const [selected, setSelected] = useState<Set<string>>(initialSelected);

  const toggleSelect = (slug: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      return next;
    });
  };

  const selectAllInCategory = (category: Category) => {
    setSelected(prev => {
      const next = new Set(prev);
      const subs = category.subcategories || [];
      if (subs.length === 0) {
        // Категория без подкатегорий — переключаем сам slug категории
        if (next.has(category.slug)) next.delete(category.slug); else next.add(category.slug);
        return next;
      }
      const allSelected = subs.every((s: Subcategory) => next.has(s.slug));
      if (allSelected) subs.forEach((s: Subcategory) => next.delete(s.slug));
      else subs.forEach((s: Subcategory) => next.add(s.slug));
      return next;
    });
  };

  const [tempFilters, setTempFilters] = useState({
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
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
    // categories param from selected set
    if (selected && selected.size) {
      params.set('categories', Array.from(selected).join(','));
    } else {
      params.delete('categories');
    }
    router.push(`${currentPath}?${params.toString()}`);
  };

  const clearFilters = () => {
    setTempFilters({
      minPrice: '',
      maxPrice: '',
      category: ''
    });
    
    const params = new URLSearchParams(searchParams);
    ['minPrice', 'maxPrice', 'category', 'page'].forEach(key => {
      params.delete(key);
    });
    
    router.push(`${currentPath}?${params.toString()}`);
  };

  const hasActiveFilters = useMemo(() => {
    if (selected.size > 0) return true;
    return Object.values(tempFilters).some(value => value && value.trim());
  }, [selected, tempFilters]);

  return (
  <div className="bg-white rounded-xl shadow-lg p-8 w-full min-w-[320px] max-w-md h-fit relative">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FaFilter className="text-[#E5D3B3]" />
          Фильтры
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 cursor-pointer"
          >
            <FaTimes className="text-xs" />
            Сбросить
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Top category selector that opens a popup with big cards */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Категория</label>
          <button
            onClick={() => setShowCategoryPopup(prev => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-md border border-[#2B61FF]/0 bg-white text-left hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span className="text-sm text-gray-900">{tempFilters.category || 'Все категории'}</span>
            <FaChevronDown className={`text-gray-400 transition-transform ${showCategoryPopup ? 'rotate-180' : ''}`} />
          </button>

          {showCategoryPopup && (
            <>
              {/* backdrop to close popup on outside click */}
              <div className="fixed inset-0 z-40" onClick={() => setShowCategoryPopup(false)} />

              <div className="absolute left-0 right-0 mt-2 z-50 bg-white p-4 rounded-md shadow-lg max-h-[60vh] overflow-auto">
                <div className="space-y-3">
                  {catalogStructure.map((cat: Category) => {
                    const subs: Subcategory[] = cat.subcategories || [];
                    const allSelected = subs.length > 0 && subs.every((s: Subcategory) => selected.has(s.slug));
                    return (
                      <div
                          key={cat.slug}
                          className="flex items-center justify-between gap-4 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                          onClick={() => selectAllInCategory(cat)}
                        >
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={(e) => { e.stopPropagation(); selectAllInCategory(cat); }}
                            className="w-5 h-5"
                            aria-label={`Выбрать ${cat.name}`}
                          />
                          <span className="text-base font-medium text-gray-800">{cat.name}</span>
                        </div>
                        <div className="text-sm text-gray-500">{subs.length} подп.</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
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

        {/* Categories accordion with multi-select */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('category')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900">Тип товара</span>
            <FaChevronDown 
              className={`transition-transform text-gray-400 ${
                expandedSections.category ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {expandedSections.category && (
            <div className="px-4 pb-4 border-gray-100 bg-gray-50">
              <div className="mt-3 space-y-3">
                {catalogStructure.map((cat: Category) => {
                  const subs: Subcategory[] = cat.subcategories || [];
                  const allSelected = subs.length > 0
                    ? subs.every((s: Subcategory) => selected.has(s.slug))
                    : selected.has(cat.slug);
                  const isCatExpanded = Boolean(expandedCats[cat.slug]);
                  const isShowAll = Boolean(showAllSubs[cat.slug]);
                  const limit = 8;
                  const visibleSubs = isShowAll ? subs : subs.slice(0, limit);
                  return (
                    <div key={cat.slug} className="">
                      {/* Main category card */}
                      <div
                        className="border border-gray-200 rounded-md px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedCats(prev => ({ ...prev, [cat.slug]: !prev[cat.slug] }))}
                      >
                        <div className="flex items-center gap-4">
                          {/* Кастомный checkbox в фирменном стиле */}
                          <label className="inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={() => selectAllInCategory(cat)}
                              className="peer sr-only"
                              aria-label={`Выбрать категорию ${cat.name}`}
                            />
                            <span
                              className="w-5 h-5 inline-flex items-center justify-center rounded-sm border border-gray-300 bg-white peer-checked:bg-[#B87333] peer-checked:border-[#B87333]"
                              aria-hidden
                            >
                              <svg viewBox="0 0 20 20" className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100"><path fill="currentColor" d="M7.629 13.233L4.4 10.004l-1.2 1.2 4.429 4.43 8.171-8.171-1.2-1.2z"/></svg>
                            </span>
                          </label>
                          <span className="text-lg font-medium text-gray-800">{cat.name}</span>
                        </div>

                        {subs.length > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setExpandedCats(prev => ({ ...prev, [cat.slug]: !prev[cat.slug] })); }}
                            className="text-gray-400 p-2 cursor-pointer"
                            aria-expanded={isCatExpanded}
                          >
                            <FaChevronDown className={`transition-transform ${isCatExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>

                      {/* Subcategories — вложенный список */}
                      {isCatExpanded && subs.length > 0 && (
                        <div className="mt-2 ml-6 p-3 bg-white border-l pl-4 space-y-2">
                          {visibleSubs.map((s: Subcategory) => (
                            <label key={s.slug} className="flex items-center gap-3 text-gray-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selected.has(s.slug)}
                                onChange={() => toggleSelect(s.slug)}
                                className="peer sr-only"
                              />
                              <span
                                className="w-4 h-4 inline-flex items-center justify-center rounded-sm border border-gray-300 bg-white peer-checked:bg-[#B87333] peer-checked:border-[#B87333]"
                                aria-hidden
                              >
                                <svg viewBox="0 0 20 20" className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100"><path fill="currentColor" d="M7.629 13.233L4.4 10.004l-1.2 1.2 4.429 4.43 8.171-8.171-1.2-1.2z"/></svg>
                              </span>
                              <span>{s.name}</span>
                            </label>
                          ))}
                            {subs.length > limit && (
                            <button
                              type="button"
                              onClick={() => setShowAllSubs(prev => ({ ...prev, [cat.slug]: !prev[cat.slug] }))}
                              className="mt-2 text-sm text-gray-700 underline hover:text-gray-900 cursor-pointer"
                            >
                              {isShowAll ? 'Скрыть' : 'Показать все'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

  <button
          onClick={applyFilters}
          className="w-full bg-[#E5D3B3] hover:bg-[#D4C2A1] text-gray-800 font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] cursor-pointer"
        >
          Применить фильтры
        </button>
      </div>
    </div>
  );
}

// DEPRECATED: Используйте ReusableFilters. Этот файл оставлен как заглушка.
export function DeprecatedProductFiltersStub() { return null; }
