'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'settings'>('profile');
  const router = useRouter();

  // Редирект на главную если не авторизован
  useEffect(() => {
    if (status !== 'loading' && !session) {
      router.push('/');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Компонент будет перенаправлен useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Шапка профиля */}
          <div className="bg-transparent rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-600 to-yellow-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {session.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {session.user?.name || 'Пользователь'}
                </h1>
                <p className="text-gray-600">{session.user?.email}</p>
                {(session.user as any)?.role && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                    {(session.user as any).role === 'admin' ? 'Администратор' : 'Пользователь'}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>

        {/* Навигация по вкладкам */}
          <div className="bg-transparent rounded-lg shadow-sm mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👤 Профиль
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📦 Заказы
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⚙️ Настройки
            </button>
          </div>

          <div className="p-6">
            {/* Вкладка профиля */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Информация о профиле</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Имя
                      </label>
                      <input
                        type="text"
                        value={session.user?.name || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={session.user?.email || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Быстрые действия</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                      href="/catalog/all-category"
                      className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition-colors"
                    >
                      <div className="text-2xl mb-2">🛍️</div>
                      <div className="font-medium text-gray-900">Каталог</div>
                    </Link>
                    <Link
                      href="/cart"
                      className="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center transition-colors"
                    >
                      <div className="text-2xl mb-2">🛒</div>
                      <div className="font-medium text-gray-900">Корзина</div>
                    </Link>
                    <Link
                      href="/favorites"
                      className="bg-red-50 hover:bg-red-100 p-4 rounded-lg text-center transition-colors"
                    >
                      <div className="text-2xl mb-2">❤️</div>
                      <div className="font-medium text-gray-900">Избранное</div>
                    </Link>
                    <Link
                      href="/help"
                      className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center transition-colors"
                    >
                      <div className="text-2xl mb-2">💬</div>
                      <div className="font-medium text-gray-900">Помощь</div>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Вкладка заказов */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">История заказов</h2>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Заказов пока нет</h3>
                  <p className="text-gray-600 mb-4">Оформите свой первый заказ в нашем каталоге</p>
                  <Link
                    href="/catalog/all-category"
                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors inline-block"
                  >
                    Перейти к покупкам
                  </Link>
                </div>
              </div>
            )}

            {/* Вкладка настроек */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Настройки аккаунта</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">Уведомления по email</h3>
                        <p className="text-sm text-gray-600">Получать уведомления о заказах и акциях</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

  {/* Ссылка на админ панель для администраторов */}
  {(session.user as any)?.role === 'admin' && (
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Панель администратора</h3>
            <p className="mb-4">У вас есть права администратора</p>
            <Link
              href="/admin"
              className="bg-white text-purple-600 px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors inline-block"
            >
              Перейти в админ панель
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
