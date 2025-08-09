// app/api/products/promotions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    
    // Параметры поиска и фильтрации
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // Строим условия WHERE
    const where: {
      isConfirmed: boolean;
      discount: { gt: number };
      title?: { contains: string };
      category?: { contains: string };
      price?: { gte?: number; lte?: number };
    } = {
      isConfirmed: true, // Только подтвержденные товары
      discount: { gt: 0 } // Только товары со скидкой
    };

    // Поиск по названию
    if (search) {
      where.title = { contains: search };
    }

    // Фильтр по категории
    if (category) {
      where.category = { contains: category };
    }

    // Фильтр по цене (с учетом скидки)
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Получаем товары со скидкой
    const products = await prisma.product.findMany({
      where,
      orderBy: { discount: 'desc' }, // Сортируем по размеру скидки
    });

    const totalCount = products.length;

    return NextResponse.json({
      products,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: totalCount,
        itemsPerPage: products.length
      }
    });

  } catch (error) {
    console.error('Ошибка получения акций:', error);
    return NextResponse.json(
      { error: 'Ошибка получения акций' },
      { status: 500 }
    );
  }
}
