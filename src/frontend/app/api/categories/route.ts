// app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tryPrisma } from '@/lib/prismaSafe';

export async function GET() {
  try {
    const categories = await tryPrisma(() => prisma.category.findMany({
      where: { isActive: true },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    }), { timeoutMs: 1500, retries: 1 });

    if (!categories) {
      console.warn('[categories] prisma returned undefined, returning empty list');
      return NextResponse.json({ success: true, data: [] });
    }

    return NextResponse.json({ 
      success: true, 
      data: categories 
    });
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка получения категорий' },
      { status: 500 }
    );
  }
}
