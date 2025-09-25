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
  let raw = (input || '').trim();
  if (!raw) return fallback;

  // Унификация обратных слэшей
  raw = raw.replace(/\\+/g, '/');

  // Приводим старые пути инста к новым (и локальный абсолют)
  const replaceInsta = (val: string) => val.replace(/^(?:https?:\/\/localhost:3001)?\/инста\//, '/instagram/');
  try {
    const decoded = decodeURIComponent(raw);
    raw = replaceInsta(decoded);
  } catch {
    raw = replaceInsta(raw);
  }

  // Если уже абсолютный http(s) — оставляем (внешние CDN)
  if (/^https?:\/\//i.test(raw)) return raw;

  // Удаляем возможный префикс /public (иногда попадает в данные)
  raw = raw.replace(/^\/public(?![a-zA-Z0-9-_])/i, '');

  // Гарантируем ведущий слэш
  if (!raw.startsWith('/')) raw = '/' + raw;

  // Кодируем каждый сегмент (кроме уже закодированных %XX)
  const segments = raw.split('/').map(seg => {
    if (!seg) return ''; // первый (пустой) или двойные слэши
    // если уже содержит %XX — считаем сегмент закодированным
    if (/%[0-9A-Fa-f]{2}/.test(seg)) return seg;
    // некритично: пробелы и кириллица кодируем
    return encodeURIComponent(seg);
  });
  let normalized = segments.join('/');
  if (!normalized.startsWith('/')) normalized = '/' + normalized;

  // Убираем двойные слэши (кроме протокола — здесь их нет)
  normalized = normalized.replace(/\/+/g, '/');

  // Простая защита от data: и javascript:
  if (/^(?:javascript:|data:)/i.test(normalized)) return fallback;

  return normalized || fallback;
};

/**
 * Хелпер для безопасного получения изображения
 */
export const getProductImage = (product: Product, fallback = '/fon.png') => {
  // 1. Берём первое валидное из массива images
  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      if (typeof img === 'string' && img.trim()) {
        return normalizeImageUrl(img, fallback);
      }
    }
  }
  // 2. Поле image
  if (typeof product.image === 'string' && product.image.trim()) {
    return normalizeImageUrl(product.image, fallback);
  }
  return fallback;
};

/**
 * Хелпер для форматирования названия товара
 */
export const formatProductTitle = (title: string): string => {
  if (!title) return '';
  // Нормализуем: весь текст делаем строчным, затем только первую букву строки — заглавной.
  const trimmed = title.trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

// Реэкспорт типов заказов для удобства импорта из '@/types'
export * from './order';