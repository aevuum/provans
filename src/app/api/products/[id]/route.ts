// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { 
        id: parseInt(id),
        isConfirmed: true // Показываем только подтвержденные товары
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// Обновление данных товара (только для админа)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Простая проверка доступа для демо
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== 'Bearer admin-token') {
      // Для демо разрешаем все запросы
      // return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    const { id } = await context.params;
    const productId = parseInt(id);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Неверный ID товара' },
        { status: 400 }
      );
    }

    const { quantity, reserved, price, title, category } = await request.json();

    // Валидация данных
    if (quantity !== undefined && quantity < 0) {
      return NextResponse.json(
        { error: 'Количество не может быть отрицательным' },
        { status: 400 }
      );
    }

    if (reserved !== undefined && reserved < 0) {
      return NextResponse.json(
        { error: 'Зарезервированное количество не может быть отрицательным' },
        { status: 400 }
      );
    }

    if (quantity !== undefined && reserved !== undefined && reserved > quantity) {
      return NextResponse.json(
        { error: 'Зарезервированное количество не может быть больше общего количества' },
        { status: 400 }
      );
    }

    // Подготавливаем данные для обновления
    const updateData: Record<string, unknown> = {};
    
    if (quantity !== undefined) updateData.quantity = quantity;
    if (reserved !== undefined) updateData.reserved = reserved;
    if (price !== undefined) updateData.price = price;
    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;

    // Обновляем товар
    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении товара' },
      { status: 500 }
    );
  }
}
