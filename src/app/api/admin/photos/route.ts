import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const photoDir = path.join(process.cwd(), 'public', 'ФОТО');
    
    if (!fs.existsSync(photoDir)) {
      return NextResponse.json({ error: 'Папка ФОТО не найдена' }, { status: 404 });
    }

    const files = fs.readdirSync(photoDir);
    
    // Фильтруем только изображения
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    return NextResponse.json({ files: imageFiles });
    
  } catch (error) {
    console.error('Error reading photo directory:', error);
    return NextResponse.json(
      { error: 'Ошибка чтения папки с фото' },
      { status: 500 }
    );
  }
}
