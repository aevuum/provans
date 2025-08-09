// app/api/1c/route.ts
// Основной endpoint для интеграции с 1C
import { NextRequest, NextResponse } from 'next/server';
import { c1Integration, type C1ImportData } from '@/lib/1c-config';

export async function GET(request: NextRequest) {
  try {
    // Проверяем аутентификацию 1C (по API ключу или Basic Auth)
    const authHeader = request.headers.get('authorization');
    if (!c1Integration.validateAuth(authHeader)) {
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
    if (!c1Integration.validateAuth(authHeader)) {
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
