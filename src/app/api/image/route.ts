import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imagePath = searchParams.get('path');
    
    if (!imagePath) {
      return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
    }

    // Декодируем путь
    const decodedPath = decodeURIComponent(imagePath);
    
    // Безопасность: проверяем, что путь не выходит за пределы public
    const safePath = path.normalize(decodedPath).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.join(process.cwd(), 'public', safePath);
    
    // Проверяем, что файл действительно в папке public
    const publicDir = path.join(process.cwd(), 'public');
    if (!fullPath.startsWith(publicDir)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Проверяем существование файла
    if (!fs.existsSync(fullPath)) {
      console.log('Image not found:', fullPath);
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Получаем статистику файла
    const stats = fs.statSync(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    
    // Определяем MIME тип
    let contentType = 'image/jpeg';
    switch (ext) {
      case '.png': contentType = 'image/png'; break;
      case '.gif': contentType = 'image/gif'; break;
      case '.webp': contentType = 'image/webp'; break;
      case '.svg': contentType = 'image/svg+xml'; break;
      case '.bmp': contentType = 'image/bmp'; break;
      default: contentType = 'image/jpeg';
    }

    // Читаем файл
    const fileBuffer = fs.readFileSync(fullPath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Last-Modified': stats.mtime.toUTCString(),
        'ETag': `"${stats.mtime.getTime()}-${stats.size}"`,
      },
    });

  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
