import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Получаем товары без категории или с пустой категорией
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { category: null },
          { category: '' },
          { categoryId: null }
        ],
        isConfirmed: true, // Только подтвержденные товары
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Ограничиваем количество для удобства
    });

    return NextResponse.json({ 
      products,
      total: products.length 
    });
    
  } catch (error) {
    console.error('Error fetching uncategorized products:', error);
    return NextResponse.json(
      { error: 'Ошибка получения товаров' },
      { status: 500 }
    );
  }
}
