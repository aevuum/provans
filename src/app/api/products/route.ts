// app/api/products/route.ts - Унифицированный API товаров (file-based)
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// Тип минимального продукта из файла
interface FileProduct {
  id: number;
  title: string;
  price: number;
  discount?: number | null;
  category?: string | null;
  subcategory?: string | null;
  image?: string | null;
  images?: string[];
  size?: string | null;
  comment?: string | null;
}

// Нормализация строки для поиска: нижний регистр + убрать пробелы
const norm = (s: string) => (s || '').toLowerCase().replace(/\s+/g, '');

async function loadProductsFromFile(): Promise<FileProduct[]> {
  const filePath = path.join(process.cwd(), 'new-product.json');
  const content = await fs.readFile(filePath, 'utf8');
  const parsed: unknown = JSON.parse(content);

  let arrRaw: unknown;
  if (Array.isArray(parsed)) {
    arrRaw = parsed;
  } else if (
    parsed &&
    typeof parsed === 'object' &&
    Array.isArray((parsed as { products?: unknown }).products)
  ) {
    arrRaw = (parsed as { products: unknown[] }).products;
  } else {
    arrRaw = [];
  }

  const arr = arrRaw as unknown[];

  // Приводим к единому виду и страхуем поля
  return arr.map((p, idx: number) => {
    const rec = (p ?? {}) as Record<string, unknown>;
    const idVal = rec.id;
    const priceVal = rec.price;
    const discountVal = rec.discount;
    const imagesVal = rec.images;
    const imageVal = rec.image;

    const id: number = typeof idVal === 'number' ? idVal : idx + 1;
    const price: number = typeof priceVal === 'number' ? priceVal : (typeof priceVal === 'string' ? parseFloat(priceVal) : 0) || 0;
    const discount: number = typeof discountVal === 'number' ? discountVal : (typeof discountVal === 'string' ? parseFloat(discountVal) : 0) || 0;

    let image: string | null = null;
    if (typeof imageVal === 'string') image = imageVal;
    else if (Array.isArray(imagesVal) && typeof imagesVal[0] === 'string') image = imagesVal[0];

    const images: string[] = Array.isArray(imagesVal) && typeof imagesVal[0] === 'string' ? (imagesVal as string[]) : (image ? [image] : []);

    return {
      id,
      title: String(rec.title || ''),
      price,
      discount,
      category: rec.category ? String(rec.category) : null,
      subcategory: rec.subcategory ? String(rec.subcategory) : null,
      image,
      images,
      size: rec.size ? String(rec.size) : null,
      comment: rec.comment ? String(rec.comment) : null,
    } as FileProduct;
  });
}

function hasAnyImage(p: FileProduct): boolean {
  const img = (p.image || '').toString().trim();
  const imgs = Array.isArray(p.images) ? p.images : [];
  const imgsClean = imgs.map((s) => (s || '').toString().trim()).filter(Boolean);
  return Boolean(img) || imgsClean.length > 0;
}

function applyFilters(
  products: FileProduct[],
  {
    search,
    minPrice,
    maxPrice,
    categories,
    type,
  }: { search?: string | null; minPrice?: string | null; maxPrice?: string | null; categories?: string[]; type?: string | null }
) {
  let res = products.slice();

  // ИСКЛЮЧАЕМ товары без фото из публичной выдачи
  res = res.filter(hasAnyImage);

  // Тип подбора
  if (type === 'discount') {
    res = res.filter((p) => (p.discount || 0) > 0);
  }
  // Для type=new просто сортируем по id desc ниже и обрежем лимитом — последние добавленные

  // Цена
  const min = minPrice ? parseInt(minPrice) : undefined;
  const max = maxPrice ? parseInt(maxPrice) : undefined;
  if (typeof min === 'number') res = res.filter((p) => p.price >= min);
  if (typeof max === 'number') res = res.filter((p) => p.price <= max);

  // Категории (точное совпадение по slug/значению из файла, без синонимов)
  if (categories && categories.length > 0) {
    const set = new Set(categories.map((c) => c.toLowerCase().trim()));
    res = res.filter((p) => (p.category ? set.has(p.category.toLowerCase().trim()) : false));
  }

  // Поиск: по заголовку и комментарию, без регистра и пробелов
  if (search && search.trim()) {
    const q = norm(search);
    res = res.filter((p) => norm(p.title).includes(q) || (p.comment ? norm(p.comment).includes(q) : false));
  }

  return res;
}

