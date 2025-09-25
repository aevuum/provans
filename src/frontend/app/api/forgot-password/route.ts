import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email: string | undefined = (body?.email || '').toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({ where: { email } });

    // Чтобы не раскрывать, есть ли такой пользователь, возвращаем 200 в любом случае
    if (!user) {
      return NextResponse.json({ message: 'If the email exists, a reset link will be sent' });
    }

    // Очистить старые токены пользователя
    await prisma.resetToken.deleteMany({ where: { userId: user.id } });

    // Создать токен
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 час
    await prisma.resetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    const baseUrl = process.env.APP_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const resetLink = `${baseUrl.replace(/\/$/, '')}/auth/reset-password?token=${token}`;

    const port = parseInt(process.env.SMTP_PORT || '587');
    const secure = port === 465; // 465 — TLS, 587 — STARTTLS
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      } : undefined,
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Восстановление пароля — Provans Decor',
      html: `
        <h2>Восстановление пароля</h2>
        <p>Для смены пароля перейдите по ссылке:</p>
        <p><a href="${resetLink}" target="_blank" rel="noreferrer noopener">Сбросить пароль</a></p>
        <p>Ссылка действительна 1 час. Если вы не запрашивали смену пароля — проигнорируйте это письмо.</p>
      `,
    });

    return NextResponse.json({ message: 'If the email exists, a reset link will be sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
