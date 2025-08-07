// app/api/1c/orders/route.ts
// Синхронизация заказов с 1C
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface C1OrderItem {
  productId: string;
  productTitle: string;
  quantity: number;
  price: number;
}

interface C1Order {
  id?: string;
  externalId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  items: C1OrderItem[];
  total: number;
  status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt?: string;
  notes?: string;
}

// Экспорт заказов в 1C (GET)
export async function GET(request: NextRequest) {
  try {
    // Проверка авторизации

    // Функция для преобразования статусов
    const convertStatus = (status: string): 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled' => {
      switch (status) {
        case 'PENDING':
          return 'new';
        case 'CONFIRMED':
        case 'PROCESSING':
          return 'processing';
        case 'SHIPPED':
          return 'shipped';
        case 'DELIVERED':
          return 'delivered';
        case 'CANCELLED':
          return 'cancelled';
        default:
          return 'new';
      }
    };
    const authHeader = request.headers.get('authorization');
    if (!isValidAuth(authHeader)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const lastSync = searchParams.get('lastSync');
    const status = searchParams.get('status'); // Фильтр по статусу
    const limit = parseInt(searchParams.get('limit') || '100');

    // Получаем заказы из базы данных
    const orders = await prisma.order.findMany({
      where: {
        ...(status && { status: status as 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' }),
        ...(lastSync && { 
          updatedAt: {
            gte: new Date(lastSync)
          }
        })
      },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Преобразуем в формат для 1С
    const c1Orders: C1Order[] = orders.map(order => ({
      id: order.id.toString(),
      externalId: order.id.toString(), // Используем ID как внешний ID
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone || '',
      customerAddress: order.customerAddress || undefined,
      items: order.items.map(item => ({
        productId: item.product.id.toString(),
        productTitle: item.product.title,
        quantity: item.quantity,
        price: item.price
      })),
      total: order.total,
      status: convertStatus(order.status),
      createdAt: order.createdAt.toISOString(),
      notes: order.notes || ''
    }));

    return NextResponse.json({
      status: 'success',
      data: c1Orders,
      count: c1Orders.length,
      syncTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('1C Orders Export Error:', error);
    return NextResponse.json(
      { error: 'Failed to export orders' },
      { status: 500 }
    );
  }
}

// Обновление статусов заказов из 1C (POST)
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

    const { orders }: { orders: C1Order[] } = await request.json();

    if (!Array.isArray(orders)) {
      return NextResponse.json(
        { error: 'Orders array is required' },
        { status: 400 }
      );
    }

    let updated = 0;
    const errors: string[] = [];

    for (const order of orders) {
      try {
        // Обновление статуса заказа в базе данных
        await prisma.order.update({
          where: { id: parseInt(order.externalId || '0') },
          data: { status: order.status as 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' }
        });
        
        updated++;

      } catch (orderError) {
        console.error(`Error updating order ${order.externalId}:`, orderError);
        errors.push(`Order ${order.externalId}: ${orderError}`);
      }
    }

    return NextResponse.json({
      status: 'success',
      summary: {
        processed: orders.length,
        updated,
        errors: errors.length
      },
      errors: errors.length > 0 ? errors : undefined,
      syncTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('1C Orders Update Error:', error);
    return NextResponse.json(
      { error: 'Failed to update orders' },
      { status: 500 }
    );
  }
}

// Создание нового заказа из 1C (PUT)
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

    const order: C1Order = await request.json();

    // Валидация данных заказа
    if (!order.customerName || !order.customerEmail || !order.items || order.items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid order data' },
        { status: 400 }
      );
    }

    // Создание заказа в базе данных
    const newOrder = await prisma.order.create({
      data: {
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone || '',
        customerAddress: order.customerAddress || '',
        subtotal: order.total,
        total: order.total,
        status: (order.status || 'PENDING') as 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED',
        notes: order.notes || '',
        items: {
          create: order.items.map(item => ({
            productId: parseInt(item.productId),
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: true
      }
    });

    return NextResponse.json({
      status: 'success',
      message: 'Order created successfully',
      orderId: newOrder.id,
      syncTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('1C Order Creation Error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
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
