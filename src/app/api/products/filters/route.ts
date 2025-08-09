// app/api/products/filters/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Диапазон цен
    const priceRange = await prisma.product.aggregate({
      _min: { price: true },
      _max: { price: true }
    });

    return NextResponse.json({
      priceRange: {
        min: priceRange._min.price || 0,
        max: priceRange._max.price || 100000
      }
    });

  } catch (error) {
    console.error('API Filters Error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения фильтров' },
      { status: 500 }
    );
  }
}
