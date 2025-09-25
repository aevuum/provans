#!/usr/bin/env tsx
import fs from 'node:fs/promises';
import path from 'node:path';

interface ProductRec {
  id?: number | string;
  title?: string;
  category?: string | null;
  [k: string]: unknown;
}

interface FileShapeObject { products?: ProductRec[]; [k: string]: unknown }

type Shape = 'array' | 'object' | 'unknown';

// allow overriding target file via --file=path (relative to cwd) or env FILE
function resolveFileFromArgs() {
  const fileArg = process.argv.find((a) => a.startsWith('--file='));
  if (fileArg) return path.join(process.cwd(), fileArg.split('=')[1]);
  if (process.env.FILE) return path.join(process.cwd(), process.env.FILE);
  return path.join(process.cwd(), 'new-product.json');
}
const FILE = resolveFileFromArgs();

function collapseSpaces(s: string) {
  return s.replace(/\s+/g, ' ').trim();
}

function stripAssortment(s: string) {
  let r = s
    .replace(/\((?:[^)]*?(ассорт|ассортимент|разные\s+цвета|разные\s+модели)[^)]*)\)/gi, '')
    .replace(/\[(?:[^\]]*?(ассорт|ассортимент|разные\s+цвета|разные\s+модели)[^\]]*)\]/gi, '')
    .replace(/\b(в\s+ассортименте|ассортимент|ассорти|разные\s+цвета|разные\s+модели)\b/gi, '');
  // убрать хвостовые одиночные номера типа " ... 2"
  r = r.replace(/\s*[–—-]?\s*(№\s*)?\d+$/u, '');
  // убрать скобки с одними числами или пробелами, например (1), ( 2 )
  r = r.replace(/\(\s*\d+\s*\)/g, '');
  return r;
}

function stripTrailingPunctuation(s: string) {
  return s.replace(/[\s\.,;:]+$/g, '').trim();
}

