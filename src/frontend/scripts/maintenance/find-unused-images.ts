#!/usr/bin/env tsx
/**
 * Сканирует public/ и находит изображения, которые не упоминаются в коде (tsx/ts/js/json) и в данных продуктов.
 * Критерий: имя файла (без пути) встречается хотя бы один раз в исходниках/данных -> считается используемым.
 * Результат: выводит список и сохраняет в scripts/maintenance/unused-images.json
 */
import { promises as fs } from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SRC_DIR = path.join(process.cwd(), 'src'); // в составе фронтенда (app, components, etc.)
const EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
const OUTPUT_JSON = path.join(process.cwd(), 'scripts/maintenance/unused-images.json');

async function listFilesRecursive(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'favicon.ico') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      // Пропускаем потенциальный уже созданный архив
      if (e.name === '_unused' || e.name === '_unused_photos') continue;
      out.push(...(await listFilesRecursive(full)));
    } else {
      const ext = path.extname(e.name).toLowerCase();
      if (EXTENSIONS.includes(ext)) out.push(full);
    }
  }
  return out;
}

async function gatherCodeText(): Promise<string> {
  const patterns = ['.ts', '.tsx', '.js', '.json'];
  const root = process.cwd();
  async function collect(dir: string, acc: string[]): Promise<void> {
    let entries: any[] = [];
    try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.name.startsWith('.')) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        await collect(full, acc);
      } else if (patterns.some(p => e.name.endsWith(p))) {
        try {
          const text = await fs.readFile(full, 'utf8');
          acc.push(text);
        } catch {}
      }
    }
  }
  const acc: string[] = [];
  // Сканируем src (фронтенд) и корень на случай конфигов
  await collect(SRC_DIR, acc);
  await collect(root, acc);
  return acc.join('\n');
}

async function main() {
  const allImages = await listFilesRecursive(PUBLIC_DIR);
  const codeText = await gatherCodeText();
  const used = new Set<string>();

  for (const imgPath of allImages) {
    const base = path.basename(imgPath); // имя файла
    // Проверяем несколько вариантов: исходное и без пробелов/URL-кодирования
    const variants = [base, base.replace(/%20/g, ' '), base.toLowerCase()];
    if (variants.some(v => codeText.includes(v))) {
      used.add(imgPath);
    }
  }

  const unused = allImages.filter(f => !used.has(f));
  unused.sort();

  await fs.mkdir(path.dirname(OUTPUT_JSON), { recursive: true });
  await fs.writeFile(OUTPUT_JSON, JSON.stringify({ timestamp: new Date().toISOString(), total: allImages.length, unused: unused.map(p => path.relative(PUBLIC_DIR, p)) }, null, 2), 'utf8');

  console.log(`Всего изображений: ${allImages.length}`);
  console.log(`Используемых: ${used.size}`);
  console.log(`Неиспользуемых: ${unused.length}`);
  if (unused.length) {
    console.log('Пример неиспользуемых:', unused.slice(0, 20).map(p => path.relative(PUBLIC_DIR, p)));
    console.log(`Полный список записан в ${OUTPUT_JSON}`);
  } else {
    console.log('Все изображения имеют упоминания.');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
