#!/usr/bin/env tsx
/**
 * Перемещает изображения перечисленные в unused-images.json в public/_unused_photos
 * Сохраняет относительную структуру каталогов.
 */
import { promises as fs } from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const UNUSED_JSON = path.join(process.cwd(), 'scripts/maintenance/unused-images.json');
const ARCHIVE_DIR = path.join(PUBLIC_DIR, '_unused_photos');

async function main() {
  let data: any;
  try {
    data = JSON.parse(await fs.readFile(UNUSED_JSON, 'utf8'));
  } catch {
    console.error('Не найден файл unused-images.json. Сначала запусти find-unused-images.');
    process.exit(1);
  }
  const list: string[] = data.unused || [];
  if (!list.length) {
    console.log('Нет неиспользуемых изображений для перемещения.');
    return;
  }
  await fs.mkdir(ARCHIVE_DIR, { recursive: true });

  for (const rel of list) {
    const src = path.join(PUBLIC_DIR, rel);
    const dest = path.join(ARCHIVE_DIR, rel);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    try {
      await fs.rename(src, dest);
      console.log('→', rel);
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        console.warn('Пропущено (не найдено):', rel);
      } else {
        console.warn('Ошибка перемещения', rel, e.message);
      }
    }
  }
  console.log('Перемещение завершено. Теперь закоммитьте изменения, чтобы уменьшить размер репозитория.');
}

main().catch(e => { console.error(e); process.exit(1); });
