// app/api/products/similar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const excludeId = searchParams.get('exclude');
    const limit = parseInt(searchParams.get('limit') || '10');

    const whereClause: {
      isConfirmed: boolean;
      id?: { not: number };
      category?: { contains: string };
    } = {
      isConfirmed: true,
    };

    // Исключаем текущий товар
    if (excludeId) {
      whereClause.id = {
        not: parseInt(excludeId)
      };
    }

    // Фильтр по категории
    if (category && category !== 'null' && category !== 'undefined') {
      whereClause.category = {
        contains: category
      };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        price: true,
        discount: true,
        category: true,
        image: true,
        images: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      products,
      total: products.length
    });

  } catch (error) {
    console.error('Ошибка при получении похожих товаров:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
