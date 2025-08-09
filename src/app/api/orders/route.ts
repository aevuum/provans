import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmation, sendAdminOrderNotification } from '@/lib/email';
import { CreateOrderData } from '@/types/order';

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
    const order = await prisma.order.create({
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
          create: data.items.map(item => ({
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
    });

    // Отправляем email уведомления
    try {
      const orderEmailData = {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: order.items.map(item => ({
          title: item.product.title,
          quantity: item.quantity,
          price: item.price
        })),
        total: order.total,
        status: order.status
      };

      // Уведомление клиенту
      await sendOrderConfirmation(orderEmailData);
      
      // Уведомление администратору
      await sendAdminOrderNotification(orderEmailData);
    } catch (emailError) {
      console.error('Error sending email notifications:', emailError);
      // Не прерываем выполнение, если email не отправился
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString()
      }
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

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
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
      }),
      prisma.order.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
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
