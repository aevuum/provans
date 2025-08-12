import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/authUtils';
import { prisma } from '@/lib/prisma';
import fs from 'node:fs/promises';
import path from 'node:path';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Проверяем авторизацию
    const session = await getAdminSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }
    
    const { id } = await context.params;
    const productId = parseInt(id);
    const body = await request.json().catch(() => ({}));
    const { isNew, category } = body as { isNew?: boolean; category?: string | null };

    if (!productId) {
      return NextResponse.json(
        { error: 'ID товара обязателен' },
        { status: 400 }
      );
    }

    // Проверяем, что у товара есть хотя бы одно изображение
    const current = await prisma.product.findUnique({ where: { id: productId } });
    if (!current) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }
    const images = current.images || [];
    const hasAnyImage = (current.image && current.image.trim() !== '') || images.some((i) => i && i.trim() !== '');
    if (!hasAnyImage) {
      return NextResponse.json({ error: 'Нельзя одобрить товар без фото' }, { status: 400 });
    }

    // Обновляем товар - подтверждаем и при необходимости помечаем как новый
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        isConfirmed: true,
        category: category ? category : current.category, // обновляем категорию если задана
        ...(isNew ? { createdAt: new Date() } : {}),
      }
    });

    // Синхронизируем подтвержденные товары в archive/products.json
    try {
      const confirmed = await prisma.product.findMany({ where: { isConfirmed: true } });
      const payload = {
        products: confirmed.map((p) => ({
          title: p.title,
          image_path: p.image || (p.images?.[0] ?? null),
          price: p.price,
          discount: p.discount ?? 0,
          size: p.size ?? null,
          category: p.category ?? null,
          barcode: p.barcode ?? null,
          comment: p.comment ?? null,
        })),
      };
      const filePath = path.join(process.cwd(), 'archive', 'products.json');
      await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (e) {
      console.warn('JSON sync after approve failed:', e);
    }

    return NextResponse.json({ 
      success: true, 
      product: updatedProduct 
    });
  } catch (error) {
    console.error('Error approving product:', error);
    return NextResponse.json(
      { error: 'Ошибка при подтверждении товара' },
      { status: 500 }
    );
  }
}
