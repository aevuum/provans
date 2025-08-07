// app/api/1c/catalog/route.ts
// Синхронизация каталога товаров с 1C
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface C1Product {
  id: string;
  title: string;
  price: number;
  material?: string;
  country?: string;
  barcode?: string;
  images?: string[];
  stock?: number;
  size?: string;
  comment?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (!isValidAuth(authHeader)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const lastSync = searchParams.get('lastSync'); // Дата последней синхронизации
    const limit = parseInt(searchParams.get('limit') || '1000');

    // Получаем товары для экспорта в 1C
    const whereCondition = lastSync 
      ? { updatedAt: { gte: new Date(lastSync) } }
      : {};

    const products = await prisma.product.findMany({
      where: whereCondition,
      take: limit,
      orderBy: { updatedAt: 'desc' }
    });

    // Преобразуем в формат 1C
    const c1Products = products.map(product => ({
      id: product.id.toString(),
      title: product.title,
      price: product.price,
      material: product.material,
      country: product.country,
      barcode: product.barcode,
      size: product.size,
      comment: product.comment,
      images: product.images || [],
      isConfirmed: product.isConfirmed,
      updatedAt: product.updatedAt?.toISOString()
    }));

    return NextResponse.json({
      status: 'success',
      data: c1Products,
      count: c1Products.length,
      syncTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('1C Catalog Export Error:', error);
    return NextResponse.json(
      { error: 'Failed to export catalog' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (!isValidAuth(authHeader)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { products }: { products: C1Product[] } = await request.json();

    if (!Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Products array is required' },
        { status: 400 }
      );
    }

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const c1Product of products) {
      try {
        // Ищем существующий товар по внешнему ID или штрихкоду
        const existingProduct = await prisma.product.findFirst({
          where: {
            OR: [
              { barcode: c1Product.barcode },
              { id: parseInt(c1Product.id) || -1 }
            ]
          }
        });

        const productData = {
          title: c1Product.title,
          price: c1Product.price,
          material: c1Product.material,
          country: c1Product.country,
          barcode: c1Product.barcode,
          size: c1Product.size,
          comment: c1Product.comment,
          images: c1Product.images || [],
          isConfirmed: true // Товары из 1C автоматически подтверждены
        };

        if (existingProduct) {
          // Обновляем существующий товар
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: productData
          });
          updated++;
        } else {
          // Создаем новый товар
          await prisma.product.create({
            data: productData
          });
          created++;
        }

      } catch (productError) {
        console.error(`Error processing product ${c1Product.id}:`, productError);
        errors.push(`Product ${c1Product.id}: ${productError}`);
      }
    }

    return NextResponse.json({
      status: 'success',
      summary: {
        processed: products.length,
        created,
        updated,
        errors: errors.length
      },
      errors: errors.length > 0 ? errors : undefined,
      syncTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('1C Catalog Import Error:', error);
    return NextResponse.json(
      { error: 'Failed to import catalog' },
      { status: 500 }
    );
  }
}

// Проверка авторизации (общая функция)
function isValidAuth(authHeader: string | null): boolean {
  if (!authHeader) return false;
  
  // Проверяем API ключ из переменных окружения
  const apiKey = process.env.NEXT_1C_API_KEY;
  if (apiKey && authHeader === `Bearer ${apiKey}`) {
    return true;
  }

  // Проверяем Basic Auth
  const basicAuth = process.env.NEXT_1C_BASIC_AUTH;
  if (basicAuth && authHeader === `Basic ${basicAuth}`) {
    return true;
  }

  // Временная заглушка для разработки
  return authHeader.startsWith('Bearer test') || authHeader.startsWith('Basic test');
}
