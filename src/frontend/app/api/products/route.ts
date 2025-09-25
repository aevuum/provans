// app/api/products/route.ts - Унифицированный API товаров (file-based)
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { prisma } from '@/lib/prisma';
import { normalizeText } from '@/lib/text/normalize';
import type { ProductMinimal } from '@/lib/prisma-types';

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
  barcode?: string | null;
}

// Нормализация строки для поиска вынесена в общую утилиту (normalizeText)
const norm = normalizeText;

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

    const barcode = rec.barcode ? String(rec.barcode) : (rec.article ? String(rec.article) : null);

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
      barcode,
    } as FileProduct;
  });
}

// --- Resilient Prisma helper: timeout + retries, returns undefined on failure ---
async function tryPrisma<T>(fn: () => Promise<T>, opts?: { timeoutMs?: number; retries?: number; retryDelayMs?: number; }): Promise<T | undefined> {
  const timeoutMs = opts?.timeoutMs ?? 1500;
  const retries = opts?.retries ?? 1;
  const retryDelayMs = opts?.retryDelayMs ?? 300;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const p = fn();
      const res = await Promise.race([
        p,
        new Promise<undefined>((_, rej) => setTimeout(() => rej(new Error('prisma:timeout')), timeoutMs)),
      ]);
      return res as T;
    } catch (err) {
      // последняя попытка — вернуть undefined
      if (attempt === retries) {
        console.warn('Prisma helper: operation failed after retries:', err);
        return undefined;
      }
  // небольшая задержка перед повтором
  await new Promise((r) => setTimeout(r, retryDelayMs));
    }
  }
  return undefined;
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
    includeNoImage,
    onlyDiscounts,
  }: { search?: string | null; minPrice?: string | null; maxPrice?: string | null; categories?: string[]; type?: string | null; includeNoImage?: boolean; onlyDiscounts?: boolean }
) {
  let res = products.slice();

  // ИСКЛЮЧАЕМ товары без фото из публичной выдачи
  if (!includeNoImage) {
    res = res.filter(hasAnyImage);
  }

  // Тип подбора
  if (type === 'discount' || onlyDiscounts) {
    res = res.filter((p) => (p.discount || 0) > 0);
  }

  // Цена
  const min = minPrice ? parseInt(minPrice) : undefined;
  const max = maxPrice ? parseInt(maxPrice) : undefined;
  if (typeof min === 'number') res = res.filter((p) => p.price >= min);
  if (typeof max === 'number') res = res.filter((p) => p.price <= max);

  // --- Исправление: если категория "all" или её синонимы — не фильтруем по категории ---
  const ignoreCategories = new Set(['all', 'все-категории', 'all-shop', 'allshop', 'promotions', 'акции']);
  if (
    categories &&
    categories.length > 0 &&
    !categories.some((c) => ignoreCategories.has(c.toLowerCase()))
  ) {
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
  const limit = parseInt(searchParams.get('limit') || (searchParams.get('type') === 'new' ? '100' : '24'));
    const type = searchParams.get('type'); // new | discount | popular | all
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || (type === 'new' ? 'createdAt' : 'createdAt');
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || (type === 'new' ? 'desc' : 'desc');

  const categoriesParam = searchParams.get('categories') || searchParams.get('category') || '';
    let categories = categoriesParam
      ? categoriesParam.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    // Fallback: если клиент не передал категорию, попробуем извлечь её из Referer /catalog/{slug}
    if (!categories || categories.length === 0) {
      const ref = req.headers.get('referer') || '';
      try {
        const u = new URL(ref);
        const parts = u.pathname.split('/').filter(Boolean);
        const idx = parts.indexOf('catalog');
        if (idx !== -1 && parts[idx + 1]) {
          const slug = parts[idx + 1];
          const ignore = new Set(['all', 'все-категории', 'new', 'новинки', 'promotions', 'акции']);
          if (!ignore.has(slug)) {
            categories = [slug];
          }
        }
      } catch {
        // ignore
      }
    }

  const onlyDiscounts = (() => {
      const v = (searchParams.get('onlyDiscounts') || '').toLowerCase();
      return v === '1' || v === 'true' || v === 'yes';
    })();

    const includeNoImage = (() => {
      const v = (searchParams.get('includeNoImage') || '').toLowerCase();
      return v === '1' || v === 'true' || v === 'yes';
    })();

    // Если в БД есть подтвержденные товары — попробуем отдать их через Prisma
    const available = (() => {
      const v = (searchParams.get('available') || '').toLowerCase();
      return v === '1' || v === 'true';
    })();

    try {
      // Безопасная попытка обращения к Prisma: в некоторых билдах БД может быть недоступна.
      // Если Prisma не отвечает — мы не должны падать на этапе сборки, а перейти к file-based fallback.
      // даём Prisma шанс через resilient wrapper
      const dbCount = await tryPrisma(() => prisma.product.count({ where: { isConfirmed: true } }), { timeoutMs: 1500, retries: 1 });

      if (typeof dbCount === 'number' && dbCount > 0) {
        const where: any = { isConfirmed: true };

        if (type === 'discount' || onlyDiscounts) {
          where.discount = { gt: 0 };
        }

        if (available) {
          where.quantity = { gt: 0 };
        }

        if (categories && categories.length > 0) {
          const ignoreCategories = new Set(['all', 'все-категории', 'all-shop', 'allshop', 'new', 'новинки', 'promotions', 'акции']);
          const cats = categories.filter((c) => !ignoreCategories.has(c.toLowerCase()));
          if (cats.length > 0) where.category = { in: cats };
        }

        if (search && search.trim()) {
          const q = search.trim();
          where.OR = [
            { title: { contains: q, mode: 'insensitive' } },
            { comment: { contains: q, mode: 'insensitive' } },
          ];
        }

        const orderBy: any = {};
        switch (sortBy) {
          case 'price':
            orderBy.price = sortOrder;
            break;
          case 'title':
            orderBy.title = sortOrder;
            break;
          case 'discount':
            orderBy.discount = sortOrder;
            break;
          case 'createdAt':
          default:
            orderBy.createdAt = sortOrder;
            break;
        }

        const skip = (page - 1) * limit;
        // Выполняем безопасные Prisma-запросы с отдельной обработкой ошибок
        let items: any[] = [];
        let total = 0;
        const res = await tryPrisma(() => Promise.all([
          prisma.product.findMany({ where, orderBy, skip, take: limit }),
          prisma.product.count({ where }),
        ]), { timeoutMs: 2000, retries: 1 });
        if (Array.isArray(res) && res.length === 2) {
          items = res[0] || [];
          total = res[1] || 0;
        } else {
          console.warn('Prisma fetch returned no result, falling back to file-based');
        }

        const totalPages = Math.max(1, Math.ceil(total / limit));

  const formatted = (items as ProductMinimal[]).map((p: ProductMinimal) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          originalPrice: p.originalPrice ?? p.price,
          discount: p.discount ?? 0,
          description: p.comment ?? undefined,
          size: p.size ?? undefined,
          category: p.category ?? undefined,
          subcategory: p.subcategory ?? undefined,
          isConfirmed: p.isConfirmed,
          quantity: p.quantity ?? undefined,
          reserved: p.reserved ?? undefined,
          barcode: p.barcode ?? undefined,
          image: p.image ?? undefined,
          images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
          createdAt: p.createdAt ? p.createdAt.toISOString() : undefined,
          updatedAt: p.updatedAt ? p.updatedAt.toISOString() : undefined,
        }));

        return NextResponse.json({
          success: true,
          data: {
            products: formatted,
            pagination: { page, limit, total, totalPages },
          },
        });
      }
    } catch (e) {
      console.error('Prisma products fetch failed (count or fetch). Fallback to file-based source. Error:', e);
    }

    // Данные (file-based fallback)
  const products = await loadProductsFromFile();

    // Фильтры
    let filtered = applyFilters(products, { search, minPrice, maxPrice, categories, type, includeNoImage, onlyDiscounts });

  // Фильтр по наличию (quantity > 0)
  if (available) {
      filtered = filtered.filter((p: FileProduct) => {
        const q = (p as unknown as Record<string, unknown>).quantity;
        const num = typeof q === 'number' ? q : (typeof q === 'string' ? parseInt(String(q)) : 0);
        return num > 0;
      });
    }

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
      barcode: p.barcode || undefined,
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
  const limit = parseInt(String(body.limit ?? (body.type === 'new' ? '100' : '24')));
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

  // includeNoImage is only supported for GET/file-based fallback; ignore in POST
    const onlyDiscounts = (() => {
      const vRaw = body.onlyDiscounts;
      if (typeof vRaw === 'boolean') return vRaw;
      if (typeof vRaw === 'string') {
        const v = vRaw.toLowerCase();
        return v === '1' || v === 'true' || v === 'yes';
      }
      return false;
    })();

    // Попробуем отдать из БД, если есть подтвержденные товары
    const available = (() => {
      const v = body.available;
      if (typeof v === 'boolean') return v;
      const s = String(v || '').toLowerCase();
      return s === '1' || s === 'true' || s === 'yes';
    })();

    try {
      const dbCount = await tryPrisma(() => prisma.product.count({ where: { isConfirmed: true } }), { timeoutMs: 1500, retries: 1 });
      if (typeof dbCount === 'number' && dbCount > 0) {
        const where: any = { isConfirmed: true };

        if (type === 'discount' || onlyDiscounts) {
          where.discount = { gt: 0 };
        }

        if (available) where.quantity = { gt: 0 };

        if (categories && categories.length > 0) {
          const ignoreCategories = new Set(['all', 'все-категории', 'all-shop', 'allshop', 'new', 'новинки', 'promotions', 'акции']);
          const cats = categories.filter((c) => !ignoreCategories.has(c.toLowerCase()));
          if (cats.length > 0) where.category = { in: cats };
        }

        if (search && search.trim()) {
          const q = search.trim();
          where.OR = [
            { title: { contains: q, mode: 'insensitive' } },
            { comment: { contains: q, mode: 'insensitive' } },
          ];
        }

        if (minPrice || maxPrice) {
          const gte = minPrice ? parseInt(minPrice) : undefined;
          const lte = maxPrice ? parseInt(maxPrice) : undefined;
          where.price = {};
          if (gte !== undefined && !Number.isNaN(gte)) where.price.gte = gte;
          if (lte !== undefined && !Number.isNaN(lte)) where.price.lte = lte;
        }

        const orderBy: any = {};
        switch (sortBy) {
          case 'price':
            orderBy.price = sortOrder;
            break;
          case 'title':
            orderBy.title = sortOrder;
            break;
          case 'discount':
            orderBy.discount = sortOrder;
            break;
          case 'createdAt':
          default:
            orderBy.createdAt = sortOrder;
            break;
        }

        const skip = (page - 1) * limit;
        const res = await tryPrisma(() => Promise.all([
          prisma.product.findMany({ where, orderBy, skip, take: limit }),
          prisma.product.count({ where }),
        ]), { timeoutMs: 2000, retries: 1 });
        let items: any[] = [];
        let total = 0;
        if (Array.isArray(res) && res.length === 2) {
          items = res[0] || [];
          total = res[1] || 0;
        } else {
          console.warn('Prisma POST fetch returned no result, falling back to file-based');
        }

        const totalPages = Math.max(1, Math.ceil(total / limit));

  const formatted = (items as ProductMinimal[]).map((p: ProductMinimal) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          originalPrice: p.originalPrice ?? p.price,
          discount: p.discount ?? 0,
          description: p.comment ?? undefined,
          size: p.size ?? undefined,
          category: p.category ?? undefined,
          subcategory: p.subcategory ?? undefined,
          isConfirmed: p.isConfirmed,
          quantity: p.quantity ?? undefined,
          reserved: p.reserved ?? undefined,
          barcode: p.barcode ?? undefined,
          image: p.image ?? undefined,
          images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
          createdAt: p.createdAt ? p.createdAt.toISOString() : undefined,
          updatedAt: p.updatedAt ? p.updatedAt.toISOString() : undefined,
        }));

        return NextResponse.json({
          success: true,
          data: {
            products: formatted,
            pagination: { page, limit, total, totalPages },
          },
        });
      }
    } catch (e) {
      console.error('Prisma products fetch failed (POST), fallback to file-based:', e);
    }

    // Фоллбек на file-based
    const products = await loadProductsFromFile();

    // Фильтры (в POST includeNoImage игнорируем для публичного API)
    let filtered = applyFilters(products, {
      search,
      minPrice,
      maxPrice,
      categories,
      type,
      includeNoImage: false,
      onlyDiscounts,
    });

    // Фильтр по наличию (quantity > 0) — в файловых данных обычно нет количества, поэтому пропускаем, если поле отсутствует
    if (available) {
      filtered = filtered.filter((p: FileProduct) => {
        const q = (p as unknown as Record<string, unknown>).quantity;
        const num = typeof q === 'number' ? q : (typeof q === 'string' ? parseInt(String(q)) : 0);
        return num > 0;
      });
    }

    // Сортировка и «новинки»
    filtered = applySort(filtered, sortBy, sortOrder);
    if (type === 'new') {
      filtered = filtered.slice(0, Math.max(1, limit));
    }

    // Пагинация
    const { items, total, totalPages, page: pageOut, limit: limitOut } = paginate(filtered, page, limit);

    const formatted = items.map((p: FileProduct) => ({
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
      barcode: p.barcode || undefined,
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
