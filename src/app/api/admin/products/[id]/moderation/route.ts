import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAdminSession } from '../../../../../../lib/authUtils';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAdminSession();

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Нет прав доступа' },
        { status: 403 }
      );
    }

    const { action } = await request.json();

    if (action === 'back_to_moderation') {
      const updatedProduct = await prisma.product.update({
        where: { id: parseInt(id) },
        data: { isConfirmed: false }
      });

      return NextResponse.json({
        success: true,
        message: 'Товар отправлен обратно на модерацию',
        product: updatedProduct
      });
    }

    return NextResponse.json(
      { error: 'Неизвестное действие' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Moderation error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
