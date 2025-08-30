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

const FILE = path.join(process.cwd(), 'new-product.json');

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
  return r;
}

function stripTrailingPunctuation(s: string) {
  return s.replace(/[\s\.,;:]+$/g, '').trim();
}

function capitalizeFirst(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
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
  s = stripAssortment(s);
  s = stripTrailingPunctuation(s);
  s = collapseSpaces(s);
  s = unifyStart(s, category);
  s = collapseSpaces(s);
  return s;
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
    const after = cleanTitle(before, (p.category as string | null | undefined) ?? undefined);
    if (after && after !== before) {
      preview.push({ id: String(p.id ?? ''), before, after });
      if (apply) {
        p.title = after;
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
