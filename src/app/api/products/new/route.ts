// app/api/products/new/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    
    // Параметры поиска и фильтрации
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const material = searchParams.get('material');
    const country = searchParams.get('country');

    // Строим условия WHERE
    const where: {
      isConfirmed: boolean;
      title?: { contains: string };
      category?: { contains: string };
      price?: { gte?: number; lte?: number };
      material?: { contains: string };
      country?: { contains: string };
    } = {
      isConfirmed: true // Только подтвержденные товары
    };

    // Поиск по названию
    if (search) {
      where.title = { contains: search };
    }

    // Фильтр по категории (предполагаем, что у товаров есть поле category)
    if (category) {
      where.category = { contains: category };
    }

    // Фильтр по цене
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Фильтр по материалу
    if (material) {
      where.material = { contains: material };
    }

    // Фильтр по стране
    if (country) {
      where.country = { contains: country };
    }

    // Получаем последние 100 товаров
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const totalCount = products.length;

    return NextResponse.json({
      products,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: totalCount,
        itemsPerPage: 100
      }
    });

  } catch (error) {
    console.error('Ошибка получения новинок:', error);
    return NextResponse.json(
      { error: 'Ошибка получения новинок' },
      { status: 500 }
    );
  }
}
