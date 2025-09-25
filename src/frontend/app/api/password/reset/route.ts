import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tryPrisma } from '@/lib/prismaSafe';
import { hash } from 'bcryptjs';

// Unified password reset endpoint. Accepts either { token, password } or { token, newPassword }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token: string | undefined = body.token;
    const pwd: string | undefined = body.newPassword || body.password;

    if (!token || !pwd) {
      return NextResponse.json({ error: 'Token and new password required' }, { status: 400 });
    }
    if (pwd.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 chars' }, { status: 400 });
    }

    const reset = await tryPrisma(() => prisma.resetToken.findUnique({ where: { token } }), { timeoutMs: 1500, retries: 1 });
    if (reset === undefined) {
      console.warn('password/reset: DB unreachable or query failed');
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    if (!reset) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    // Безопасно приводим тип результата (prisma может вернуть plain {})
    type ResetRecord = { expiresAt?: Date | string | null; userId?: number | string };
    const r = reset as ResetRecord;

    // Нормализуем expiresAt в Date и проверим валидность
    const toDate = (v: unknown): Date | null => {
      if (!v) return null;
      if (v instanceof Date) return v;
      if (typeof v === 'string' || typeof v === 'number') {
        const d = new Date(v as any);
        return isNaN(d.getTime()) ? null : d;
      }
      return null;
    };

    const expires = toDate(r.expiresAt);
    if (!expires || expires < new Date()) {
      // best-effort delete; ignore if it fails
      await tryPrisma(() => prisma.resetToken.delete({ where: { token } }), { timeoutMs: 1500, retries: 1 }).catch(() => {});
      return NextResponse.json({ error: 'Token expired' }, { status: 400 });
    }

    const passwordHash = await hash(pwd, 12);

    // Безопасно извлекаем userId из нормализованного объекта
    const userId = r.userId;
    if (!userId) {
      console.error('password/reset: reset token has no userId');
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const updated = await tryPrisma(() => prisma.user.update({ where: { id: userId as any }, data: { password: passwordHash } }), { timeoutMs: 1500, retries: 1 });
    if (updated === undefined) {
      console.error('password/reset: failed to update user password (DB unreachable)');
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    // best-effort cleanup of reset token
    await tryPrisma(() => prisma.resetToken.delete({ where: { token } }), { timeoutMs: 1500, retries: 1 }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('password/reset error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
