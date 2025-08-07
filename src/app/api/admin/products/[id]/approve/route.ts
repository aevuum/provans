import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/authUtils';
import prisma from '@/lib/prisma';

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
    const { isNew } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'ID товара обязателен' },
        { status: 400 }
      );
    }

    // Обновляем товар - подтверждаем и при необходимости помечаем как новый
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        isConfirmed: true,
        category: 'Другое', // Устанавливаем дефолтную категорию
        // Если отмечен как новый, устанавливаем дату создания на текущее время
        ...(isNew && { createdAt: new Date() })
      }
    });

    return NextResponse.json({ 
      success: true, 
      product: updatedProduct 
    });

    // Подтверждаем товар
    const product = await prisma.product.update({
      where: { id: productId },
      data: { isConfirmed: true }
    });

    return NextResponse.json({
      message: 'Товар успешно подтвержден',
      product
    });
  } catch (error) {
    console.error('Error approving product:', error);
    return NextResponse.json(
      { error: 'Ошибка при подтверждении товара' },
      { status: 500 }
    );
  }
}
