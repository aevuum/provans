// app/api/1c/stocks/route.ts
// Синхронизация остатков товаров с 1C
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tryPrisma } from '@/lib/prismaSafe';

interface C1Stock {
  productId: string;
  barcode?: string;
  quantity: number;
  reserved?: number;
  warehouse?: string;
  lastUpdated?: string;
}

// Получение остатков для 1C (GET)
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
    const warehouse = searchParams.get('warehouse') || 'main';
    const productIds = searchParams.get('productIds')?.split(',');

    // Получаем товары для отправки остатков в 1C
    const whereCondition = productIds
      ? { id: { in: productIds.map(id => parseInt(id)).filter(id => !isNaN(id)) } }
      : {};

    const products = await tryPrisma(() => prisma.product.findMany({
        where: whereCondition,
        select: {
          id: true,
          barcode: true,
          title: true,
          quantity: true,
          reserved: true,
          updatedAt: true
        }
      }), { timeoutMs: 1500, retries: 1 }) as any[] | undefined;

    if (!Array.isArray(products)) {
      console.warn('[1c/stocks] prisma returned undefined or DB unreachable');
      return NextResponse.json({ status: 'success', data: [], count: 0, warehouse, syncTime: new Date().toISOString() });
    }

    // Формируем данные остатков для 1C
    type ProductFromDb = {
      id: number;
      barcode: string | null;
      title: string;
      quantity: number;
      reserved: number | null;
      updatedAt: Date | null;
    };

    const stocks: C1Stock[] = (products as ProductFromDb[]).map(product => ({
      productId: product.id.toString(),
      barcode: product.barcode ?? '',
      quantity: product.quantity,
      reserved: product.reserved ?? 0,
      warehouse: warehouse,
      lastUpdated: product.updatedAt ? product.updatedAt.toISOString() : undefined
    }));

    return NextResponse.json({
      status: 'success',
      data: stocks,
      count: stocks.length,
      warehouse,
      syncTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('1C Stocks Export Error:', error);
    return NextResponse.json(
      { error: 'Failed to export stocks' },
      { status: 500 }
    );
  }
}

// Обновление остатков из 1C (POST)
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

    const { stocks }: { stocks: C1Stock[] } = await request.json();

    if (!Array.isArray(stocks)) {
      return NextResponse.json(
        { error: 'Stocks array is required' },
        { status: 400 }
      );
    }

    let updated = 0;
    let notFound = 0;
    const errors: string[] = [];

    for (const stock of stocks) {
      try {
        // Ищем товар по ID или штрихкоду
        const product = await tryPrisma(() => prisma.product.findFirst({
          where: {
            OR: [
              { id: parseInt(stock.productId) || -1 },
              { barcode: stock.barcode }
            ]
          }
        }), { timeoutMs: 1500, retries: 1 });

        if (product === undefined) {
          // DB unreachable for this item — record error and continue
          console.warn(`1c/stocks: DB unreachable when looking up product ${stock.productId}`);
          errors.push(`Product ${stock.productId}: DB unreachable`);
          continue;
        }

        if (!product) {
          notFound++;
          console.warn(`Product not found: ID=${stock.productId}, barcode=${stock.barcode}`);
          continue;
        }

        // Обновляем остатки — сузим тип product, используем безопасно
        const productRes = product as { id: number };
        const upd = await tryPrisma(() => prisma.product.update({
          where: { id: productRes.id },
          data: {
            quantity: stock.quantity,
            reserved: stock.reserved || 0
          }
        }), { timeoutMs: 1500, retries: 1 });

        if (upd === undefined) {
          console.warn(`1c/stocks: DB unreachable when updating product ${stock.productId}`);
          errors.push(`Product ${stock.productId}: DB unreachable during update`);
          continue;
        }

        updated++;

      } catch (stockError) {
        console.error(`Error updating stock for product ${stock.productId}:`, stockError);
        errors.push(`Product ${stock.productId}: ${stockError}`);
      }
    }

    return NextResponse.json({
      status: 'success',
      summary: {
        processed: stocks.length,
        updated,
        notFound,
        errors: errors.length
      },
      errors: errors.length > 0 ? errors : undefined,
      syncTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('1C Stocks Update Error:', error);
    return NextResponse.json(
      { error: 'Failed to update stocks' },
      { status: 500 }
    );
  }
}

// Массовое обновление цен из 1C (PUT)
export async function PUT(request: NextRequest) {
  try {
    // Проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (!isValidAuth(authHeader)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { prices }: { prices: Array<{ productId: string; price: number; barcode?: string }> } = await request.json();

    if (!Array.isArray(prices)) {
      return NextResponse.json(
        { error: 'Prices array is required' },
        { status: 400 }
      );
    }

    let updated = 0;
    let notFound = 0;
    const errors: string[] = [];

    for (const priceItem of prices) {
      try {
        // Ищем товар по ID или штрихкоду
        const product = await prisma.product.findFirst({
          where: {
            OR: [
              { id: parseInt(priceItem.productId) || -1 },
              { barcode: priceItem.barcode }
            ]
          }
        });

        if (!product) {
          notFound++;
          console.warn(`Product not found: ID=${priceItem.productId}, barcode=${priceItem.barcode}`);
          continue;
        }

        // Обновляем цену
        await prisma.product.update({
          where: { id: product.id },
          data: {
            price: priceItem.price,
            updatedAt: new Date()
          }
        });

        console.log(`Price updated for product ${product.id}: ${priceItem.price}`);
        updated++;

      } catch (priceError) {
        console.error(`Error updating price for product ${priceItem.productId}:`, priceError);
        errors.push(`Product ${priceItem.productId}: ${priceError}`);
      }
    }

    return NextResponse.json({
      status: 'success',
      summary: {
        processed: prices.length,
        updated,
        notFound,
        errors: errors.length
      },
      errors: errors.length > 0 ? errors : undefined,
      syncTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('1C Prices Update Error:', error);
    return NextResponse.json(
      { error: 'Failed to update prices' },
      { status: 500 }
    );
  }
}

// Проверка авторизации
function isValidAuth(authHeader: string | null): boolean {
  if (!authHeader) return false;
  
  const apiKey = process.env.NEXT_1C_API_KEY;
  if (apiKey && authHeader === `Bearer ${apiKey}`) {
    return true;
  }

  const basicAuth = process.env.NEXT_1C_BASIC_AUTH;
  if (basicAuth && authHeader === `Basic ${basicAuth}`) {
    return true;
  }

  // Временная заглушка для разработки
  return authHeader.startsWith('Bearer test') || authHeader.startsWith('Basic test');
}
