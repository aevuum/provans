// app/api/products/[id]/edit/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tryPrisma } from '@/lib/prismaSafe';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const productId = Number(id);
    const data = await req.json();
    
    const updated = await tryPrisma(() => prisma.product.update({
      where: { id: productId },
      data: {
        title: data.title,
        price: Number(data.price),
        size: data.size,
        comment: data.comment,
        images: data.images,
        // другие поля по необходимости
      }
    }), { timeoutMs: 1500, retries: 1 });

    if (updated === undefined) {
      console.error('products/[id]/edit: DB unreachable when updating product');
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
