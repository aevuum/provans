import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { applySecurityHeaders } from './lib/security/headers';

// Простая проверка admin: ожидаем флаг роли в cookie (реально нужно интегрировать с NextAuth).
// Здесь только стартовая защита, без раскрытия деталей.
function isAdmin(req: NextRequest): boolean {
  const role = req.cookies.get('role')?.value;
  return role === 'admin';
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ограничиваем доступ к /api/admin и /admin
  if ((pathname.startsWith('/api/admin') || pathname.startsWith('/admin')) && !isAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const res = NextResponse.next();
  return applySecurityHeaders(res);
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
};
