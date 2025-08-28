// types/index.ts
// Типы для товаров и утилиты для проверки и получения изображения

export interface Product {
  id: number;
  title: string;
  price: number;
  description?: string;
  category?: string | null;
  subcategory?: string | null;
  image?: string | null;
  originalPrice?: number;
  discount?: number | null;
  size?: string | null;
  color?: string | null;
  article?: string | null;
  pillowcases?: string | null;
  count?: number;
  rating?: {
    rate: number;
    count: number;
  };
  images?: string[];
  isConfirmed?: boolean;
  barcode?: string | null;
  comment?: string | null;
  quantity?: number; // Количество на складе
  reserved?: number; // Зарезервированное количество
  createdAt?: string;
  updatedAt?: string;
  // Новые поля для связей с категориями
  categoryId?: number | null;
  subcategoryId?: number | null;
  categoryModel?: Category | null;
  subcategoryModel?: Subcategory | null;
  adminNote?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  isActive: boolean;
  sortOrder: number;
  subcategories?: Subcategory[];
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  sortOrder: number;
  categoryId: number;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

// Типы для API ответов
export interface ProductsApiResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ProductFilters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  priceFrom?: number;
  priceTo?: number;
  isConfirmed?: string;
  sortBy?: 'price' | 'title' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  // Добавлено: фильтрация по категориям (slug или список slug)
  categories?: string | string[];
}

export interface FilterOptions {
  priceRange: {
    min: number;
    max: number;
  };
}

export const isProduct = (item: unknown): item is Product => {
  if (!item || typeof item !== 'object') return false;
  const product = item as Record<string, unknown>;
  return (
    typeof product.id === 'number' &&
    typeof product.title === 'string' &&
    typeof product.price === 'number'
  );
};

/**
 * Нормализация путей к изображениям.
 * - убирает абсолютный localhost:3001
 * - нормализует обратные слэши и добавляет ведущий слэш
 */
export const normalizeImageUrl = (input?: string | null, fallback = '/fon.png'): string => {
  let url = (input || '').trim();
  if (!url) return fallback;

  // Приводим старые пути инста к новым
  try {
    const decoded = decodeURIComponent(url);
    if (decoded.startsWith('/инста/')) {
      url = decoded.replace('/инста/', '/instagram/');
    }
  } catch {
    if (url.startsWith('/инста/')) {
      url = url.replace('/инста/', '/instagram/');
    }
  }

  if (url.startsWith('http://localhost:3001/инста/')) {
    url = url.replace('http://localhost:3001/инста/', '/instagram/');
  }

  // Если это относительный путь — оставляем как есть для next/image
  if (url.startsWith('/')) return url;

  // Страховка
  if (!/^https?:\/\//i.test(url)) return fallback;
  return url;
};

/**
 * Хелпер для безопасного получения изображения
 */
export const getProductImage = (product: Product, fallback = '/fon.png') => {
  // Сначала проверяем массив изображений
  if (Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string') {
    return normalizeImageUrl(product.images[0], fallback);
  }
  
  if (typeof product.image === 'string' && product.image.length > 0) {
    return normalizeImageUrl(product.image, fallback);
  }
  
  return fallback;
};

/**
 * Хелпер для форматирования названия товара
 */
export const formatProductTitle = (title: string): string => {
  if (!title) return '';
  
  // Разбиваем на слова и приводим каждое к правильному регистру
  return title
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Специальные сокращения оставляем как есть
      if (['см', 'мм', 'кг', 'гр', 'мл', 'л'].includes(word)) {
        return word;
      }
      // Первую букву делаем заглавной
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

// Реэкспорт типов заказов для удобства импорта из '@/types'
export * from './order';