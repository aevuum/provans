import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// Простой индекс файлов (кеш) для быстрого сопоставления разных вариантов путей
let filesIndex: Map<string, string> | null = null;

async function buildFilesIndex(base: string) {
  const map = new Map();
  async function walk(dir: string, relPrefix = '') {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const name = e.name;
      const rel = relPrefix ? `${relPrefix}/${name}` : name;
      const keyVariants = new Set<string>([
        rel,
        rel.toLowerCase(),
        encodeURIComponent(rel),
        encodeURIComponent(rel).toLowerCase(),
        rel.replace(/ /g, '%20'),
      ]);
      for (const k of keyVariants) map.set(k, path.join(dir, name));
      if (e.isDirectory()) {
        // depth 2: recurse one level
        const subdir = path.join(dir, name);
        const entries2 = await fs.readdir(subdir, { withFileTypes: true }).catch(() => []);
        for (const e2 of entries2) {
          const name2 = e2.name;
          const rel2 = `${rel}/${name2}`;
          const keyVariants2 = new Set<string>([
            rel2,
            rel2.toLowerCase(),
            encodeURIComponent(rel2),
            encodeURIComponent(rel2).toLowerCase(),
            rel2.replace(/ /g, '%20'),
          ]);
          for (const k of keyVariants2) map.set(k, path.join(subdir, name2));
        }
      }
    }
  }

  await walk(base);
  return map;
}

async function ensureFilesIndex() {
  if (filesIndex) return filesIndex;
  try {
    const base = path.join(process.cwd(), 'public');
    filesIndex = await buildFilesIndex(base);
  } catch (err) {
    console.error('Failed to build files index:', err);
    filesIndex = new Map();
  }
  return filesIndex;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const filePath = url.searchParams.get('path');
    if (!filePath) {
      return new NextResponse('No path', { status: 400 });
    }
    // Удаляем ведущий слэш и аккуратно декодируем (поддержка многократного кодирования)
    let relPath = String(filePath || '');
    // Попытки декодирования до 3 раз, чтобы покрыть случаи частичного/двойного кодирования
    for (let i = 0; i < 3; i++) {
      try {
        const dec = decodeURIComponent(relPath);
        if (dec === relPath) break;
        relPath = dec;
      } catch {
        break;
      }
    }
    relPath = relPath.replace(/^\/+/, '');
    const publicBase = path.join(process.cwd(), 'public');

    // Попытка прямого доступа
    let resolvedPath = path.join(publicBase, relPath);

    async function resolveCaseInsensitive(baseDir: string, rel: string) {
      const parts = rel.split('/').filter(Boolean);
      let cur = baseDir;
      for (const part of parts) {
        let entries: string[];
        try {
          entries = await fs.readdir(cur);
        } catch (err) {
          throw new Error(`Directory not accessible: ${cur} - ${String(err)}`);
        }

        const found = entries.find((e) => e.toLowerCase() === part.toLowerCase());
        if (found) {
          cur = path.join(cur, found);
          continue;
        }

        // Попробуем ещё вариант — сравнить с trimmed именем
        const trimmed = part.trim();
        const foundTrim = entries.find((e) => e.toLowerCase() === trimmed.toLowerCase());
        if (foundTrim) {
          cur = path.join(cur, foundTrim);
          continue;
        }

        // Не нашли сегмент — бросаем, чтобы основной catch попытал другую стратегию
        throw new Error(`Segment not found: ${part} in ${cur}`);
      }
      return cur;
    }

    try {
      await fs.access(resolvedPath);
    } catch (err) {
      // Файл не найден напрямую — пробуем нечувствительный к регистру поиск по сегментам
      console.debug('Direct access failed for', resolvedPath, err);
      try {
        resolvedPath = await resolveCaseInsensitive(publicBase, relPath);
      } catch (err2) {
        console.error('Image lookup failed (case-insensitive):', err2);
        // Последняя попытка: используем файловый индекс, если он доступен
        try {
          const idx = await ensureFilesIndex();
          // Попробуем несколько вариантов ключа
          const normalize = (s: string) => s.replace(/^\/+/, '');
          const candidatesRaw = [relPath, relPath.toLowerCase(), encodeURIComponent(relPath), encodeURIComponent(relPath).toLowerCase(), relPath.replace(/ /g, '%20')];
          for (const raw of candidatesRaw) {
            const c = normalize(raw);
            if (idx.has(c)) {
              resolvedPath = idx.get(c)!;
              break;
            }
          }
          if (!resolvedPath || !(await fs.stat(resolvedPath).catch(() => null))) {
            throw new Error('Indexed lookup failed');
          }
        } catch (err3) {
          console.error('Image lookup failed (indexed fallback):', err3);
          return new NextResponse('Not found', { status: 404 });
        }
      }
    }

    const fileBuffer = await fs.readFile(resolvedPath);
    const ext = path.extname(resolvedPath).toLowerCase();
    const mime =
      ext === '.jpg' || ext === '.jpeg'
        ? 'image/jpeg'
        : ext === '.png'
        ? 'image/png'
        : 'application/octet-stream';

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: { 'Content-Type': mime },
    });
  } catch (err) {
    console.error('Ошибка загрузки изображения:', err);
    return new NextResponse('Not found', { status: 404 });
  }
}
