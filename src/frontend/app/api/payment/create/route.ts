// app/api/payment/create/route.ts
// Alias совместимости для старого хука useCreatePayment (singular "payment").
// Дополнительно: создание чернового заказа (Order) перед вызовом YooKassa.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { YooCheckout, ICreatePayment } from '@a2seven/yoo-checkout';
import { z } from 'zod';
import { rateLimit } from '@/lib/security/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ItemSchema = z.object({
  productId: z.number().int().positive().optional(),
  title: z.string().min(1).max(160),
  price: z.number().positive().max(1_000_000),
  quantity: z.number().int().positive().max(999).default(1)
});

const BodySchema = z.object({
  value: z.number().positive().max(5_000_000),
  description: z.string().min(1).max(200),
  items: z.array(ItemSchema).max(50).optional(),
  returnUrl: z.string().url().optional(),
  customer: z.object({
    name: z.string().min(1).max(120).optional(),
    email: z.string().email().optional(),
    phone: z.string().max(32).optional(),
    address: z.string().max(240).optional(),
  }).optional()
});

function toMoneyString(value: number): string {
  // YooKassa ожидает строку с 2 знаками после запятой
  return value.toFixed(2);
}

function getBaseUrl(req: Request) {
  const url = new URL(req.url);
  const hdr = (name: string) => (req as any).headers?.get?.(name) as string | null;
  const proto = hdr('x-forwarded-proto') || url.protocol.replace(':', '') || 'https';
  const host = hdr('x-forwarded-host') || hdr('host') || url.host;
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit (IP based simplistic)
  const ipHeader = req.headers.get('x-forwarded-for');
  const ip = ipHeader ? ipHeader.split(',')[0].trim() : 'unknown';
    if (!rateLimit(`payment:${ip}`, 5, 60_000)) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const raw = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    const body = parsed.data;

    const shopId = process.env.YOOKASSA_SHOP_ID || process.env.YOOKASA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY || process.env.YOOKASA_SECRET_KEY;

    if (!shopId || !secretKey) {
      return NextResponse.json({ success: false, error: 'Отсутствуют ключи YooKassa' }, { status: 500 });
    }

    // Идемпотентность: если за последние 5 минут уже есть PaymentOrder с тем же описанием и суммой в статусе ожидания — возвращаем его
    const existingRecent = await prisma.paymentOrder.findFirst({
      where: {
        amount: body.value,
        description: body.description,
        createdAt: { gt: new Date(Date.now() - 5 * 60 * 1000) },
        OR: [ { status: 'pending' }, { status: 'waiting_for_capture' }, { status: 'pending' } ]
      },
      orderBy: { createdAt: 'desc' }
    });

    if (existingRecent) {
      // Попытаемся найти Order по orderId (строковое хранение)
      const existingOrderId = parseInt(existingRecent.orderId);
      return NextResponse.json({
        success: true,
        reused: true,
        data: {
          id: `reused-${existingRecent.id}`,
          status: existingRecent.status,
          orderId: existingOrderId,
          amount: { value: body.value.toFixed(2), currency: 'RUB' }
        }
      });
    }

    // 1. Создаём черновой Order
    const order = await prisma.order.create({
      data: {
        customerName: body.customer?.name || 'Guest',
        customerEmail: body.customer?.email || 'unknown@example.com',
        customerPhone: body.customer?.phone,
        customerAddress: body.customer?.address,
        subtotal: body.value,
        total: body.value,
        paymentMethod: 'yookassa',
        shippingMethod: 'standard',
        status: 'PENDING'
      }
    });

    if (body.items && body.items.length > 0) {
      await prisma.orderItem.createMany({
        data: body.items.map((it): { orderId: number; productId: number; quantity: number; price: number } => ({
          orderId: order.id,
          productId: it.productId ?? 0,
            quantity: it.quantity ?? 1,
          price: it.price,
        }))
      });
    }

    // TODO: при необходимости создать OrderItem[] если передан массив items

    const checkout = new YooCheckout({ shopId, secretKey });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || getBaseUrl(req);
    const returnUrl = body.returnUrl || `${baseUrl}/checkout/success`;

    const payload: ICreatePayment = {
      amount: { value: toMoneyString(body.value), currency: 'RUB' },
      payment_method_data: { type: 'bank_card' },
      confirmation: { type: 'redirect', return_url: returnUrl },
      description: body.description?.slice(0, 127),
      metadata: { orderId: String(order.id) },
    } as ICreatePayment;

    const idempotenceKey = uuidv4();
    const payment = await checkout.createPayment(payload, idempotenceKey);

    // Persist PaymentOrder (idempotency reference)
    await prisma.paymentOrder.create({
      data: {
        orderId: String(order.id),
        amount: body.value,
        status: payment.status,
        description: body.description
      }
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      data: {
        id: payment.id,
        status: payment.status,
        confirmation: payment.confirmation,
        orderId: order.id,
        amount: payment.amount,
      }
    });
  } catch (error) {
    console.error('Payment alias error:', error);
    const msg = error instanceof Error ? error.message : 'Ошибка создания платежа';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
