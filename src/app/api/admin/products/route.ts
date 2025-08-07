import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/authUtils';
import prisma from '@/lib/prisma';

// POST - создание нового продукта
export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({ error: 'Нет сессии' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Нет прав администратора' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      price,
      size,
      material,
      country,
      barcode,
      comment,
      image,
      images,
      isConfirmed = false,
      discount = 0,
      category,
      quantity = 1
    } = body;

    // Валидация обязательных полей
    if (!title || !price) {
      return NextResponse.json(
        { error: 'Название и цена обязательны' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        title: title.trim(),
        price: parseFloat(price),
        size: size?.trim() || null,
        material: material?.trim() || null,
        country: country?.trim() || null,
        barcode: barcode?.trim() || null,
        comment: comment?.trim() || null,
        image: image?.trim() || null,
        images: Array.isArray(images) ? images.filter(Boolean) : [],
        isConfirmed,
        discount: discount ? parseFloat(discount) : 0,
        category: category?.trim() || null,
        quantity: quantity ? parseInt(quantity) : 1
      }
    });

    return NextResponse.json(product, { status: 201 });

  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Ошибка создания продукта' },
      { status: 500 }
    );
  }
}

// GET - получение продуктов для админки (с фильтрацией)
export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Нет сессии' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Нет прав администратора' }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    
    // Пагинация
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '349'); // Показываем все товары
    const skip = (page - 1) * limit;

    // Фильтры
    const search = searchParams.get('search');
    const confirmed = searchParams.get('confirmed');
    const status = searchParams.get('status');
    
    // Строим условия WHERE
    const where: Record<string, unknown> = {};
    
    // Поиск
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { material: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Фильтр по подтверждению
    if (confirmed === 'true') {
      where.isConfirmed = true;
    } else if (confirmed === 'false') {
      where.isConfirmed = false;
    }

    // Фильтр по статусу
    if (status === 'pending') {
      where.isConfirmed = false;
    } else if (status === 'confirmed') {
      where.isConfirmed = true;
    }

    // Получаем общее количество
    const total = await prisma.product.count({ where });

    // Получаем продукты
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

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
    console.error('Get admin products error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения продуктов' },
      { status: 500 }
    );
  }
}
