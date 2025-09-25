import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    const reset = await prisma.resetToken.findUnique({ where: { token } });
    if (!reset || reset.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const passwordHash = await hash(password, 12);

    await prisma.user.update({ where: { id: reset.userId }, data: { password: passwordHash } });
    await prisma.resetToken.delete({ where: { token } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Reset password error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
