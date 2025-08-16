#!/usr/bin/env tsx
/*
One-off script to fix categories for specific products by title.
Usage: tsx scripts/fixes/recategorize-specific.ts
*/
import { promises as fs } from 'fs';
import path from 'path';

type JsonProduct = {
  id?: number | string;
  title?: string;
  category?: string | null;
  [k: string]: unknown;
};

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/[\s\u00A0]+/g, ' ') // collapse spaces incl. nbsp
    .replace(/\s+/g, ' ')
    .trim();
}

const targets: Record<string, string> = {
  // figurines instead of flowers
  'зайчик с розовым зонтом': 'figurines',
  'зайчик с тележкой тюльпанов': 'figurines',
  'гусь бел с цветами в клюве': 'figurines',
  // frames instead of flowers
  'ф черная с золотыми розами': 'frames',
  'ф золотые ветки и черные цветы': 'frames',
  'ф золотые ветки и белые цветы': 'frames',
  'ф золотая с розами': 'frames',
  // flowers instead of vases
  'ветка калины голубая': 'flowers',
  // frames instead of vases
  'белый перламутр 3': 'frames',
  'белый перламутр 2': 'frames',
  'белый перламутр': 'frames',
  // figurines instead of candlesticks
  'птичка перламутр белый': 'figurines',
  'птичка белая керамика': 'figurines',
};

async function main() {
  const file = path.join(process.cwd(), 'new-product.json');
  const content = await fs.readFile(file, 'utf8');
  const parsed: unknown = JSON.parse(content);
  const arr: JsonProduct[] = Array.isArray(parsed)
    ? (parsed as JsonProduct[])
    : (Array.isArray((parsed as { products?: unknown[] })?.products)
        ? ((parsed as { products: unknown[] }).products as JsonProduct[])
        : []);

  if (!Array.isArray(arr)) {
    console.error('new-product.json: not an array and no products[]');
    process.exit(1);
  }

  const titleIndex: Map<string, number[]> = new Map();
  arr.forEach((p, i) => {
    const t = norm(String(p?.title || ''));
    if (!titleIndex.has(t)) titleIndex.set(t, []);
    titleIndex.get(t)!.push(i);
  });

  const updates: { title: string; slug: string; idxs: number[] }[] = [];
  const notFound: string[] = [];

  for (const [rawTitle, slug] of Object.entries(targets)) {
    const n = norm(rawTitle);
    const idxs = titleIndex.get(n) || [];
    if (idxs.length === 0) {
      notFound.push(rawTitle);
    } else {
      updates.push({ title: rawTitle, slug, idxs });
    }
  }

  let changed = 0;
  for (const u of updates) {
    for (const idx of u.idxs) {
      const before = arr[idx]?.category ?? null;
      arr[idx] = { ...arr[idx], category: u.slug };
      changed += before === u.slug ? 0 : 1;
    }
  }

  const backupName = path.join(process.cwd(), `archive/new-product.backup.${Date.now()}.json`);
  try {
    await fs.mkdir(path.dirname(backupName), { recursive: true });
    await fs.writeFile(backupName, content, 'utf8');
  } catch (e) {
    console.warn('Backup failed:', e);
  }

  let newContent: string;
  if (Array.isArray(parsed)) {
    newContent = JSON.stringify(arr, null, 2);
  } else if (parsed && typeof parsed === 'object') {
    newContent = JSON.stringify({ ...(parsed as Record<string, unknown>), products: arr }, null, 2);
  } else {
    newContent = JSON.stringify(arr, null, 2);
  }
  await fs.writeFile(file, newContent, 'utf8');

  console.log(JSON.stringify({ changed, updates, notFound }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
