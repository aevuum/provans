// app/api/payments/webhook/route.ts
// Обработка вебхуков от ЮKassa

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tryPrisma } from '@/lib/prismaSafe';
import { z } from 'zod';
import { rateLimit } from '@/lib/security/rateLimit';
import crypto from 'crypto';

const WebhookSchema = z.object({
  type: z.string(),
  event: z.string(),
  object: z.object({
    id: z.string(),
    status: z.string(),
    amount: z.object({ value: z.string(), currency: z.string() }),
    metadata: z.object({ orderId: z.string() }).passthrough().optional(),
    paid: z.boolean().optional()
  })
});

function verifySignature(rawBody: string, req: NextRequest): boolean {
  // YooKassa webhook подписи по умолчанию нет в SDK; если вы настроите кастомный HMAC header, добавьте сюда проверку.
  const secret = process.env.YOOKASSA_WEBHOOK_SECRET;
  if (!secret) return true; // если секрет не задан — пропускаем (но логируем)
  const signatureHeader = req.headers.get('x-webhook-signature');
  if (!signatureHeader) return false;
  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signatureHeader));
}

export async function POST(request: NextRequest) {
  const ipHeader = request.headers.get('x-forwarded-for');
  const ip = ipHeader ? ipHeader.split(',')[0].trim() : 'unknown';
  if (!rateLimit(`webhook:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Too many webhook requests' }, { status: 429 });
  }

  let rawBody = '';
  try {
    rawBody = await request.text(); // читаем тело как текст для подписи
    const json = JSON.parse(rawBody || '{}');
    const parsed = WebhookSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
    }

    if (!verifySignature(rawBody, request)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const webhook = parsed.data;

    if (webhook.type !== 'notification') {
      return NextResponse.json({ success: true, ignored: true });
    }

    const payment = webhook.object;
    const orderIdStr = payment.metadata?.orderId;
    const orderId = orderIdStr ? parseInt(orderIdStr) : NaN;

    if (!orderIdStr || isNaN(orderId)) {
      console.error('Invalid or missing order ID in webhook metadata:', orderIdStr);
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    // Найдём PaymentOrder
    const paymentOrder = await tryPrisma(() => prisma.paymentOrder.findFirst({ where: { orderId: String(orderId) } }));
    if (paymentOrder === undefined) {
      console.error('DB unavailable during webhook processing');
      return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
    }

    // Безопасная локальная типизация для paymentOrder — prisma может вернуть plain {}
    type PaymentOrderRecord = { id?: number | string };
    const po = paymentOrder as PaymentOrderRecord | null | undefined;

    // Обработка событий
    if (webhook.event === 'payment.succeeded' && payment.status === 'succeeded') {
      await Promise.all([
        tryPrisma(() => prisma.order.update({ where: { id: orderId }, data: { status: 'CONFIRMED', notes: `Оплачен (payment ${payment.id})` } })),
        po && po.id ? tryPrisma(() => prisma.paymentOrder.update({ where: { id: po.id as any }, data: { status: 'succeeded' } })) : Promise.resolve()
      ]);
      return NextResponse.json({ success: true });
    }

    if (webhook.event === 'payment.canceled' || payment.status === 'canceled') {
      await Promise.all([
        tryPrisma(() => prisma.order.update({ where: { id: orderId }, data: { status: 'CANCELLED', notes: `Отменён (payment ${payment.id})` } })),
        po && po.id ? tryPrisma(() => prisma.paymentOrder.update({ where: { id: po.id as any }, data: { status: 'canceled' } })) : Promise.resolve()
      ]);
      return NextResponse.json({ success: true });
    }

    // Игнорируем прочие события
    return NextResponse.json({ success: true, ignored: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Также поддерживаем GET для проверки работоспособности
export async function GET() {
  return NextResponse.json({ 
    message: 'ЮKassa webhook endpoint is working',
    timestamp: new Date().toISOString()
  });
}
