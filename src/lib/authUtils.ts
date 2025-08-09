import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

export interface AuthSession {
  user?: {
    role?: string;
  };
}

export async function getAdminSession(): Promise<AuthSession | null> {
  return (await getServerSession(authOptions)) as AuthSession | null;
}
