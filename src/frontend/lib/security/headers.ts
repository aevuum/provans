import type { NextResponse } from 'next/server';

export function applySecurityHeaders(res: NextResponse) {
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  res.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  res.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  res.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // при необходимости ужесточить с nonce
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '));
  return res;
}
