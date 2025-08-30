import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // Валидация данных
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Все поля обязательны для заполнения' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Пароль должен содержать минимум 6 символов' },
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

    // Проверяем, существует ли пользователь (используем username как уникальный идентификатор)
    const existingUser = await prisma.user.findUnique({
      where: { username: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создаем пользователя (используем email как username)
    const user = await prisma.user.create({
      data: {
        username: email.toLowerCase(), // используем email как username
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'user'
      }
    });

    return NextResponse.json(
      { 
        message: 'Пользователь успешно зарегистрирован',
        user: {
          id: user.id,
          name: user.username,
          email: user.email
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Ошибка сервера при регистрации' },
      { status: 500 }
    );
  }
}
