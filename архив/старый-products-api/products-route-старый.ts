// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    
    // Пагинация
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '1000');
    const skip = (page - 1) * limit;

    // Фильтры
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const material = searchParams.get('material');
    const country = searchParams.get('country');
    const category = searchParams.get('category'); // Старое API
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
    const subcategories = searchParams.get('subcategories')?.split(',').filter(Boolean) || [];
    const sort = searchParams.get('sort') || 'default'; // 'default', 'price-asc', 'price-desc', 'name-asc', 'popular'
    const type = searchParams.get('type'); // 'new', 'discount', 'all'

    // Строим условия WHERE
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      isConfirmed: true,
    };

    // Поиск по названию, материалу, комментарию
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { material: { contains: search, mode: 'insensitive' } },
        { comment: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Фильтр по цене
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice);
      if (maxPrice) where.price.lte = parseInt(maxPrice);
    }

    // Фильтр по материалу
    if (material) {
      where.material = { contains: material, mode: 'insensitive' };
    }

    // Фильтр по стране
    if (country) {
      where.country = { contains: country, mode: 'insensitive' };
    }

    // Фильтр по старому полю категории
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    // Фильтр по категориям
    if (categories.length > 0 || subcategories.length > 0) {
      where.OR = where.OR || [];
      
      if (categories.length > 0) {
        where.OR.push({
          categoryModel: {
            slug: { in: categories }
          }
        });
      }
      
      if (subcategories.length > 0) {
        where.OR.push({
          subcategoryModel: {
            slug: { in: subcategories }
          }
        });
      }
    }

    // Фильтр по типу
    if (type === 'new') {
      // Новинки - последние 50 товаров
      where.createdAt = {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // за последний месяц
      };
    } else if (type === 'discount') {
      // Акции - товары со скидкой
      where.discount = { gt: 0 };
    }

    // Определяем сортировку
    let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' }; // по умолчанию
    
    switch (sort) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'name-asc':
        orderBy = { title: 'asc' };
        break;
      case 'popular':
        // TODO: добавить поле popularity или использовать количество просмотров
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Получаем общее количество для пагинации (оптимизированный запрос)
    const total = await prisma.product.count({ where });

    // Получаем продукты с пагинацией и сортировкой (только нужные поля)
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        title: true,
        price: true,
        originalPrice: true,
        discount: true,
        image: true,
        images: true,
        category: true,
        material: true,
        country: true,
        barcode: true,
        quantity: true,
        isConfirmed: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy,
      skip,
      take: limit
    });

    // Возвращаем данные с метаинформацией
    return NextResponse.json({
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('API Products Error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения продуктов' },
      { status: 500 }
    );
  }
}