// app/api/payments/create/route.ts
// Создание платежа через ЮKassa

import { NextRequest, NextResponse } from 'next/server';

interface PaymentData {
  amount: number;
  orderId: string;
  customerEmail: string;
  returnUrl: string;
}

interface YooKassaPayment {
  id: string;
  status: string;
  amount: {
    value: string;
    currency: string;
  };
  confirmation: {
    type: string;
    confirmation_url: string;
  };
  metadata: {
    orderId: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { amount, orderId, customerEmail }: Omit<PaymentData, 'returnUrl'> = await request.json();

    // Валидация данных
    if (!amount || !orderId || !customerEmail) {
      return NextResponse.json(
        { error: 'Недостаточно данных для создания платежа' },
        { status: 400 }
      );
    }

    // Для демо версии - создаем заглушку платежа
    // TODO: Интеграция с реальным API ЮKassa
    const mockPayment: YooKassaPayment = {
      id: `payment_${Date.now()}`,
      status: 'pending',
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB'
      },
      confirmation: {
        type: 'redirect',
        confirmation_url: `${process.env.NEXTAUTH_URL}/checkout/success?order=${orderId}&mock=true`
      },
      metadata: {
        orderId
      }
    };

    /* 
    Реальная интеграция с ЮKassa будет выглядеть так:

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': `order_${orderId}_${Date.now()}`
      },
      body: JSON.stringify({
        amount: {
          value: amount.toFixed(2),
          currency: 'RUB'
        },
        confirmation: {
          type: 'redirect',
          return_url: returnUrl
        },
        capture: true,
        description: `Заказ №${orderId}`,
        metadata: {
          orderId
        },
        receipt: {
          customer: {
            email: customerEmail
          },
          items: [
            {
              description: `Заказ №${orderId}`,
              quantity: '1.00',
              amount: {
                value: amount.toFixed(2),
                currency: 'RUB'
              },
              vat_code: 1
            }
          ]
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ЮKassa API error: ${response.status}`);
    }

    const payment = await response.json();
    */

    return NextResponse.json({
      success: true,
      payment: mockPayment
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании платежа' },
      { status: 500 }
    );
  }
}

// Получение информации о платеже
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const paymentId = url.searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID платежа не указан' },
        { status: 400 }
      );
    }

    // Для демо версии - возвращаем заглушку
    const mockPayment = {
      id: paymentId,
      status: 'succeeded',
      amount: {
        value: '1000.00',
        currency: 'RUB'
      },
      metadata: {
        orderId: 'test-order'
      }
    };

    /*
    Реальная интеграция:

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    const response = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`ЮKassa API error: ${response.status}`);
    }

    const payment = await response.json();
    */

    return NextResponse.json({
      success: true,
      payment: mockPayment
    });

  } catch (error) {
    console.error('Payment fetch error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении информации о платеже' },
      { status: 500 }
    );
  }
}
