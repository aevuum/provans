// app/api/1c/stocks/route.ts
// Синхронизация остатков товаров с 1C
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

    const products = await prisma.product.findMany({
      where: whereCondition,
      select: {
        id: true,
        barcode: true,
        title: true,
        quantity: true,
        reserved: true,
        updatedAt: true
      }
    });

    // Формируем данные остатков для 1C
    const stocks: C1Stock[] = products.map(product => ({
      productId: product.id.toString(),
      barcode: product.barcode || '',
      quantity: product.quantity,
      reserved: product.reserved,
      warehouse: warehouse,
      lastUpdated: product.updatedAt.toISOString()
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
        const product = await prisma.product.findFirst({
          where: {
            OR: [
              { id: parseInt(stock.productId) || -1 },
              { barcode: stock.barcode }
            ]
          }
        });

        if (!product) {
          notFound++;
          console.warn(`Product not found: ID=${stock.productId}, barcode=${stock.barcode}`);
          continue;
        }

        // Обновляем остатки
        await prisma.product.update({
          where: { id: product.id },
          data: {
            quantity: stock.quantity,
            reserved: stock.reserved || 0
          }
        });

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
