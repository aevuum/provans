/* eslint-disable @typescript-eslint/no-unused-vars */
// Архив: тестовый эндпоинт продуктов (products-simple)
// Перемещено из src/app/api/products-simple/route.ts
// Причина: дублирует реальный эндпоинт /api/products-new и может вносить путаницу.

// app/api/products-simple/route.ts (оригинал)
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');

    const testProducts = [
      {
        id: '1',
        title: 'Тестовый товар 1',
        price: 1000,
        originalPrice: 1200,
        discount: 200,
        description: 'Описание товара',
        material: 'Керамика',
        size: '15x10x8',
        country: 'Россия',
        category: 'декор',
        subcategory: 'фигурки',
        isConfirmed: true,
        quantity: 5,
        reserved: 0,
        barcode: '123456789',
        images: ['/public/ФОТО/test.jpeg'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'Тестовый товар 2',
        price: 1500,
        originalPrice: 1800,
        discount: 300,
        description: 'Описание товара 2',
        material: 'Дерево',
        size: '20x15x10',
        country: 'Россия',
        category: 'декор',
        subcategory: 'вазы',
        isConfirmed: true,
        quantity: 3,
        reserved: 0,
        barcode: '987654321',
        images: ['/public/ФОТО/test2.jpeg'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        products: testProducts.slice(0, limit),
        pagination: {
          page,
          limit,
          total: testProducts.length,
          totalPages: Math.ceil(testProducts.length / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Ошибка при получении товаров',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { search, minPrice, maxPrice, material, country, categories, type, page = 1, limit = 10 } = body;

    const testProducts = [
      {
        id: '1',
        title: 'Поиск товар 1',
        price: 1000,
        originalPrice: 1200,
        discount: 200,
        description: 'Описание товара из поиска',
        material: material || 'Керамика',
        size: '15x10x8',
        country: country || 'Россия',
        category: 'декор',
        subcategory: 'фигурки',
        isConfirmed: true,
        quantity: 5,
        reserved: 0,
        barcode: '123456789',
        images: ['/public/ФОТО/test.jpeg'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        products: testProducts.slice(0, limit),
        pagination: {
          page,
          limit,
          total: testProducts.length,
          totalPages: Math.ceil(testProducts.length / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching products via POST:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Ошибка при получении товаров',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
