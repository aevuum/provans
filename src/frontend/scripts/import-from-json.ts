// scripts/import-from-json.ts
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../lib/prisma';

interface JsonProduct {
  title: string;
  // Поддерживаем оба варианта для обратной совместимости
  image?: string | null;
  image_path?: string | null;
  price: number;
  discount?: number;
  size?: string | null;
  material?: string | null;
  country?: string | null;
  category?: string | null;
  barcode?: string | null;
  comment?: string | null;
}

function normTitle(t?: string | null) {
  if (!t) return '';
  return t
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeImagePath(raw?: string | null): string | null {
  if (!raw) return null;
  const rawPath = raw.toString().trim();
  if (!rawPath || rawPath.toLowerCase() === 'null' || rawPath === '-') return null;

  // Уберём возможный префикс /uploads
  if (rawPath.startsWith('/uploads/фото/')) return rawPath.replace('/uploads', '');
  if (rawPath.startsWith('/uploads/ФОТО/')) return rawPath.replace('/uploads', '');

  // Если уже абсолютный путь в корректные папки — возвращаем как есть
  if (rawPath.startsWith('/фото/')) return rawPath;
  if (rawPath.startsWith('/ФОТО/')) return rawPath;
  if (rawPath.startsWith('/')) return rawPath; // любой другой абсолютный путь

  // По умолчанию — в нижний регистр папки фото
  return `/фото/${rawPath}`;
}

async function main() {
  const jsonFile = process.env.JSON_FILE || 'new-product.json';
  const jsonPath = path.join(process.cwd(), jsonFile);
  const raw = await fs.readFile(jsonPath, 'utf-8');
  const parsed = JSON.parse(raw) as { products?: JsonProduct[] } | JsonProduct[];
  const data = Array.isArray(parsed) ? { products: parsed } : parsed;

  const input = (data.products || []).map((p) => ({
    ...p,
    // Нормализуем различия схемы: image имеет приоритет, затем image_path
    image: (p.image ?? p.image_path) ?? null,
  }));

  console.log(`Импорт из файла: ${jsonFile}`);
  console.log(`Найдено в JSON: ${input.length} товаров`);

  // Предфильтрация: требуем валидный title и цену > 0 (фото не обязательно)
  const preFiltered = input.filter((p) => {
    const hasTitle = !!(p.title && p.title.toString().trim());
    const priceOk = Number.isFinite(p.price) && Number(p.price) > 0;
    return hasTitle && priceOk;
  });
  const removedInvalid = input.length - preFiltered.length;
  if (removedInvalid > 0) {
    console.log(`Отфильтровано невалидных записей (без title или price<=0): ${removedInvalid}`);
  }

  // Полный переимпорт: очищаем и загружаем заново
  console.log('Очищаю таблицу продуктов...');
  await prisma.product.deleteMany();

  const normalized = preFiltered.map((p) => {
    const image = normalizeImagePath(p.image ?? null);

    return {
      title: p.title?.trim() || 'Товар',
      price: Math.round(Number(p.price)),
      originalPrice: null,
      discount: Number.isFinite(p.discount as number) ? Number(p.discount) : 0,
      size: p.size?.toString().trim() || null,
      material: p.material?.toString().trim() || null,
      country: p.country?.toString().trim() || null,
      category: p.category?.toString().trim() || null,
      barcode: p.barcode?.toString().trim() || null,
      comment: p.comment?.toString().trim() || null,
      image,
      images: image ? [image] : [],
      // Товары без фото оставляем в БД, но не подтверждаем (видны в админке, не на витрине)
      isConfirmed: !!image,
    };
  });

  // Дедупликация: по изображению (если есть), иначе по (название+цена+размер)
  const seen = new Set<string>();
  const unique: typeof normalized = [];
  for (const p of normalized) {
    const key = p.image && p.image.trim()
      ? `img:${p.image.trim()}`
      : `tps:${normTitle(p.title)}|${p.price}|${(p.size || '').trim()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(p);
  }
  const removedDups = normalized.length - unique.length;
  if (removedDups > 0) {
    console.log(`Удалено дублей: ${removedDups}`);
  }

  // Вставка батчами
  const batchSize = 500;
  let inserted = 0;
  for (let i = 0; i < unique.length; i += batchSize) {
    const chunk = unique.slice(i, i + batchSize);
    await prisma.product.createMany({ data: chunk });
    inserted += chunk.length;
    console.log(`Импортировано: ${inserted}/${unique.length}`);
  }

  const total = await prisma.product.count();
  console.log('Импорт завершён. Всего товаров:', total);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
