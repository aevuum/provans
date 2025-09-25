'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AdminImportPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'admin';

  const handleImport = async (mode: 'replace' | 'upsert') => {
    try {
      setLoading(true);
      setResult(null);
      const res = await fetch(`/api/admin/products/import-json?mode=${mode}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult(`Импорт завершен: создано ${data.data.created}, обновлено ${data.data.upserted || 0}`);
      } else {
        setResult(`Ошибка: ${data.error || 'неизвестная'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      setResult(null);
      const res = await fetch('/api/admin/products/sync-json', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult(`Экспортировано в JSON: ${data.data.count} товаров`);
      } else {
        setResult(`Ошибка: ${data.error || 'неизвестная'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Нет доступа</h1>
          <p className="text-gray-600 mb-4">У вас нет прав администратора</p>
          <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#B8835A] hover:bg-[#9d6e47]">На главную</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Импорт/Экспорт товаров JSON</h1>
      <div className="space-y-4">
        <div className="flex gap-3">
          <button onClick={() => handleImport('replace')} disabled={loading} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60">Заменить все товарами из JSON</button>
          <button onClick={() => handleImport('upsert')} disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">Обновить/добавить из JSON</button>
        </div>
        <div>
          <button onClick={handleSync} disabled={loading} className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-60">Экспортировать текущие товары в JSON</button>
        </div>
        {result && (
          <div className="mt-4 p-3 rounded bg-gray-50 text-gray-800 border">{result}</div>
        )}
      </div>
    </div>
  );
}
