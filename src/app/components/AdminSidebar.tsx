'use client';

import Link from 'next/link';

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-6">
      <nav className="flex flex-col gap-4">
        <Link href="/admin" className="font-semibold text-gray-700 hover:text-blue-600">Товары</Link>
        <Link href="/admin/moderation" className="font-semibold text-gray-700 hover:text-blue-600">🔍 Модерация</Link>
        <Link href="/admin/users" className="font-semibold text-gray-700 hover:text-blue-600">Пользователи</Link>
        {/* Добавь другие разделы по необходимости */}
      </nav>
    </aside>
  );
}