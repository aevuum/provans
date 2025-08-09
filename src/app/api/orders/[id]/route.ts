import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderStatusUpdate } from '@/lib/email';
import { getServerSession } from 'next-auth/next';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Получение заказа по ID
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Неверный ID заказа' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                image: true,
                images: true,
                price: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      );
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
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении заказа' },
      { status: 500 }
    );
  }
}

// Обновление статуса заказа (только для админа)
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Простая проверка доступа для демо
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== 'Bearer admin-token') {
      // Для демо разрешаем все запросы
      // return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    const { id } = await context.params;
    const orderId = parseInt(id);
    const { status, trackingNumber } = await request.json();

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Неверный ID заказа' },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(trackingNumber && { trackingNumber })
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

    // Отправляем email уведомление об изменении статуса
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

      await sendOrderStatusUpdate(orderEmailData);
    } catch (emailError) {
      console.error('Error sending status update email:', emailError);
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
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении заказа' },
      { status: 500 }
    );
  }
}

// Удаление заказа (только для админа)
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as { role?: string })?.role !== 'admin') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    const { id } = await context.params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Неверный ID заказа' },
        { status: 400 }
      );
    }

    await prisma.order.delete({
      where: { id: orderId }
    });

    return NextResponse.json({
      success: true,
      message: 'Заказ удален'
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении заказа' },
      { status: 500 }
    );
  }
}
