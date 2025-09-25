import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/authUtils';
import { prisma } from '@/lib/prisma';
import { tryPrisma } from '@/lib/prismaSafe';


export async function GET() {
  try {
    // Проверяем авторизацию
    const session = await getAdminSession()
    if (!session) {
      console.log('❌ No session in stats API');
      return NextResponse.json({ error: 'Нет сессии' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      console.log('❌ Not admin role in stats API:', session.user?.role);
      return NextResponse.json({ error: 'Нет прав администратора' }, { status: 403 });
    }
    const [
      totalProducts,
      confirmedProducts,
      pendingProducts
    ] = await Promise.all([
      // Общее количество продуктов
      tryPrisma(() => prisma.product.count()),

      // Количество подтвержденных продуктов
      tryPrisma(() => prisma.product.count({ where: { isConfirmed: true } })),

      // Количество на модерации
      tryPrisma(() => prisma.product.count({ where: { isConfirmed: false } }))
    ]);

    if ([totalProducts, confirmedProducts, pendingProducts].some((x) => typeof x !== 'number')) {
      return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
    }

    return NextResponse.json({
      products: {
        total: totalProducts,
        confirmed: confirmedProducts,
        pending: pendingProducts
      }
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
