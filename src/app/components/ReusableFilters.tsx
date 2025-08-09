'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa'

interface ReusableFiltersProps {
  showSearch?: boolean
  showCategory?: boolean
  showPrice?: boolean
  baseUrl: string
}

type CategoryOption = { label: string; value: string };

const AVAILABLE_CATEGORIES: CategoryOption[] = [
  { label: 'Вазы', value: 'vases' },
  { label: 'Подсвечники', value: 'candlesticks' },
  { label: 'Рамки', value: 'frames' },
  { label: 'Цветы', value: 'flowers' },
  { label: 'Шкатулки', value: 'jewelry-boxes' },
  { label: 'Фигурки', value: 'figures' },
  { label: 'Книгодержатели', value: 'bookends' },
];

export default function ReusableFilters({
  showSearch = true,
  showCategory = true,
  showPrice = true,
  baseUrl
}: ReusableFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categories: searchParams.get('categories') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  })

  const [isOpen, setIsOpen] = useState(false)

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value))
      }
    })

    router.push(`${baseUrl}?${params.toString()}`)
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      categories: '',
      minPrice: '',
      maxPrice: '',
    })
    router.push(baseUrl)
  }

  const showCategorySelect = showCategory && ['/catalog/акции','/catalog/новинки','/catalog/все-категории'].includes(baseUrl)

  return (
    <div>
      {/* Фоновая затемненная область при открытых фильтрах */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className={`bg-white rounded-lg shadow-md sticky top-4 ${isOpen ? 'z-50 relative' : ''}`}>
        {/* Заголовок фильтров */}
        <div 
          className="flex items-center justify-between p-4 md:p-6 cursor-pointer border-b bg-mint-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center space-x-3">
            <FaFilter className="text-gray-600 text-lg" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">Фильтры</h2>
          </div>
          <div className="flex items-center space-x-2">
            {isOpen ? (
              <FaChevronUp className="text-gray-500" />
            ) : (
              <FaChevronDown className="text-gray-500" />
            )}
          </div>
        </div>

        {/* Содержимое фильтров */}
        <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-screen p-4 md:p-6' : 'max-h-0'}`}>
          {/* Поиск */}
          {showSearch && (
            <div className="mb-4 md:mb-6">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Поиск по названию
              </label>
              <input
                id="search"
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                placeholder="Введите название товара..."
                className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-md focus:ring-[#E5D3B3] focus:border-[#E5D3B3] text-base"
              />
            </div>
          )}

          {/* Категория (только нужные страницы) */}
          {showCategorySelect && (
            <div className="mb-4 md:mb-6">
              <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-2">
                Категория
              </label>
              <select
                id="categories"
                value={filters.categories}
                onChange={(e) => setFilters({...filters, categories: e.target.value})}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-md focus:ring-[#E5D3B3] focus:border-[#E5D3B3] text-base"
              >
                <option value="">Все категории</option>
                {AVAILABLE_CATEGORIES.map((c: CategoryOption) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Цена */}
          {showPrice && (
            <div className="mb-4 md:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цена, ₽
              </label>
              <div className="flex gap-3 w-full">
                <input
                  type="number"
                  inputMode="numeric"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                  placeholder="От"
                  className="w-1/2 min-w-0 px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-md focus:ring-[#E5D3B3] focus:border-[#E5D3B3] text-base"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  placeholder="До"
                  className="w-1/2 min-w-0 px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-md focus:ring-[#E5D3B3] focus:border-[#E5D3B3] text-base"
                />
              </div>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex flex-col md:flex-row gap-3 pt-4 md:pt-6">
            <button
              onClick={applyFilters}
              className="w-full md:flex-1 bg-[#E5D3B3] hover:bg-[#D4C2A1] text-gray-800 py-3 px-6 rounded-md transition-colors font-medium text-base"
            >
              Применить фильтры
            </button>
            <button
              onClick={resetFilters}
              className="w-full md:flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-md transition-colors font-medium text-base"
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
