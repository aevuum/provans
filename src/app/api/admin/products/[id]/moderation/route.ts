import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    
    // Проверяем права администратора
    if (!session?.user?.email || session.user.email !== 'admin@provans-decor.ru') {
      return NextResponse.json(
        { error: 'Нет прав доступа' },
        { status: 403 }
      );
    }

    const { action } = await request.json();

    if (action === 'back_to_moderation') {
      // Возвращаем товар на модерацию (isConfirmed = false)
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
