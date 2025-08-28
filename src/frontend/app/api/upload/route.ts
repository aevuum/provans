import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs/promises';
import { getAdminSession } from '../../../lib/authUtils';

export const dynamic = 'force-dynamic';

function normalizeFilename(name: string) {
  // Заменяем пробелы на _, убираем опасные символы
  return name
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Файл не передан' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const origName = (file as File).name || 'image';
    const ext = path.extname(origName) || '.jpg';
    const base = path.basename(origName, ext);
    const safe = normalizeFilename(base);
    const fname = `${Date.now()}_${safe}${ext.toLowerCase()}`;

    const absPath = path.join(uploadsDir, fname);
    // Защита на выход за пределы /public/uploads
    if (!absPath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Неверный путь' }, { status: 400 });
    }

    await fs.writeFile(absPath, buffer);

    const url = `/uploads/${fname}`;
    return NextResponse.json({ url, filename: fname });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Ошибка загрузки файла' }, { status: 500 });
  }
}
