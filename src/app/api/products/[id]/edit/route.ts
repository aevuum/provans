// app/api/products/[id]/edit/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const productId = Number(id);
    const data = await req.json();
    
    await prisma.product.update({
      where: { id: productId },
      data: {
        title: data.title,
        price: Number(data.price),
        size: data.size,
        comment: data.comment,
        images: data.images,
        // другие поля по необходимости
      }
    });
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
