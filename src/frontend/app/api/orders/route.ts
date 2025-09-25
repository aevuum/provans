import { NextRequest, NextResponse } from 'next/server';
import type { CreateOrderData } from '@/types/index';
import { prisma } from '@/lib/prisma';
import { tryPrisma } from '@/lib/prismaSafe';
import { sendAdminOrderNotification, sendOrderConfirmation } from '@/lib/email';

// Создание нового заказа
export async function POST(request: NextRequest) {
  try {
    const data: CreateOrderData = await request.json();

    // Валидация данных
    if (!data.customerName || !data.customerEmail || !data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: 'Недостаточно данных для создания заказа' },
        { status: 400 }
      );
    }

    // Рассчитываем общую стоимость
    const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Логика расчета доставки
    const shippingCost = subtotal >= 5000 ? 0 : 500; // Бесплатная доставка от 5000₽
    const total = subtotal + shippingCost;

    // Создаем заказ в БД
    const order = await tryPrisma(() => prisma.order.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        subtotal,
        shippingCost,
        total,
        paymentMethod: data.paymentMethod,
        shippingMethod: data.shippingMethod,
        notes: data.notes,
        items: {
          create: data.items.map((item: { productId: number; quantity: number; price: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                image: true,
                images: true
              }
            }
          }
        }
      }
    }), { timeoutMs: 1500, retries: 1 });

    if (!order) {
      console.error('orders.POST: prisma returned falsy value when creating order');
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    // Отправляем email уведомления
    try {
      // Типизированный безопасный объект для обращения к полям
      type OrderResult = {
        orderNumber?: string | number;
        customerName?: string;
        customerEmail?: string;
        items?: Array<{ product?: { title?: string }; quantity?: number; price?: number }>;
        total?: number;
        status?: string;
        createdAt?: Date | string | null;
        updatedAt?: Date | string | null;
      }

      const o = order as OrderResult;

      const orderEmailData = {
        orderNumber: String(o.orderNumber ?? ''),
        customerName: o.customerName ?? '',
        customerEmail: o.customerEmail ?? '',
        items: Array.isArray(o.items)
          ? o.items.map((item) => ({
              title: item?.product?.title ?? '',
              quantity: item?.quantity ?? 0,
              price: item?.price ?? 0
            }))
          : [],
        total: o.total ?? 0,
        status: o.status ?? ''
      };

      // Уведомление клиенту
      await sendOrderConfirmation(orderEmailData);
      
      // Уведомление администратору
      await sendAdminOrderNotification(orderEmailData);
    } catch (emailError) {
      console.error('Error sending email notifications:', emailError);
      // Не прерываем выполнение, если email не отправился
    }

    // Подготовим безопасную версию заказа для ответа
    const safeOrder: Record<string, any> = { ...order } as Record<string, any>;
    const asDateString = (v: unknown) => {
      if (!v) return null;
      if (typeof v === 'string') return v;
      try {
        return (v as Date).toISOString();
      } catch {
        return null;
      }
    };

    safeOrder.createdAt = asDateString(safeOrder.createdAt);
    safeOrder.updatedAt = asDateString(safeOrder.updatedAt);

    return NextResponse.json({
      success: true,
      order: safeOrder
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании заказа' },
      { status: 500 }
    );
  }
}

// Получение всех заказов (для админки)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    
    const skip = (page - 1) * limit;
    
    const where = status ? { status: status as 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED' } : {};

    const orders = await tryPrisma(() => prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                image: true,
                images: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }), { timeoutMs: 1500, retries: 1 }) as any[] | undefined;

    const total = await tryPrisma(() => prisma.order.count({ where }), { timeoutMs: 1500, retries: 1 }) as number | undefined;

    if (orders === undefined || total === undefined) {
      console.warn('orders.GET: DB unreachable or query failed');
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
  orders: orders.map((order: any) => ({
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString()
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении заказов' },
      { status: 500 }
    );
  }
}
