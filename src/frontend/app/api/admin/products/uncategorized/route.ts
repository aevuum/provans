import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tryPrisma } from '@/lib/prismaSafe';

export async function GET() {
  try {
    // Получаем товары без категории или с пустой категорией
    const products = await tryPrisma(() => prisma.product.findMany({
      where: {
        OR: [
          { category: null },
          { category: '' },
        ],
        isConfirmed: true, // Только подтвержденные товары
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Ограничиваем количество для удобства
    }));

    if (!Array.isArray(products)) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });

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
