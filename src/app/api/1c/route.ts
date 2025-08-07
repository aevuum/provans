// app/api/1c/route.ts
// Основной endpoint для интеграции с 1C
import { NextRequest, NextResponse } from 'next/server';

// Типы для интеграции с 1C
interface C1Product {
  id: string;
  title: string;
  price: number;
  material?: string;
  country?: string;
  barcode?: string;
  images?: string[];
  stock?: number;
}

interface C1Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
}

interface C1Stock {
  productId: string;
  quantity: number;
  reserved?: number;
}

type C1ImportData = {
  products?: C1Product[];
  orders?: C1Order[];
  stocks?: C1Stock[];
};

export async function GET(request: NextRequest) {
  try {
    // Проверяем аутентификацию 1C (по API ключу или Basic Auth)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !isValidAuth(authHeader)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('mode');

    switch (mode) {
      case 'catalog':
        return handleCatalogSync();
      case 'orders':
        return handleOrdersSync();
      case 'stocks':
        return handleStocksSync();
      default:
        return NextResponse.json({
          status: 'ok',
          message: '1C Integration API',
          version: '1.0',
          endpoints: {
            catalog: '/api/1c?mode=catalog',
            orders: '/api/1c?mode=orders',
            stocks: '/api/1c?mode=stocks'
          }
        });
    }

  } catch (error) {
    console.error('1C API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !isValidAuth(authHeader)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('mode');

    switch (mode) {
      case 'catalog':
        return handleCatalogImport(data);
      case 'orders':
        return handleOrderExport(data);
      case 'stocks':
        return handleStockUpdate(data);
      default:
        return NextResponse.json(
          { error: 'Unknown mode' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('1C API POST Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Проверка авторизации 1C
function isValidAuth(authHeader: string): boolean {
  // TODO: Реализовать проверку API ключа или Basic Auth
  // Пример: const apiKey = process.env.NEXT_1C_API_KEY;
  // return authHeader === `Bearer ${apiKey}`;
  
  // Временная заглушка для разработки
  return authHeader.startsWith('Bearer ') || authHeader.startsWith('Basic ');
}

// Обработчики для разных режимов синхронизации
async function handleCatalogSync() {
  // Экспорт каталога товаров для 1C
  return NextResponse.json({
    status: 'success',
    message: 'Catalog sync endpoint ready'
  });
}

async function handleOrdersSync() {
  // Получение заказов для передачи в 1C
  return NextResponse.json({
    status: 'success',
    message: 'Orders sync endpoint ready'
  });
}

async function handleStocksSync() {
  // Получение остатков товаров
  return NextResponse.json({
    status: 'success',
    message: 'Stocks sync endpoint ready'
  });
}

async function handleCatalogImport(data: C1ImportData) {
  // Импорт товаров из 1C
  return NextResponse.json({
    status: 'success',
    message: 'Catalog import endpoint ready',
    received: data.products?.length || 0
  });
}

async function handleOrderExport(data: C1ImportData) {
  // Экспорт заказов в 1C
  return NextResponse.json({
    status: 'success',
    message: 'Order export endpoint ready',
    received: data.orders?.length || 0
  });
}

async function handleStockUpdate(data: C1ImportData) {
  // Обновление остатков из 1C
  return NextResponse.json({
    status: 'success',
    message: 'Stock update endpoint ready',
    received: data.stocks?.length || 0
  });
}
