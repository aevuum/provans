'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FaBox, 
  FaCheckCircle, 
  FaClock, 
  FaPlus,
  FaList,
  FaShoppingCart,
  FaWarehouse,
  FaUpload
} from 'react-icons/fa';
import { IconType } from 'react-icons';

interface AdminStats {
  products: {
    total: number;
    confirmed: number;
    pending: number;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (session?.user && 'role' in session.user && (session.user as any).role === 'admin') {
      fetch('/api/admin/stats')
        .then(res => res.json())
        .then(setStats)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (status === 'loading') {
    return <AdminSkeleton />;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session || !(session.user && 'role' in session.user && (session.user as any).role === 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Нет доступа</h1>
          <p className="text-gray-600 mb-4">У вас нет прав администратора</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#B8835A] hover:bg-[#9d6e47]"
          >
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Админ-панель</h1>
              <p className="text-gray-600">Добро пожаловать, {session.user?.email}</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/admin/products/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#B8835A] hover:bg-[#9d6e47]"
              >
                <FaPlus className="mr-2" />
                Добавить товар
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        {loading ? (
          <StatsLoading />
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Всего товаров"
              value={stats.products.total}
              icon={FaBox}
              color="blue"
            />
            <StatCard
              title="Подтвержденные"
              value={stats.products.confirmed}
              icon={FaCheckCircle}
              color="green"
            />
            <StatCard
              title="На модерации"
              value={stats.products.pending}
              icon={FaClock}
              color="yellow"
            />
          </div>
        ) : null}

        {/* Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ActionCard
            title="Модерация товаров"
            description="Подтверждение новых товаров"
            href="/admin/products/moderation"
            icon={FaClock}
            color="orange"
          />
          <ActionCard
            title="Все товары"
            description="Управление каталогом"
            href="/admin/products"
            icon={FaList}
            color="blue"
          />
          <ActionCard
            title="Добавить товар"
            description="Создать новый товар"
            href="/admin/products/new"
            icon={FaPlus}
            color="green"
          />
          <ActionCard
            title="Заказы"
            description="Просмотр и управление заказами"
            href="/admin/orders"
            icon={FaShoppingCart}
            color="purple"
          />
          <ActionCard
            title="Управление остатками"
            description="Склад и количество товаров"
            href="/admin/stock"
            icon={FaWarehouse}
            color="gray"
          />
          <ActionCard
            title="1C Интеграция"
            description="Синхронизация с системой учета"
            href="/admin/1c"
            icon={FaUpload}
            color="gray"
          />
        </div>
      </div>
    </div>
  );
}

// Компоненты карточек статистики
function StatCard({ title, value, icon: Icon, color }: {
  title: string;
  value: string | number;
  icon: IconType;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600 bg-blue-50',
    green: 'bg-green-500 text-green-600 bg-green-50',
    yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
    purple: 'bg-purple-500 text-purple-600 bg-purple-50'
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-md ${colorClasses[color].split(' ')[2]} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${colorClasses[color].split(' ')[1]}`} />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ title, description, href, icon: Icon, color }: {
  title: string;
  description: string;
  href: string;
  icon: IconType;
  color: 'blue' | 'green' | 'gray' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
    green: 'text-green-600 bg-green-50 hover:bg-green-100',
    gray: 'text-gray-600 bg-gray-50 hover:bg-gray-100',
    purple: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
    orange: 'text-orange-600 bg-orange-50 hover:bg-orange-100'
  };

  return (
    <Link href={href} className="block">
      <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-md ${colorClasses[color]} flex items-center justify-center`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 animate-pulse">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
              <div className="ml-5 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
