'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaFilter, FaChevronDown, FaChevronUp, FaTh, FaThLarge, FaThList } from 'react-icons/fa';
import { catalogStructure } from '../../lib/catalogStructure';

interface ReusableFiltersProps {
  showSearch?: boolean;
  showCategory?: boolean;
  showPrice?: boolean;
  baseUrl: string;
  categorySlug?: string;
  onGridChange?: (grid: number) => void;
  panelMode?: boolean;
  open?: boolean;
  onClose?: () => void;
  showGrid?: boolean;
  categoriesList?: Array<{ label: string; value: string; subcategories?: Array<{ label: string; value: string }> }>;
  showAllCategoriesOption?: boolean;
  onlySubcategories?: boolean;

  showDiscountCheckbox?: boolean;
  showNewCheckbox?: boolean;
  showSubcategory?: boolean;
}

type CategoryOption = { label: string; value: string };

export default function ReusableFilters({
  showSearch = true,
  showCategory = true,
  showPrice = true,
  baseUrl,
  categorySlug,
  onGridChange,
  panelMode = false,
  open = false,
  onClose,
  showGrid = true,
  categoriesList,
  showAllCategoriesOption = false,
  onlySubcategories = false,
  showDiscountCheckbox = true,
  showNewCheckbox = true,
  showSubcategory = false,
}: ReusableFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Универсальная структура категорий/подкатегорий
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState<CategoryOption[]>([]);
  const [hasSubcategories, setHasSubcategories] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categories: searchParams.get('categories') || '',
    subcategory: searchParams.get('subcategory') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    onlyDiscounts: searchParams.get('onlyDiscounts') || '',
    available: searchParams.get('available') === '1' ? '1' : '',
  });

  const [isOpen, setIsOpen] = useState(false);
  const [gridCols, setGridCols] = useState(parseInt(searchParams.get('grid') || '4'));

  useEffect(() => {
    // Если явно передан список категорий — используем его
    if (categoriesList && categoriesList.length > 0) {
      setCategoryOptions(categoriesList.map(c => ({ label: c.label, value: c.value })));
      // Если выбрана категория — ищем подкатегории
      const selectedCat = categoriesList.find(c => c.value === filters.categories);
      if (selectedCat && selectedCat.subcategories && selectedCat.subcategories.length > 0) {
        setSubcategoryOptions(selectedCat.subcategories);
        setHasSubcategories(true);
      } else {
        setSubcategoryOptions([]);
        setHasSubcategories(false);
      }
    } else {
      // Старый режим: из catalogStructure
      const currentCategory = catalogStructure.find(cat => cat.slug === categorySlug);
      if (currentCategory?.subcategories && currentCategory.subcategories.length > 0) {
        setSubcategoryOptions(currentCategory.subcategories.map(sub => ({ label: sub.name, value: sub.slug })));
        setHasSubcategories(true);
      } else {
        setSubcategoryOptions([]);
        setHasSubcategories(false);
      }
      // Категории для выбора (если не только подкатегории)
      if (!onlySubcategories) {
        (async () => {
          try {
            const res = await fetch('/api/categories/available', { cache: 'no-store' });
            if (!res.ok) return;
            const data = await res.json();
            type ApiCategory = { slug: string; name: string; count: number; sortOrder: number };
            const cats: CategoryOption[] = (data?.categories || []).map((c: ApiCategory) => ({
              label: c.name || c.slug,
              value: c.slug,
            }));
            setCategoryOptions(cats);
          } catch (err) {
            console.error('Failed to load categories:', err);
          }
        })();
      }
    }
  }, [categoriesList, filters.categories, categorySlug, onlySubcategories]);

  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      categories: searchParams.get('categories') || '',
      subcategory: searchParams.get('subcategory') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      onlyDiscounts: searchParams.get('onlyDiscounts') || '',
      available: searchParams.get('available') === '1' ? '1' : '',
    });
    setGridCols(parseInt(searchParams.get('grid') || '3'));
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value && !(key === 'available' && value !== '1')) {
        params.set(key, String(value).trim());
      }
    });

    params.set('grid', gridCols.toString());

    const normalizedBase = decodeURIComponent(baseUrl).replace('/catalog/все-категории', '/catalog/all');
    router.push(`${normalizedBase}?${params.toString()}`);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      categories: '',
      subcategory: '',
      minPrice: '',
      maxPrice: '',
      onlyDiscounts: '',
      available: '',
    });
    setGridCols(4);
    const normalizedBase = decodeURIComponent(baseUrl).replace('/catalog/все-категории', '/catalog/all');
    const p = new URLSearchParams(); p.set('grid', '4'); router.push(`${normalizedBase}?${p.toString()}`);
  };

  const handleGridChange = (newGrid: number) => {
    setGridCols(newGrid);
    if (onGridChange) onGridChange(newGrid);
  };

  // const decodedBase = decodeURIComponent(baseUrl);

  // Показывать селектор категории, если явно разрешено и есть опции
  const showCategorySelect = showCategory && !onlySubcategories && categoryOptions.length > 0;
  // Показывать селектор подкатегории, если есть подкатегории и только подкатегории разрешены или showSubcategory
  const showSubcategorySelect = (onlySubcategories || showSubcategory) && hasSubcategories && subcategoryOptions.length > 0;

  // visible state: when panelMode is used, visibility controlled by prop `open`
  const visible = panelMode ? Boolean(open) : isOpen;

  const content = (
    <>
      <div
        className="flex items-center justify-between p-4 md:p-6 cursor-pointer border-b bg-mint-50"
        onClick={() => !panelMode && setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-3">
          <FaFilter className="text-gray-600 text-lg" />
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Фильтры</h2>
        </div>
        <div className="flex items-center space-x-2">
          {panelMode ? (
            <button onClick={() => onClose && onClose()} aria-label="Закрыть фильтры" className="text-2xl leading-none">×</button>
          ) : (
            visible ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />
          )}
        </div>
      </div>

      <div className={`transition-all duration-300 overflow-auto ${visible ? 'max-h-screen p-4 md:p-6' : 'max-h-0'}`}>
        {showSearch && (
          <div className="mb-4 md:mb-6">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Поиск по названию
            </label>
            <input
              id="search"
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Введите название товара..."
              className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-md focus:ring-[#E5D3B3] focus:border-[#E5D3B3] text-base"
            />
          </div>
        )}

        {showCategorySelect && (
          <div className="mb-4 md:mb-6">
            <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-2">
              Категория
            </label>
            <div className="relative">
              {/* Кастомная стрелка справа */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M7 8l3 3 3-3" stroke="#333" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
              <select
                id="categories"
                value={filters.categories}
                onChange={(e) => setFilters({ ...filters, categories: e.target.value, subcategory: '' })}
                className="w-full pl-3 pr-8 md:pl-3 md:pr-8 py-2.5 md:py-3 border border-blue-600 rounded-md focus:ring-[#E5D3B3] focus:border-[#E5D3B3] text-base appearance-none"
              >
                {showAllCategoriesOption && <option value="">Все категории</option>}
                {/* Категории и подкатегории одним списком, подкатегории с отступом */}
                {categoriesList
                  ? categoriesList.flatMap(cat => [
                      <option key={cat.value} value={cat.value}>{cat.label}</option>,
                      ...(cat.subcategories && cat.subcategories.length > 0
                        ? cat.subcategories.filter(sub => sub.value !== cat.value).map(sub => (
                            <option key={cat.value + '-' + sub.value} value={sub.value}>&nbsp;&nbsp;{sub.label}</option>
                          ))
                        : [])
                    ])
                  : categoryOptions.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
              </select>
            </div>
          </div>
        )}

        {/* Старый селектор подкатегорий для других режимов */}
        {showSubcategorySelect && (
          <div className="mb-4 md:mb-6">
            <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">
              Подкатегория
            </label>
            <select
              id="subcategory"
              value={filters.subcategory}
              onChange={(e) => setFilters({ ...filters, subcategory: e.target.value })}
              className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-md focus:ring-[#E5D3B3] focus:border-[#E5D3B3] text-base"
            >
              <option value="">Все подкатегории</option>
              {subcategoryOptions.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        )}

  {/* Удалено: старый рендер подкатегорий через currentCategory */}

  {showPrice && (
    <div className="mb-4 md:mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Цена
      </label>
      <div className="flex gap-3 w-full">
        <div className="relative w-1/2 min-w-0">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value.replace(/\D/g, '') })}
            placeholder="От"
            className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-md focus:ring-[#E5D3B3] focus:border-[#E5D3B3] text-base pr-7 appearance-none"
            style={{ MozAppearance: 'textfield' }}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none">₽</span>
        </div>
        <div className="relative w-1/2 min-w-0">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value.replace(/\D/g, '') })}
            placeholder="До"
            className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-md focus:ring-[#E5D3B3] focus:border-[#E5D3B3] text-base pr-7 appearance-none"
            style={{ MozAppearance: 'textfield' }}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none">₽</span>
        </div>
      </div>
    </div>
  )}

        {showDiscountCheckbox && (
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
        )}
        {showNewCheckbox && (
          <div className="mb-4 md:mb-6">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={filters.available === '1'}
                onChange={(e) => setFilters({ ...filters, available: e.target.checked ? '1' : '' })}
              />
              Новинки
            </label>
          </div>
        )}

        {/* Выбор сетки (скрывается, если showGrid=false) */}
        {showGrid && (
          <div className="mb-4 md:mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Вид карточек</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleGridChange(2)}
                className={`p-2 rounded-md transition-colors ${gridCols === 2 ? 'bg-[#E5D3B3] text-gray-800' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                <FaTh className="text-sm" />
              </button>
              <button
                onClick={() => handleGridChange(3)}
                className={`p-2 rounded-md transition-colors ${gridCols === 3 ? 'bg-[#E5D3B3] text-gray-800' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                <FaThLarge className="text-sm" />
              </button>
              <button
                onClick={() => handleGridChange(4)}
                className={`p-2 rounded-md transition-colors ${gridCols === 4 ? 'bg-[#E5D3B3] text-gray-800' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                <FaThList className="text-sm" />
              </button>
            </div>
          </div>
        )}

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
    </>
  );

  if (panelMode) {
    return (
      <div className={`fixed inset-0 z-50 ${visible ? '' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${visible ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => onClose && onClose()}
        />

        {/* Panel */}
        <div className={`absolute top-0 left-0 h-full bg-white shadow-xl w-[320px] sm:w-96 transform transition-transform ${visible ? 'translate-x-0' : '-translate-x-full'}`}>
          {content}
        </div>
      </div>
    );
  }

  // Новый визуал: современный header, больше воздуха, акцентные цвета
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-0 md:p-0 max-w-full">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M3 5h18M6 12h12M10 19h4" stroke="#3B4756" strokeWidth="2" strokeLinecap="round"/></svg>
          <span className="text-2xl font-bold text-[#3B4756] tracking-tight">Фильтры</span>
        </div>
        {panelMode && (
          <button onClick={onClose} className="text-3xl text-gray-900 hover:text-[#E5D3B3] px-2 py-1 rounded transition-colors">×</button>
        )}
      </div>
      <div className="px-6 py-6 md:py-8">
        {content}
      </div>
    </div>
  );
}