function applySort(
  products: FileProduct[],
  sortBy?: string | null,
  sortOrder?: 'asc' | 'desc'
) {
  const order = sortOrder === 'asc' ? 1 : -1;
  const arr = products.slice();

  const by = (a: number | string, b: number | string) => (a < b ? -1 : a > b ? 1 : 0) * order;

  switch (sortBy) {
    case 'price':
      arr.sort((a, b) => by(a.price, b.price));
      break;
    case 'title':
      arr.sort((a, b) => by(a.title.toLowerCase(), b.title.toLowerCase()));
      break;
    case 'discount':
      arr.sort((a, b) => by(a.discount || 0, b.discount || 0));
      break;
    case 'createdAt':
    default:
      // В данных нет createdAt — используем id как прокси «свежести»
      arr.sort((a, b) => by(a.id, b.id));
      break;
  }

  return arr;
}

function paginate(products: FileProduct[], page: number, limit: number) {
  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;
  const end = start + limit;
  return {
    items: products.slice(start, end),
    page: safePage,
    limit,
    total,
    totalPages,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    // Параметры
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const type = searchParams.get('type'); // new | discount | popular | all
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || (type === 'new' ? 'createdAt' : 'createdAt');
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || (type === 'new' ? 'desc' : 'desc');

    const categoriesParam = searchParams.get('categories') || searchParams.get('category') || '';
    const categories = categoriesParam
      ? categoriesParam.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    // Данные
    const products = await loadProductsFromFile();

    // Фильтры
    let filtered = applyFilters(products, { search, minPrice, maxPrice, categories, type });

    // Сортировка
    filtered = applySort(filtered, sortBy, sortOrder);

    // Если тип new — это "последние добавленные", после сортировки обрежем лимитом, но пагинация всё равно работает
    if (type === 'new') {
      // уже отсортировано по id desc, поэтому просто обрезаем сверху
      filtered = filtered.slice(0, Math.max(1, limit));
    }

    // Пагинация
    const { items, total, totalPages, page: pageOut, limit: limitOut } = paginate(filtered, page, limit);

    // Формат совпадающий с предыдущим API
    const formatted = items.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      originalPrice: p.price, // исходной цены нет — используем price
      discount: p.discount || 0,
      description: p.comment || undefined,
      size: p.size || undefined,
      category: p.category || undefined,
      subcategory: p.subcategory || undefined,
      isConfirmed: true,
      quantity: undefined,
      reserved: undefined,
      barcode: undefined,
      image: p.image || undefined,
      images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
      createdAt: undefined,
      updatedAt: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: {
        products: formatted,
        pagination: {
          page: pageOut,
          limit: limitOut,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching products (file-based):', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при получении товаров' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const page = parseInt(String(body.page ?? '1'));
    const limit = parseInt(String(body.limit ?? '24'));
    const type = (body.type as string | undefined) || undefined;
    const search = (body.search as string | undefined) || undefined;
    const minPrice = body.minPrice != null ? String(body.minPrice) : undefined;
    const maxPrice = body.maxPrice != null ? String(body.maxPrice) : undefined;
    const sortBy = (body.sortBy as string | undefined) || (type === 'new' ? 'createdAt' : 'createdAt');
    const sortOrder = (body.sortOrder as 'asc' | 'desc' | undefined) || (type === 'new' ? 'desc' : 'desc');

    const categoriesInput = body.categories as string[] | string | undefined;
    const categories = Array.isArray(categoriesInput)
      ? categoriesInput
      : typeof categoriesInput === 'string' && categoriesInput
      ? categoriesInput.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    const products = await loadProductsFromFile();

    let filtered = applyFilters(products, { search, minPrice, maxPrice, categories, type });

    filtered = applySort(filtered, sortBy, sortOrder);

    if (type === 'new') {
      filtered = filtered.slice(0, Math.max(1, limit));
    }

    const { items, total, totalPages, page: pageOut, limit: limitOut } = paginate(filtered, page, limit);

    const formatted = items.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      originalPrice: p.price,
      discount: p.discount || 0,
      description: p.comment || undefined,
      size: p.size || undefined,
      category: p.category || undefined,
      subcategory: p.subcategory || undefined,
      isConfirmed: true,
      quantity: undefined,
      reserved: undefined,
      barcode: undefined,
      image: p.image || undefined,
      images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
      createdAt: undefined,
      updatedAt: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: {
        products: formatted,
        pagination: {
          page: pageOut,
          limit: limitOut,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching products via POST (file-based):', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при получении товаров' },
      { status: 500 }
    );
  }
}
