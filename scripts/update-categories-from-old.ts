import fs from 'node:fs/promises';
import path from 'node:path';

type NewEntry = {
  title?: string;
  image?: string | null;
  price?: number;
  discount?: number | null;
  size?: string | null;
  category?: string | null;
  [key: string]: any;
};

type OldEntry = {
  title?: string;
  raw_title?: string;
  image_path?: string;
  price?: number;
  categories?: string[]; // ожидаем массив с одним слагом
  [key: string]: any;
};

const ALLOWED = new Set([
  'vases',
  'candlesticks',
  'frames',
  'flowers',
  'jewelry-boxes',
  'figurines',
  'bookends',
]);

function normalizeStr(s?: string | null) {
  return (s || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/["'`]/g, '')
    .trim();
}

function normalizeImage(p?: string | null) {
  if (!p) return '';
  const lower = p.toLowerCase().replace(/\s+/g, ' ').trim();
  return lower;
}

function mapLegacyCategory(cat?: string | null): string | null {
  if (!cat) return null;
  const c = normalizeStr(cat);
  if (ALLOWED.has(c)) return c;
  // Возможные алиасы
  if (/(ваза|vase)/.test(c)) return 'vases';
  if (/(подсвеч|candle)/.test(c)) return 'candlesticks';
  if (/(рамк|фоторам|frame)/.test(c)) return 'frames';
  if (/(цвет|букет|flower)/.test(c)) return 'flowers';
  if (/(шкатул|jewelry|box)/.test(c)) return 'jewelry-boxes';
  if (/(фигур|статуэт|angel|figure)/.test(c)) return 'figurines';
  if (/(книгодерж|bookend)/.test(c)) return 'bookends';
  return null;
}

function inferCategoryFromTitleOrPath(title?: string, imagePath?: string): string | null {
  const t = normalizeStr(title);
  const p = normalizeImage(imagePath);
  if (/подсвеч/.test(t) || /подсвеч/.test(p)) return 'candlesticks';
  if (/ваза/.test(t) || /ваза/.test(p)) return 'vases';
  if (/(рамк|фоторам)/.test(t) || /(рамк|фоторам)/.test(p)) return 'frames';
  if (/шкатул/.test(t) || /шкатул/.test(p)) return 'jewelry-boxes';
  if (/(фигур|ангел|статуэт)/.test(t) || /(фигур|ангел|статуэт)/.test(p)) return 'figurines';
  if (/(книгодерж|книги держ|держат.*книг)/.test(t) || /(книгодерж)/.test(p)) return 'bookends';
  if (/(цвет|букет|роз|пион|гортенз)/.test(t) || /(цвет)/.test(p)) return 'flowers';
  return null;
}

async function main() {
  const newPath = path.join(process.cwd(), 'new-product.json');
  const oldPath = path.join(process.cwd(), 'products-old.json');

  const [newRaw, oldRaw] = await Promise.all([
    fs.readFile(newPath, 'utf-8'),
    fs.readFile(oldPath, 'utf-8'),
  ]);

  const newJson = JSON.parse(newRaw) as { products: NewEntry[] };

  let oldParsed: unknown;
  try {
    oldParsed = JSON.parse(oldRaw) as unknown;
  } catch (e) {
    throw new Error('Ошибка парсинга products-old.json: ' + (e as Error).message);
  }

  let oldJson: OldEntry[];
  if (Array.isArray(oldParsed)) {
    oldJson = oldParsed as OldEntry[];
  } else if (
    typeof oldParsed === 'object' && oldParsed !== null && Array.isArray((oldParsed as { products?: unknown }).products)
  ) {
    oldJson = (oldParsed as { products: OldEntry[] }).products;
  } else {
    throw new Error('Неизвестный формат products-old.json');
  }

  // Индексы по title и image_path
  const byTitle = new Map<string, string | null>();
  const byImage = new Map<string, string | null>();

  for (const o of oldJson) {
    const catFromOld = mapLegacyCategory(
      Array.isArray(o.categories) && o.categories.length > 0 ? o.categories[0] : null
    );
    const inferred = catFromOld ?? inferCategoryFromTitleOrPath(o.title || o.raw_title, o.image_path);

    const keyTitle = normalizeStr(o.title || o.raw_title);
    if (keyTitle) byTitle.set(keyTitle, inferred);

    const keyImg = normalizeImage(o.image_path);
    if (keyImg) byImage.set(keyImg, inferred);
  }

  let matchedByTitle = 0;
  let matchedByImage = 0;
  let inferredCount = 0;
  let totalUpdated = 0;

  for (const p of newJson.products) {
    const keyTitle = normalizeStr(p.title);
    const keyImg = normalizeImage(p.image || undefined);

    let cat: string | null | undefined = undefined;
    if (keyTitle && byTitle.has(keyTitle)) {
      matchedByTitle++;
      cat = byTitle.get(keyTitle)!;
    } else if (keyImg && byImage.has(keyImg)) {
      matchedByImage++;
      cat = byImage.get(keyImg)!;
    } else {
      // как fallback — мягкая попытка по самим данным newJson
      cat = inferCategoryFromTitleOrPath(p.title, p.image || undefined);
      if (cat) inferredCount++;
    }

    // Разрешаем только допустимые категории, иначе null
    if (cat && !ALLOWED.has(cat)) {
      cat = mapLegacyCategory(cat);
    }
    if (cat && !ALLOWED.has(cat)) {
      cat = null;
    }

    // Обновляем, только если меняется
    if (p.category !== cat) {
      p.category = cat ?? null;
      totalUpdated++;
    }
  }

  await fs.writeFile(newPath, JSON.stringify(newJson, null, 2), 'utf-8');
  console.log(JSON.stringify({ matchedByTitle, matchedByImage, inferredCount, totalUpdated }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
