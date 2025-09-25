import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { authOptions } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions as any);
  if (!session || !(session.user && (session.user as any).role === 'admin')) {
    redirect('/');
  }
  return <>{children}</>;
}
