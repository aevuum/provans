// app/api/payments/webhook/route.ts
// Обработка вебхуков от ЮKassa

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface YooKassaWebhook {
  type: string;
  event: string;
  object: {
    id: string;
    status: string;
    amount: {
      value: string;
      currency: string;
    };
    metadata: {
      orderId: string;
    };
    paid: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const webhook: YooKassaWebhook = await request.json();
    
    // Проверяем тип события
    if (webhook.type !== 'notification' || webhook.event !== 'payment.succeeded') {
      return NextResponse.json({ success: true });
    }

    const payment = webhook.object;
    const orderId = parseInt(payment.metadata.orderId);

    if (isNaN(orderId)) {
      console.error('Invalid order ID in webhook:', payment.metadata.orderId);
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    // Проверяем, что платеж успешен
    if (payment.status === 'succeeded' && payment.paid) {
      // Обновляем статус заказа
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CONFIRMED',
          notes: `Платеж подтвержден. ID платежа: ${payment.id}`
        }
      });

      console.log(`Order ${orderId} payment confirmed: ${payment.id}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Также поддерживаем GET для проверки работоспособности
export async function GET() {
  return NextResponse.json({ 
    message: 'ЮKassa webhook endpoint is working',
    timestamp: new Date().toISOString()
  });
}
