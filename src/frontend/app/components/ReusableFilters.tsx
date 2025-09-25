"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaTh, FaThList } from 'react-icons/fa';
import { catalogStructure } from '../../lib/catalogStructure';

type Subcategory = { name: string; slug: string };
type Category = { name: string; slug: string; subcategories?: Subcategory[] };

interface ReusableFiltersProps {
  baseUrl?: string;
  categoriesList?: Array<{ label: string; value: string; subcategories?: Array<{ label: string; value: string }> }>;
  showPrice?: boolean;
  showGrid?: boolean;
  open?: boolean; // внешнее управление видимостью панели
  onClose?: () => void; // колбэк закрытия при клике вне или кнопке
}

export default function ReusableFilters({
  baseUrl = '/catalog/all-category',
  categoriesList,
  showPrice = true,
  showGrid = true,
  open: controlledOpen,
  onClose,
}: ReusableFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categories: Category[] = useMemo(() => {
    if (categoriesList && categoriesList.length > 0) {
      return categoriesList.map((c) => ({
        name: c.label,
        slug: c.value,
        subcategories: (c.subcategories || []).map((s) => ({ name: s.label, slug: s.value })),
      }));
    }
    return (catalogStructure as unknown as Category[]).map((c) => ({ name: c.name, slug: c.slug, subcategories: c.subcategories }));
  }, [categoriesList]);

  // allSubSlugs previously used for default selection; not needed now
  const initialFromUrl = useMemo<string[] | null>(() => {
    const raw = searchParams.get('categories');
    if (!raw) return null;
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }, [searchParams]);

  // Если в URL явно указан параметр categories, используем его. Иначе — по умолчанию
  // не отмечаем ни одной категории (пользователь должен вручную выбрать чекбоксы).
  // Пустой selected означает "искать по всем категориям" и при нажатии "Показать"
  // в `applyFilters` параметры categories не будут установлены.
  const defaultSelected = useMemo<string[]>(() => initialFromUrl ?? [], [initialFromUrl]);

  const [selected, setSelected] = useState<string[]>(() => defaultSelected);

  useEffect(() => {
    setSelected(defaultSelected);
  }, [defaultSelected]);

  const toggleSub = (slug: string) => setSelected(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);

  // UI: состояние панели фильтров (оверлей) и аккордеона категорий
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const open = typeof controlledOpen === 'boolean' ? controlledOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (typeof controlledOpen === 'boolean') {
      if (!val && onClose) onClose();
    } else {
      setInternalOpen(val);
      if (!val && onClose) onClose?.();
    }
  };
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set<string>());
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>(() => (searchParams.get('search') || ''));
  const [categoriesOpen, setCategoriesOpen] = useState<boolean>(false); // общий аккордеон списка категорий
  const toggleCategoryExpand = (slug: string) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(slug)) next.delete(slug); else next.add(slug);
    return next;
  });

  // Цена: инициализация из URL и состояние контролируемых инпутов
  const [minPrice, setMinPrice] = useState<string>(() => searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState<string>(() => searchParams.get('maxPrice') || '');
  useEffect(() => {
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
  }, [searchParams]);

  // panel and expanded state removed — categories are selected inline now

  const applyFilters = () => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.delete('categories');
    // search
    params.delete('search');
  // price
  params.delete('minPrice');
  params.delete('maxPrice');
    if (searchValue.trim().length > 0) params.set('search', searchValue.trim());
  const min = minPrice.trim();
  const max = maxPrice.trim();
  if (min && !Number.isNaN(Number(min))) params.set('minPrice', String(Math.max(0, Math.floor(Number(min)))));
  if (max && !Number.isNaN(Number(max))) params.set('maxPrice', String(Math.max(0, Math.floor(Number(max)))));
    if (selected.length > 0) params.set('categories', selected.join(','));
    const q = params.toString();
    const url = q ? `${baseUrl}?${q}` : baseUrl;
    router.push(url);
  };

  const resetCategories = () => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.delete('categories');
    params.delete('search');
  params.delete('minPrice');
  params.delete('maxPrice');
  setMinPrice('');
  setMaxPrice('');
    const q = params.toString();
    const url = q ? `${baseUrl}?${q}` : baseUrl;
    router.push(url);
  };

  const [gridCols, setGridCols] = useState<number>(() => parseInt(searchParams.get('grid') || '4', 10) || 4);
  const handleGridChange = (g: number) => { setGridCols(g); const p = new URLSearchParams(Array.from(searchParams.entries())); p.set('grid', String(g)); router.push(`${baseUrl}?${p.toString()}`); };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[1200] flex" role="dialog" aria-modal="true" id="filters-dialog">
          <div className="relative z-[1220] w-full md:w-1/2 max-w-[520px] bg-white h-full flex flex-col shadow-2xl animate-slide-in-left">
              <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-200">
              <h2 className="text-2xl font-bold tracking-tight">Фильтры</h2>
              <button onClick={() => setOpen(false)} aria-label="Закрыть" className="text-2xl leading-none px-2 py-1 rounded hover:bg-gray-100 cursor-pointer">×</button>
            </div>
            <div className="flex-1 overflow-y-auto px-0">
              {/* Список секций */}
              <div className="border-t border-gray-200 divide-y divide-gray-200">
                {/* Поиск */}
                <section>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(o => !o)}
                    className="w-full flex items-center justify-between px-6 sm:px-8 py-4 text-left hover:bg-gray-50 focus:outline-none cursor-pointer"
                    aria-expanded={searchOpen}
                  >
                    <span className="text-sm font-semibold">Поиск по названию</span>
                    <Chevron expanded={searchOpen} />
                  </button>
                  {searchOpen && (
                    <div className="px-6 sm:px-8 pb-5 -mt-1">
                      <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Введите название товара..."
                        className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-[#b3835a] focus:ring-1 focus:ring-[#b3835a] text-sm"
                      />
                    </div>
                  )}
                </section>

                {/* Категории */}
                <section>
                  <button
                    type="button"
                    onClick={() => setCategoriesOpen(o => !o)}
                    className="w-full flex items-center justify-between px-6 sm:px-8 py-4 text-left hover:bg-gray-50 focus:outline-none cursor-pointer"
                    aria-expanded={categoriesOpen}
                  >
                    <span className="text-sm font-semibold">Категории</span>
                    <Chevron expanded={categoriesOpen} />
                  </button>
                  {categoriesOpen && (
                    <div className="divide-y divide-gray-200">
                      {categories.map(cat => {
                        const subs = cat.subcategories || [];
                        const expandedCat = expanded.has(cat.slug);
                        return (
                          <div key={cat.slug}>
                            <button
                              type="button"
                              onClick={() => toggleCategoryExpand(cat.slug)}
                              className="w-full flex items-center justify-between px-6 sm:px-8 py-3 text-left hover:bg-gray-50 focus:outline-none cursor-pointer"
                              aria-expanded={expandedCat}
                            >
                              <span className="text-sm text-gray-800">{cat.name}</span>
                              <Chevron expanded={expandedCat} />
                            </button>
                            {expandedCat && (
                              <div className="px-6 sm:px-8 pb-4 pt-1 space-y-3 bg-white">
                                <div className="flex items-center justify-end gap-3 pb-2">
                                  <button
                                    type="button"
                                    onClick={() => setSelected(prev => {
                                      const slugs = subs.map(s => s.slug);
                                      const union = new Set([...prev, ...slugs]);
                                      return Array.from(union);
                                    })}
                                    className="text-[11px] uppercase tracking-wide text-[#b3835a] hover:underline cursor-pointer"
                                  >Выбрать все</button>
                                  <span className="h-3 w-px bg-gray-300" />
                                  <button
                                    type="button"
                                    onClick={() => setSelected(prev => prev.filter(sl => !subs.some(s => s.slug === sl)))}
                                    className="text-[11px] uppercase tracking-wide text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
                                  >Очистить</button>
                                </div>
                                <div className="grid gap-2">
                                  {subs.map(s => {
                                    const checked = selected.includes(s.slug);
                                    return (
                                      <label key={s.slug} className="flex items-center gap-3 text-sm cursor-pointer select-none">
                                        <input
                                          type="checkbox"
                                          className="h-4 w-4 rounded border-gray-400 text-[#b3835a] focus:ring-[#b3835a]"
                                          checked={checked}
                                          onChange={() => toggleSub(s.slug)}
                                        />
                                        <span className="text-gray-800">{s.name}</span>
                                      </label>
                                    );
                                  })}
                                  {subs.length === 0 && <div className="text-xs text-gray-500">Нет подкатегорий</div>}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {showPrice && (
                  <section>
                    <div className="px-6 sm:px-8 py-4">
                      <h3 className="text-sm font-semibold">Цена</h3>
                    </div>
                    <div className="px-6 sm:px-8 pb-5 -mt-1">
                      <div className="flex gap-4">
                        <input
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value.replace(/\D+/g, ''))}
                          placeholder="От"
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <input
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value.replace(/\D+/g, ''))}
                          placeholder="До"
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    </div>
                  </section>
                )}

                {showGrid && (
                  <section>
                    <div className="px-6 sm:px-8 py-4">
                      <h3 className="text-sm font-semibold">Вид карточек</h3>
                    </div>
                    <div className="px-6 sm:px-8 pb-5 -mt-1">
                      <div className="flex gap-2">
                        <button onClick={() => handleGridChange(2)} className={`p-2 rounded-md border ${gridCols === 2 ? 'bg-[#E5D3B3] border-[#E5D3B3]' : 'bg-white hover:bg-gray-50'} cursor-pointer`}><FaTh /></button>
                        <button onClick={() => handleGridChange(4)} className={`p-2 rounded-md border ${gridCols === 4 ? 'bg-[#E5D3B3] border-[#E5D3B3]' : 'bg-white hover:bg-gray-50'} cursor-pointer`}><FaThList /></button>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </div>
            <div className="px-6 sm:px-8 py-5 border-t border-gray-200 flex gap-4 bg-white">
              <button
                type="button"
                onClick={resetCategories}
                className="flex-1 py-3 rounded-md border border-[#b3835a] text-[#b3835a] font-medium hover:bg-[#b3835a]/10 cursor-pointer"
              >Сбросить</button>
              <button
                type="button"
                onClick={() => { applyFilters(); setOpen(false); }}
                className="flex-1 py-3 rounded-md bg-[#b3835a] text-white font-semibold hover:bg-[#9e6f48] cursor-pointer"
              >Показать</button>
            </div>
          </div>
          {/* фоновая панель справа (desktop) - используем фон страницы + тень вместо чёрного затемнения */}
          <div
            className="hidden md:block flex-1 bg-black/30 shadow-menu cursor-pointer"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* на мобильных перекрываем весь экран фоном страницы с тенью и высоким z-index,
              чтобы не было видно других элементов (и, как следствие, лишнего крестика) */}
          <div
            className="md:hidden fixed inset-0 z-[1190] bg-[#f5f1e9] shadow-menu cursor-pointer"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}
    </>
  );
}

//  стрелка раскрытия 
function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <span
      className={`inline-block transition-transform duration-200 ease-out text-gray-500 ${expanded ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </span>
  );
}