import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/authUtils';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const session = await getAdminSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не найден' },
        { status: 400 }
      );
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Можно загружать только изображения' },
        { status: 400 }
      );
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Размер файла не должен превышать 5MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Генерируем уникальное имя файла
    const extension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${extension}`;
    
    // Путь для сохранения в public/uploads
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    // Возвращаем URL для доступа к файлу
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      url: fileUrl,
      message: 'Файл успешно загружен'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Ошибка загрузки файла' },
      { status: 500 }
    );
  }
}
