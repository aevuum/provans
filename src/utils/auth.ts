// utils/auth.ts
import { Session } from 'next-auth';

export function isAdmin(session: Session | null): boolean {
  return !!(session?.user && 'role' in session.user && session.user.role === 'admin');
}

export function hasRole(session: Session | null, role: string): boolean {
  return !!(session?.user && 'role' in session.user && session.user.role === role);
}
