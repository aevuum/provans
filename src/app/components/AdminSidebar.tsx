'use client';

import Link from 'next/link';

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-6">
      <nav className="flex flex-col gap-4">
        <Link href="/admin" className="font-semibold text-gray-700 hover:text-blue-600">📦 Товары</Link>
        <Link href="/admin/moderation" className="font-semibold text-gray-700 hover:text-blue-600">🏷️ Категоризация</Link>
        <Link href="/admin/products/moderation" className="font-semibold text-gray-700 hover:text-blue-600">🔍 Модерация</Link>
        <Link href="/admin/orders" className="font-semibold text-gray-700 hover:text-blue-600">📋 Заказы</Link>
        <Link href="/admin/stock" className="font-semibold text-gray-700 hover:text-blue-600">📊 Остатки</Link>
        <Link href="/admin/1c" className="font-semibold text-gray-700 hover:text-blue-600">🔗 1C Интеграция</Link>
        {/* Добавь другие разделы по необходимости */}
      </nav>
    </aside>
  );
}