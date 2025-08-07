// app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

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
