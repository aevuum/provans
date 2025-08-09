'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { toggleSearch } from '@/lib/features/ui/uiSlice';

interface SearchBarProps {
  isMobile?: boolean;
  className?: string;
  placeholder?: string;
}

interface SearchSuggestion {
  id: string;
  title: string;
  category: string;
  price: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  isMobile = false,
  className = '',
  placeholder = 'Поиск по сайту'
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showSearch } = useAppSelector((state) => state.ui);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Обработчик поиска с автодополнением
  const handleSearchInput = (value: string) => {
    setQuery(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/products/search/suggestions?q=${encodeURIComponent(value.trim())}&limit=5`);
        
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(data.suggestions?.length > 0);
        }
      } catch (_error) {
        console.error('Error fetching suggestions:', _error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    }, 200); // Уменьшили дебаунс с 300 до 200мс
  };

  // Выполнить поиск
  const executeSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      router.push(`/catalog/все-категории?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setQuery('');
      
      if (isMobile) {
        dispatch(toggleSearch(false));
      }
    }
  };

  // Обработчик отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  // Выбор предложения
  const selectSuggestion = (suggestion: SearchSuggestion) => {
    executeSearch(suggestion.title);
  };

  // Закрытие по клику вне области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Автофокус для мобильного поиска
  useEffect(() => {
    if (isMobile && showSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMobile, showSearch]);

  const searchContent = (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder={placeholder}
            className={`w-full py-2.5 px-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5D3B3] focus:border-[#E5D3B3] ${className}`}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C5C27] hover:text-[#5D4420] transition-colors disabled:opacity-50"
            aria-label="Поиск"
          >
            <FaSearch className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Автодополнение */}
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin w-4 h-4 border-2 border-[#E5D3B3] border-t-transparent rounded-full mx-auto mb-2"></div>
              Поиск...
            </div>
          ) : (
            suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => selectSuggestion(suggestion)}
                className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 truncate">
                      {suggestion.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {suggestion.category}
                    </div>
                  </div>
                  <div className="text-[#7C5C27] font-medium ml-2">
                    {suggestion.price.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );

  // Мобильная версия с модальным окном
  if (isMobile && showSearch) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
        <div className="bg-white m-4 rounded-lg p-6 mt-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Поиск товаров</h3>
            <button
              onClick={() => dispatch(toggleSearch(false))}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          
          {searchContent}
          
          <p className="text-sm text-gray-500 mt-3">
            Введите минимум 2 символа для поиска предложений
          </p>
        </div>
      </div>
    );
  }

  // Обычная версия для десктопа
  return searchContent;
};

// Мобильная кнопка поиска
export const MobileSearchButton: React.FC = () => {
  const dispatch = useAppDispatch();
  
  return (
    <button
      className="lg:hidden text-gray-600 hover:text-[#7C5C27] transition-colors"
      onClick={() => dispatch(toggleSearch(true))}
      aria-label="Поиск"
    >
      <FaSearch className="w-5 h-5" />
    </button>
  );
};
