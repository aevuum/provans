import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const base = path.join(process.cwd(), 'public');
    const dirs = ['фото', 'ФОТО'].map((d) => path.join(base, d));
    const existing = dirs.find((d) => fs.existsSync(d));

    if (!existing) {
      return NextResponse.json({ error: 'Папка фото не найдена' }, { status: 404 });
    }

    const files = fs.readdirSync(existing);

    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    return NextResponse.json({ files: imageFiles });
  } catch (error) {
    console.error('Error reading photo directory:', error);
    return NextResponse.json({ error: 'Ошибка чтения папки с фото' }, { status: 500 });
  }
}
