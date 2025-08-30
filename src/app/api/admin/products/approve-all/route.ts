import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { productIds, isNew } = await request.json();

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Список ID товаров обязателен' },
        { status: 400 }
      );
    }

    // Массово обновляем товары
    const updatedProducts = await prisma.product.updateMany({
      where: { 
        id: { in: productIds }
      },
      data: {
        isConfirmed: true,
        category: 'Другое',
        // Для массового обновления нельзя использовать динамические значения
        // поэтому обновляем дату отдельно если нужно
      }
    });

    // Если нужно пометить как новые товары, обновляем дату создания
    if (isNew) {
      await prisma.product.updateMany({
        where: { 
          id: { in: productIds }
        },
        data: {
          createdAt: new Date()
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      updatedCount: updatedProducts.count 
    });
    
  } catch (error) {
    console.error('Error approving products:', error);
    return NextResponse.json(
      { error: 'Ошибка одобрения товаров' },
      { status: 500 }
    );
  }
}
