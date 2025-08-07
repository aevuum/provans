import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '5'); // Уменьшили лимит по умолчанию

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const searchTerm = query.trim().toLowerCase();

    // Поиск товаров для автодополнения с оптимизацией
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { isConfirmed: true }, // Только подтвержденные товары
          {
            OR: [
              {
                title: {
                  contains: searchTerm,
                  mode: 'insensitive'
                }
              },
              {
                category: {
                  contains: searchTerm,
                  mode: 'insensitive'
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        price: true,
        category: true
      },
      take: limit, // Используем переданный лимит
      orderBy: [
        { title: 'asc' }
      ]
    });

    const suggestions = products.map(product => ({
      id: product.id,
      title: product.title,
      category: product.category || 'Без категории',
      price: product.price
    }));

    return NextResponse.json({ 
      suggestions,
      total: suggestions.length 
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json(
      { error: 'Internal server error', suggestions: [] },
      { status: 500 }
    );
  }
}
