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
  material?: string | null;
  rating?: {
    rate: number;
    count: number;
  };
  images?: string[];
  isConfirmed?: boolean;
  country?: string | null;
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
  material?: string;
  country?: string;
  isConfirmed?: string;
  sortBy?: 'price' | 'title' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface FilterOptions {
  materials: string[];
  countries: string[];
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
 * Хелпер для безопасного получения изображения
 */
export const getProductImage = (product: Product, fallback = '/placeholder.jpg') => {
  // Сначала проверяем массив изображений
  if (Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string') {
    const imagePath = product.images[0];
    // Если путь начинается с /uploads, то это уже правильный путь для public
    return imagePath;
  }
  
  // Затем проверяем основное изображение
  if (typeof product.image === 'string' && product.image.length > 0) {
    const imagePath = product.image;
    // Если путь начинается с /uploads, то это уже правильный путь для public
    return imagePath;
  }
  
  // Возвращаем fallback
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