function capitalizeFirst(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function lowerThenCapitalize(s: string) {
  if (!s) return s;
  const lower = s.toLowerCase().trim();
  return capitalizeFirst(lower);
}

function stripFlowerPrefixes(s: string) {
  // Удаляем стартовые слова типа "Цветы", "Букет", "Цветок" и пр. для цветочной категории
  return s.replace(/^\s*(цветы|цветок|букет|букетик)\b[\s,:–—-]*/i, '');
}

function unifyStart(title: string, category?: string | null) {
  const t = title.trim();
  const low = t.toLowerCase();

  const repl = (regex: RegExp, desired: string) => {
    if (regex.test(low)) {
      return capitalizeFirst(collapseSpaces(t.replace(regex, desired + ' ').replace(/\s{2,}/g, ' ')));
    }
    return null;
  };

  // Словари синонимов
  const map: Record<string, { desired: string; regex: RegExp }> = {
    frames: { desired: 'Фоторамка', regex: /^(ф\.?\s*рамка|фото\s*рамка|фоторамка|рамка)\b/i },
    'jewelry-boxes': { desired: 'Шкатулка', regex: /^(шкатулка|шкатул|шк\.)\b/i },
    vases: { desired: 'Ваза', regex: /^(ваза)\b/i },
    candlesticks: { desired: 'Подсвечник', regex: /^(подсвечник)\b/i },
    figurines: { desired: 'Фигурка', regex: /^(фигурка|статуэтка)\b/i },
    bookends: { desired: 'Книгодержатель', regex: /^(книгодерж|держатель\s*книг)\b/i },
  };

  const entry = category ? map[category] : undefined;
  if (category === 'flowers') {
    // Для цветов не префиксуем категорией и убираем стартовые слова, если они есть
    const noPrefix = stripFlowerPrefixes(t);
    return capitalizeFirst(collapseSpaces(noPrefix));
  }

  if (entry) {
    const changed = repl(entry.regex, entry.desired);
    if (changed) return changed;
    // Больше не добавляем принудительно название категории, по просьбе пользователя
  }

  // Без категории: просто нормализация регистра/пробелов
  return capitalizeFirst(t);
}

function cleanTitle(title: string, category?: string | null) {
  let s = title;
  s = s.replace(/["'`«»]/g, ' ');
  // удалить скобочные номера и одиночные цифровые токены
  s = s.replace(/\(\s*\d+\s*\)/g, '');
  s = s.replace(/\[\s*\d+\s*\]/g, '');
  s = s.replace(/\b\d+\b/g, '');
  s = stripAssortment(s);
  s = stripTrailingPunctuation(s);
  s = collapseSpaces(s);
  // remove stray parentheses/brackets leftover
  s = s.replace(/[\[\]()]/g, '').trim();
  s = collapseSpaces(s);
  s = unifyStart(s, category);
  s = collapseSpaces(s);
  return s;
}

function humanizeCategory(slug?: string | null) {
  if (!slug) return '';
  const map: Record<string, string> = {
    frames: 'Фоторамка',
    'jewelry-boxes': 'Шкатулка',
    vases: 'Ваза',
    candlesticks: 'Подсвечник',
    figurines: 'Фигурка',
    bookends: 'Книгодержатель',
    flowers: 'Цветы',
  };
  if (map[slug]) return map[slug];
  // fallback: replace dashes/underscores and capitalize
  return slug.replace(/[-_]/g, ' ');
}

function normalizeSizeRaw(size?: unknown) {
  if (!size) return '';
  let s = String(size).trim();
  // normalize separators to '*' (storage format), remove unit markers like см
  s = s.replace(/см\.?/gi, '');
  s = s.replace(/мм\.?/gi, '');
  s = s.replace(/cm\.?/gi, '');
  s = s.replace(/mm\.?/gi, '');
  // replace various separators with '*' and remove spaces
  s = s.replace(/[×xX\*;,\s]+/g, '*');
  s = s.replace(/\*{2,}/g, '*');
  s = s.replace(/^\*|\*$/g, '');
  return s;
}

function extractSizeFromTitle(title: string) {
  let s = title;
  let size = '';

  // 1) dimension pattern like 32,5*5*3 or 32x5x3 or 32×5×3
  const dimRegex = /(\d+(?:[.,]\d+)?(?:\s*[×xX*]\s*\d+(?:[.,]\d+)?)+)/u;
  let m = s.match(dimRegex);
  if (m) {
    size = m[1].replace(/\s+/g, '');
    s = s.replace(m[0], ' ');
  } else {
    // 2) trailing numeric with unit like "10 см" or "10см"
    const trailingSizeRegex = /\b(\d+(?:[.,]\d+)?\s*(?:см\.?|mm|мм|cm\.?))\b/iu;
    m = s.match(trailingSizeRegex);
    if (m) {
      size = m[1];
      s = s.replace(m[0], ' ');
    } else {
      // 3) letter sizes like S, M, L, XL at end or in parentheses
      const letterSizeRegex = /(?:\(|\s|,|^)(XS|S|M|L|XL|XXL)\b/i;
      m = s.match(letterSizeRegex);
      if (m) {
        size = m[1];
        s = s.replace(m[0], ' ');
      }
    }
  }

  size = size ? normalizeSizeRaw(size) : '';
  s = collapseSpaces(s);
  return { title: s, size };
}

function composeTitle(p: ProductRec) {
  const catSlug = (p.category as string | undefined) ?? undefined;
  const catHuman = humanizeCategory(catSlug);
  // name: cleaned, lowercase except first letter
  let name = String(p.title || '').trim();
  if (!name) return '';
  // remove category words from start if present
  if (catHuman) {
    const rx = new RegExp('^' + catHuman.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    name = name.replace(rx, '').trim();
  }
  // strip numeric tokens and ordinal suffixes left in name
  name = name.replace(/\b\d+\b/g, '').replace(/\(\s*\d+\s*\)/g, '').trim();
  // lower then capitalize
  name = lowerThenCapitalize(name);

  const size = normalizeSizeRaw(p.size);

  // final composition: Category, size, name — omit empty parts
  const parts: string[] = [];
  if (catHuman) parts.push(lowerThenCapitalize(catHuman));
  if (size) parts.push(size);
  if (name) parts.push(name);
  return parts.join(', ');
}

async function main() {
  const apply = process.argv.includes('--apply');
  const raw = await fs.readFile(FILE, 'utf8');
  let parsed: ProductRec[] | FileShapeObject | unknown;
  try { parsed = JSON.parse(raw); } catch { throw new Error('JSON parse error for new-product.json'); }

  let shape: Shape = 'unknown';
  let list: ProductRec[] = [];

  if (Array.isArray(parsed)) {
    shape = 'array';
    list = parsed as ProductRec[];
  } else if (parsed && typeof parsed === 'object' && Array.isArray((parsed as FileShapeObject).products)) {
    shape = 'object';
    list = (parsed as FileShapeObject).products as ProductRec[];
  } else {
    console.error('Unsupported new-product.json structure');
    process.exit(2);
  }

  let changed = 0;
  const preview: Array<{ id: string; before: string; after: string }> = [];

  for (const p of list) {
    const before = String(p.title || '').trim();
    if (!before) continue;
    // first, extract size tokens from the raw title if present
    const extracted = extractSizeFromTitle(before);
    // clean the leftover title
    const cleaned = cleanTitle(extracted.title, (p.category as string | null | undefined) ?? undefined);
    // if product has existing size field prefer it; otherwise take extracted
    const finalSize = p.size ? normalizeSizeRaw(p.size) : extracted.size;
    // compose final title using category, size, name
    const tempRec: ProductRec = { ...p, size: finalSize, title: cleaned };
    const after = composeTitle(tempRec);

    if (after && after !== before) {
      preview.push({ id: String(p.id ?? ''), before, after });
      if (apply) {
        p.title = after;
        if (finalSize) p.size = finalSize;
      }
      changed++;
    }
  }

  console.log(`Will change ${changed} titles`);
  console.log(preview.slice(0, 20)); // показать первые 20 для контроля

  if (apply) {
    // write backup first
    try {
      const archDir = path.join(process.cwd(), 'archive');
      await fs.mkdir(archDir, { recursive: true });
      const ts = Date.now();
      const backupPath = path.join(archDir, `new-product.backup.${ts}.json`);
      await fs.writeFile(backupPath, raw, 'utf8');
      console.log(`Backup saved: ${path.relative(process.cwd(), backupPath)}`);
    } catch (err) {
      console.warn('Warning: failed to create backup, proceeding with write.', err);
    }
    const spaces = 2;
    const output = shape === 'array'
      ? JSON.stringify(list, null, spaces)
      : JSON.stringify({ ...(parsed as Record<string, unknown>), products: list }, null, spaces);
    await fs.writeFile(FILE, output, 'utf8');
    console.log('Titles updated in new-product.json');
  } else {
    console.log('Dry-run finished. Run with --apply to write changes.');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
