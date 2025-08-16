'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa'

interface ReusableFiltersProps {
  showSearch?: boolean
  showCategory?: boolean
  showPrice?: boolean
  baseUrl: string
}

type CategoryOption = { label: string; value: string };

export default function ReusableFilters({
  showSearch = true,
  showCategory = true,
  showPrice = true,
  baseUrl
}: ReusableFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([])
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/categories/available', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        const cats: CategoryOption[] = (data?.categories || []).map((c: any) => ({ label: c.name || c.slug, value: c.slug }))
        setCategoryOptions(cats)
      } catch {}
    })()
  }, [])

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categories: searchParams.get('categories') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  onlyDiscounts: searchParams.get('onlyDiscounts') || '',
  })

  const [isOpen, setIsOpen] = useState(false)

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        // Приводим к строке и обрезаем пробелы
        params.set(key, String(value).trim())
      }
    })

    // Навигация на нормализованный ASCII-путь
    const normalizedBase = decodeURIComponent(baseUrl).replace('/catalog/все-категории', '/catalog/all')
    router.push(`${normalizedBase}?${params.toString()}`)
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      categories: '',
      minPrice: '',
  maxPrice: '',
  onlyDiscounts: '',
    })
    const normalizedBase = decodeURIComponent(baseUrl).replace('/catalog/все-категории', '/catalog/all')
    router.push(normalizedBase)
  }

  // Обновлено: показываем селект категории только на нужных ASCII-страницах
  const decodedBase = typeof window !== 'undefined' ? decodeURIComponent(baseUrl) : baseUrl
  const showCategorySelect = showCategory && ['/discount','/catalog/all','/catalog/new'].includes(decodedBase.replace('/catalog/все-категории', '/catalog/all'))

  return (
    <div>
      {/* Фоновая затемненная область при открытых фильтрах */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-[60] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className={`bg-white rounded-lg shadow-md sticky top-4 ${isOpen ? 'z-[70] relative' : ''}`}>
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
                className="w-full sm:w-64 md:w-72 lg:w-80 max-w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-md focus:ring-[#E5D3B3] focus:border-[#E5D3B3] text-base"
              />
            </div>
          )}

          {/* Категория (только нужные страницы) */}
          {showCategorySelect && categoryOptions.length > 0 && (
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
                {categoryOptions.map((c) => (
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

          {/* Только со скидкой */}
          <div className="mb-4 md:mb-6">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={filters.onlyDiscounts === '1'}
                onChange={(e) => setFilters({ ...filters, onlyDiscounts: e.target.checked ? '1' : '' })}
              />
              Только товары со скидкой
            </label>
          </div>

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
