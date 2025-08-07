// app/api/admin/products/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';

// POST - массовые операции
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as { role?: string })?.role !== 'admin') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    const body = await req.json();
    const { action, productIds } = body;

    if (!action || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Действие и список ID обязательны' },
        { status: 400 }
      );
    }

    // Валидируем ID
    const validIds = productIds.filter(id => Number.isInteger(id) && id > 0);
    if (validIds.length === 0) {
      return NextResponse.json(
        { error: 'Нет валидных ID продуктов' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'confirm':
        result = await prisma.product.updateMany({
          where: { id: { in: validIds } },
          data: { isConfirmed: true }
        });
        break;

      case 'unconfirm':
        result = await prisma.product.updateMany({
          where: { id: { in: validIds } },
          data: { isConfirmed: false }
        });
        break;

      case 'delete':
        result = await prisma.product.deleteMany({
          where: { id: { in: validIds } }
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Неизвестное действие' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Действие '${action}' выполнено для ${result.count} продуктов`,
      affected: result.count
    });

  } catch (error) {
    console.error('Bulk operation error:', error);
    return NextResponse.json(
      { error: 'Ошибка выполнения массовой операции' },
      { status: 500 }
    );
  }
}
