// app/api/1c/catalog/route.ts
// Синхронизация каталога товаров с 1C
import { NextRequest, NextResponse } from 'next/server';
import { c1Integration } from '@/lib/1c-config';
import { prisma } from '@/lib/prisma';
import { tryPrisma } from '@/lib/prismaSafe';
import type { ProductMinimal } from '@/lib/prisma-types';

export async function GET(request: NextRequest) {
  try {
    // Проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (!c1Integration.validateAuth(authHeader)) {
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

    const products = await tryPrisma(() => prisma.product.findMany({
      where: whereCondition,
      take: limit,
      orderBy: { updatedAt: 'desc' }
    }), { timeoutMs: 1500, retries: 1 }) as any[] | undefined;

    if (!Array.isArray(products)) {
      console.warn('[1c/catalog] prisma returned undefined or DB unreachable');
      return NextResponse.json({ status: 'success', data: [], count: 0, syncTime: new Date().toISOString() });
    }

  // Преобразуем в формат 1C (без material и country)
  const c1Products = products.map((product: ProductMinimal & { updatedAt?: Date | null }) => ({
      id: product.id.toString(),
      title: product.title,
      price: product.price,
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
    if (!c1Integration.validateAuth(authHeader)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { products }: { products: Array<{
      id: string;
      title: string;
      price: number;
      barcode?: string;
      images?: string[];
      size?: string;
      comment?: string;
    }>; } = await request.json();

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
        const existingProduct = await tryPrisma(() => prisma.product.findFirst({
          where: {
            OR: [
              { barcode: c1Product.barcode },
              { id: parseInt(c1Product.id) || -1 }
            ]
          }
        }), { timeoutMs: 1500, retries: 1 }) as (ProductMinimal & { id: number }) | null | undefined;

        const productData = {
          title: c1Product.title,
          price: c1Product.price,
          barcode: c1Product.barcode ?? null,
          size: c1Product.size ?? null,
          comment: c1Product.comment ?? null,
          images: c1Product.images || [],
          isConfirmed: true // Товары из 1C автоматически подтверждены
        };

        if (existingProduct && typeof existingProduct === 'object' && 'id' in existingProduct) {
          // Обновляем существующий товар
          await tryPrisma(() => prisma.product.update({
            where: { id: (existingProduct as any).id },
            data: productData
          }), { timeoutMs: 1500, retries: 1 });
          updated++;
        } else {
          // Создаем новый товар
          await tryPrisma(() => prisma.product.create({
            data: productData
          }), { timeoutMs: 1500, retries: 1 });
          created++;
        }

      } catch (productError) {
        console.error(`Error processing product ${c1Product.id}:`, productError);
        errors.push(`Product ${c1Product.id}: ${productError}` as string);
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
