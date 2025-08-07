/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from 'next-auth/next';

export interface AuthSession {
  user?: {
    role?: string;
  };
}

export async function getAdminSession(): Promise<AuthSession | null> {
  return await getServerSession() as AuthSession | null;
}
