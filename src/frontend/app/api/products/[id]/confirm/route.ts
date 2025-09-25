// app/api/products/[id]/confirm/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tryPrisma } from '@/lib/prismaSafe';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id: idString } = await context.params;
  const id = Number(idString);
  const res = await tryPrisma(() => prisma.product.update({ where: { id }, data: { isConfirmed: true } }), { timeoutMs: 1500, retries: 1 });
  if (res === undefined) {
    console.error('products/[id]/confirm: DB unreachable when confirming product');
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}