// app/api/products/[id]/confirm/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id: idString } = await context.params;
  const id = Number(idString);
  await prisma.product.update({
    where: { id },
    data: { isConfirmed: true }
  });
  return NextResponse.json({ ok: true });
}