// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    
    // Пагинация
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Фильтры
    const type = searchParams.get('type'); // new, discount, popular

    // Базовый фильтр
    const whereClause: any = {
      isConfirmed: true
    };

    // Фильтр по типу
    let orderBy: any = { createdAt: 'desc' }; // По умолчанию новые товары
    
    if (type === 'new') {
      // Новинки - последние добавленные товары
      orderBy = { createdAt: 'desc' };
    } else if (type === 'discount') {
      // Акции - товары со скидкой
      whereClause.discount = { gt: 0 };
      orderBy = { discount: 'desc' };
    } else if (type === 'popular') {
      // Популярные
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

    // Форматирование данных
    const formattedProducts = products.map(product => {
      // Формируем массив изображений из поля images или используем основное изображение
      let imageUrls = [];
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
        material: product.material,
        size: product.size,
        country: product.country,
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
      material,
      country,
      categories,
      type,
      page = 1,
      limit = 10
    } = body;

    const skip = (page - 1) * limit;

    // Базовый фильтр
    const whereClause: any = {
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
      const priceFilter: any = {};
      if (minPrice) priceFilter.gte = parseInt(minPrice);
      if (maxPrice) priceFilter.lte = parseInt(maxPrice);
      whereClause.price = priceFilter;
    }

    // Фильтр по материалу
    if (material) {
      whereClause.material = { contains: material, mode: 'insensitive' };
    }

    // Фильтр по стране
    if (country) {
      whereClause.country = { contains: country, mode: 'insensitive' };
    }

    // Фильтр по категориям
    if (categories && categories.length > 0) {
      whereClause.category = {
        in: categories
      };
    }

    // Фильтр по типу
    let orderBy: any = { createdAt: 'desc' }; // По умолчанию новые товары
    
    if (type === 'new') {
      // Новинки - последние добавленные товары (как вы просили - те же самые новинки, но только последние 10)
      orderBy = { createdAt: 'desc' };
    } else if (type === 'discount') {
      // Акции - товары со скидкой
      whereClause.discount = { gt: 0 };
      orderBy = { discount: 'desc' };
    } else if (type === 'popular') {
      // Популярные
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

    // Форматирование данных
    const formattedProducts = products.map(product => {
      // Формируем массив изображений из поля images или используем основное изображение
      let imageUrls = [];
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
        material: product.material,
        size: product.size,
        country: product.country,
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
