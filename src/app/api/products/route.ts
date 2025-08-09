// app/api/products/route.ts - Унифицированный API товаров
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    
    // Пагинация
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Фильтры из query
    const type = searchParams.get('type'); // new, discount, popular, all
    const search = searchParams.get('search') || undefined;
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // Категории: поддерживаем и category, и categories (через запятую)
    const categorySingle = searchParams.get('category') || undefined;
    const categoriesParam = searchParams.get('categories') || undefined;
    const categories: string[] = [];
    if (categoriesParam) {
      categories.push(
        ...categoriesParam
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      );
    }
    if (categorySingle) categories.push(categorySingle);

    // Сортировка
    const sortBy = searchParams.get('sortBy') || undefined; // createdAt | discount | price
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Базовый фильтр
    const whereClause: Prisma.ProductWhereInput = {
      isConfirmed: true
    };

    // Поиск по названию/описанию
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { comment: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Фильтр по цене
    if (minPrice || maxPrice) {
      const priceFilter: Prisma.IntFilter = {};
      if (minPrice) priceFilter.gte = parseInt(minPrice);
      if (maxPrice) priceFilter.lte = parseInt(maxPrice);
      whereClause.price = priceFilter;
    }

    // Фильтр по категориям
    if (categories.length > 0) {
      whereClause.category = { in: categories };
    }

    // Фильтр по типу + сортировка по умолчанию
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };

    if (type === 'new') {
      orderBy = { createdAt: 'desc' };
    } else if (type === 'discount') {
      whereClause.discount = { gt: 0 };
      orderBy = { discount: 'desc' };
    } else if (type === 'popular') {
      orderBy = { title: 'asc' };
    }

    // Переопределение сортировки из query, если задана
    if (sortBy) {
      if (sortBy === 'createdAt') orderBy = { createdAt: sortOrder };
      else if (sortBy === 'discount') orderBy = { discount: sortOrder };
      else if (sortBy === 'price') orderBy = { price: sortOrder };
    }

    // Получение товаров
    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy,
      skip,
      take: limit
    });

    // Подсчет общего количества
    const total = await prisma.product.count({
      where: whereClause
    });

    // Форматирование данных (без material и country)
    const formattedProducts = products.map((product) => {
      let imageUrls: string[] = [];
      if (product.images && product.images.length > 0) {
        imageUrls = product.images;
      } else if (product.image) {
        imageUrls = [product.image];
      }

      return {
        id: product.id,
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        description: product.comment,
        size: product.size,
        category: product.category,
        subcategory: product.subcategory,
        isConfirmed: product.isConfirmed,
        quantity: product.quantity,
        reserved: product.reserved,
        barcode: product.barcode,
        images: imageUrls,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Ошибка при получении товаров',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      search,
      minPrice,
      maxPrice,
      categories,
      type,
      page = 1,
      limit = 10
    } = body;

    const skip = (page - 1) * limit;

    // Базовый фильтр
    const whereClause: Prisma.ProductWhereInput = {
      isConfirmed: true
    };

    // Поиск по названию
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { comment: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Фильтр по цене
    if (minPrice || maxPrice) {
      const priceFilter: Prisma.IntFilter = {};
      if (minPrice) priceFilter.gte = parseInt(minPrice);
      if (maxPrice) priceFilter.lte = parseInt(maxPrice);
      whereClause.price = priceFilter;
    }

    // Фильтр по категориям
    if (categories && categories.length > 0) {
      whereClause.category = { in: categories };
    }

    // Фильтр по типу
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }; // По умолчанию новые товары
    
    if (type === 'new') {
      orderBy = { createdAt: 'desc' };
    } else if (type === 'discount') {
      whereClause.discount = { gt: 0 };
      orderBy = { discount: 'desc' };
    } else if (type === 'popular') {
      orderBy = { title: 'asc' };
    }

    // Получение товаров
    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy,
      skip,
      take: limit
    });

    // Подсчет общего количества
    const total = await prisma.product.count({
      where: whereClause
    });

    // Форматирование данных (без material и country)
    const formattedProducts = products.map(product => {
      let imageUrls: string[] = [];
      if (product.images && product.images.length > 0) {
        imageUrls = product.images;
      } else if (product.image) {
        imageUrls = [product.image];
      }

      return {
        id: product.id,
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        description: product.comment,
        size: product.size,
        category: product.category,
        subcategory: product.subcategory,
        isConfirmed: product.isConfirmed,
        quantity: product.quantity,
        reserved: product.reserved,
        barcode: product.barcode,
        images: imageUrls,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching products via POST:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при получении товаров',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, 
      { status: 500 }
    );
  }
}
