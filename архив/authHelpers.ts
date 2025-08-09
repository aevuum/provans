// lib/authHelpers.ts
import { Session } from 'next-auth';

interface AuthUser {
  role?: string;
}

export function isAdmin(session: Session | null): boolean {
  if (!session?.user) return false;
  const user = session.user as AuthUser;
  return user.role === 'admin';
}

export function requireAdmin(session: Session | null): boolean {
  return isAdmin(session);
}

// Утилита для логирования только в development
export function devLog(message: string, ...args: unknown[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...args);
  }
}

// Утилита для логирования ошибок
export function logError(message: string, error: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(message, error);
  } else {
    // В продакшене отправляем в сервис мониторинга
    // TODO: Интегрировать с Sentry или другим сервисом
  }
}
