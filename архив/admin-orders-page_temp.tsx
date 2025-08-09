'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminOrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin');
      return;
    }
  }, [session, router]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session || (session.user as any)?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Управление заказами</h1>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Страница в разработке
            </h2>
            <p className="text-gray-600 mb-4">
              Функционал управления заказами будет добавлен в ближайшее время
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
