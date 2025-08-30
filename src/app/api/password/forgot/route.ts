import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email обязателен для заполнения' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Некорректный email адрес' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { username: email.toLowerCase() }
    });

    if (!user) {
      // Возвращаем успешный ответ даже если пользователь не найден (безопасность)
      return NextResponse.json(
        { message: 'Если пользователь с таким email существует, инструкции отправлены' },
        { status: 200 }
      );
    }

    // Генерируем токен для сброса пароля
    const resetToken = crypto.randomBytes(32).toString('hex');

    // В реальном приложении здесь должна быть логика отправки email
    // Пока что просто логируем токен
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset link: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`);

    // В базе данных нужно будет добавить поля для токена сброса пароля
    // Пока что возвращаем успешный ответ
    return NextResponse.json(
      { message: 'Инструкции по восстановлению пароля отправлены на ваш email' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Ошибка сервера при восстановлении пароля' },
      { status: 500 }
    );
  }
}
