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
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || ''
  })

  const [isOpen, setIsOpen] = useState(false)

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })

    router.push(`${baseUrl}?${params.toString()}`)
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: ''
    })
    router.push(baseUrl)
  }

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
          className="flex items-center justify-between p-6 cursor-pointer border-b"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center space-x-3">
            <FaFilter className="text-gray-600 text-lg" />
            <h2 className="text-xl font-semibold text-gray-800">Фильтры</h2>
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
        <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-screen p-6' : 'max-h-0'}`}>
          {/* Поиск */}
          {showSearch && (
            <div className="mb-6">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Поиск по названию
              </label>
              <input
                id="search"
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                placeholder="Введите название товара..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-[#E5D3B3] focus:border-[#E5D3B3] text-base"
              />
            </div>
          )}

          {/* Категория */}
          {showCategory && (
            <div className="mb-6">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Категория
              </label>
              <select
                id="category"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-[#E5D3B3] focus:border-[#E5D3B3] text-base"
              >
                <option value="">Все категории</option>
                <option value="мебель">Мебель</option>
                <option value="декор">Декор</option>
                <option value="посуда">Посуда</option>
                <option value="текстиль">Текстиль</option>
                <option value="цветы">Цветы</option>
                <option value="ароматы">Ароматы</option>
                <option value="новый год">Новый год</option>
                <option value="пасха">Пасха</option>
              </select>
            </div>
          )}

          {/* Цена */}
          {showPrice && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цена, ₽
              </label>
              <div className="flex space-x-3">
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                  placeholder="От"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-[#E5D3B3] focus:border-[#E5D3B3] text-base"
                />
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  placeholder="До"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-[#E5D3B3] focus:border-[#E5D3B3] text-base"
                />
              </div>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex space-x-3 pt-6">
            <button
              onClick={applyFilters}
              className="flex-1 bg-[#E5D3B3] hover:bg-[#D4C2A1] text-gray-800 py-3 px-6 rounded-md transition-colors font-medium text-base"
            >
              Применить фильтры
            </button>
            <button
              onClick={resetFilters}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-md transition-colors font-medium text-base"
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
