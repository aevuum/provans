'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('App error boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-3xl font-bold mb-2">Что-то пошло не так</h1>
        <p className="text-gray-600 mb-6">Попробуйте обновить страницу или вернуться позже.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => reset()} className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">Повторить</button>
          <Link href="/" className="bg-[#B8835A] text-white px-4 py-2 rounded hover:bg-[#9d6e47]">На главную</Link>
        </div>
      </div>
    </div>
  );
}
