// app/admin/1c/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaSync, 
  FaCheck, 
  FaTimes, 
  FaExclamationTriangle,
  FaFileExport,
  FaFileImport,
  FaClock,
  FaPlay,
  FaStop
} from 'react-icons/fa';

interface SyncStatus {
  type: 'catalog' | 'orders' | 'stocks' | 'prices';
  enabled: boolean;
  autoSync: boolean;
  lastSync?: string;
  status: 'idle' | 'running' | 'success' | 'error';
  lastError?: string;
}

interface C1ConnectionStatus {
  connected: boolean;
  lastCheck: string;
  error?: string;
}

export default function Admin1CPage() {
  const { data: session, status } = useSession();
  const [connectionStatus, setConnectionStatus] = useState<C1ConnectionStatus>({
    connected: false,
    lastCheck: new Date().toISOString()
  });
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([
    {
      type: 'catalog',
      enabled: true,
      autoSync: false,
      status: 'idle',
      lastSync: undefined
    },
    {
      type: 'orders',
      enabled: true,
      autoSync: true,
      status: 'idle',
      lastSync: undefined
    },
    {
      type: 'stocks',
      enabled: true,
      autoSync: true,
      status: 'idle',
      lastSync: undefined
    },
    {
      type: 'prices',
      enabled: true,
      autoSync: false,
      status: 'idle',
      lastSync: undefined
    }
  ]);
  const [logs, setLogs] = useState<string[]>([]);

  // Проверка подключения к 1C
  const checkConnection = async () => {
    try {
      const response = await fetch('/api/1c', {
        headers: {
          'Authorization': 'Bearer test-key'
        }
      });
      
      const data = await response.json();
      
      setConnectionStatus({
        connected: response.ok,
        lastCheck: new Date().toISOString(),
        error: response.ok ? undefined : data.error
      });
    } catch (_error) {
      setConnectionStatus({
        connected: false,
        lastCheck: new Date().toISOString(),
        error: _error instanceof Error ? _error.message : 'Connection failed'
      });
    }
  };

  // Запуск синхронизации
  const runSync = async (type: string, direction: 'import' | 'export') => {
    const logMessage = `${new Date().toLocaleTimeString()}: Запуск синхронизации ${type} (${direction})`;
    setLogs(prev => [logMessage, ...prev.slice(0, 49)]); // Оставляем последние 50 записей

    // Обновляем статус
    setSyncStatuses(prev => prev.map(status => 
      status.type === type 
        ? { ...status, status: 'running' }
        : status
    ));

    try {
      const endpoint = `/api/1c/${type}`;
      const method = direction === 'import' ? 'POST' : 'GET';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json'
        },
        body: direction === 'import' ? JSON.stringify({ 
          [type]: [] // Пустой массив для тестирования
        }) : undefined
      });

      const result = await response.json();
      
      if (response.ok) {
        const successMessage = `${new Date().toLocaleTimeString()}: Синхронизация ${type} завершена успешно`;
        setLogs(prev => [successMessage, ...prev.slice(0, 49)]);
        
        setSyncStatuses(prev => prev.map(status => 
          status.type === type 
            ? { ...status, status: 'success', lastSync: new Date().toISOString() }
            : status
        ));
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (_error) {
      const errorMessage = `${new Date().toLocaleTimeString()}: Ошибка синхронизации ${type}: ${_error}`;
      setLogs(prev => [errorMessage, ...prev.slice(0, 49)]);
      
      setSyncStatuses(prev => prev.map(status => 
        status.type === type 
          ? { ...status, status: 'error', lastError: _error instanceof Error ? _error.message : String(_error) }
          : status
      ));
    }
  };

  // Переключение автосинхронизации
  const toggleAutoSync = (type: string) => {
    setSyncStatuses(prev => prev.map(status => 
      status.type === type 
        ? { ...status, autoSync: !status.autoSync }
        : status
    ));
  };

  useEffect(() => {
    checkConnection();
  }, []);

  if (status === 'loading') {
    return <div>Загрузка...</div>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session || !(session.user && 'role' in session.user && (session.user as any).role === 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">Нет доступа</h1>
          <Link href="/" className="text-blue-600 hover:underline">На главную</Link>
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
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                ← Назад
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Интеграция с 1C</h1>
                <p className="text-gray-600">Управление синхронизацией данных</p>
              </div>
            </div>
            <button
              onClick={checkConnection}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaSync className="mr-2" />
              Проверить подключение
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Статус подключения */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Статус подключения</h3>
              <div className="flex items-center space-x-3">
                {connectionStatus.connected ? (
                  <>
                    <FaCheck className="text-green-600" />
                    <span className="text-green-800">Подключение установлено</span>
                  </>
                ) : (
                  <>
                    <FaTimes className="text-red-600" />
                    <span className="text-red-800">Ошибка подключения</span>
                  </>
                )}
                <span className="text-gray-500">
                  • Последняя проверка: {new Date(connectionStatus.lastCheck).toLocaleString()}
                </span>
              </div>
              {connectionStatus.error && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 text-sm">{connectionStatus.error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Модули синхронизации */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Модули синхронизации</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {syncStatuses.map((syncStatus) => (
                  <div key={syncStatus.type} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-base font-medium text-gray-900 capitalize">
                          {syncStatus.type === 'catalog' && 'Каталог товаров'}
                          {syncStatus.type === 'orders' && 'Заказы'}
                          {syncStatus.type === 'stocks' && 'Остатки'}
                          {syncStatus.type === 'prices' && 'Цены'}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {syncStatus.status === 'running' && (
                            <div className="flex items-center text-blue-600">
                              <FaClock className="mr-1" />
                              <span className="text-sm">Выполняется</span>
                            </div>
                          )}
                          {syncStatus.status === 'success' && (
                            <div className="flex items-center text-green-600">
                              <FaCheck className="mr-1" />
                              <span className="text-sm">Успешно</span>
                            </div>
                          )}
                          {syncStatus.status === 'error' && (
                            <div className="flex items-center text-red-600">
                              <FaExclamationTriangle className="mr-1" />
                              <span className="text-sm">Ошибка</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleAutoSync(syncStatus.type)}
                          className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${
                            syncStatus.autoSync
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {syncStatus.autoSync ? <FaPlay className="mr-1" /> : <FaStop className="mr-1" />}
                          {syncStatus.autoSync ? 'Авто' : 'Ручной'}
                        </button>
                      </div>
                    </div>

                    {syncStatus.lastSync && (
                      <p className="text-sm text-gray-600 mb-3">
                        Последняя синхронизация: {new Date(syncStatus.lastSync).toLocaleString()}
                      </p>
                    )}

                    {syncStatus.lastError && (
                      <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-800 text-sm">{syncStatus.lastError}</p>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={() => runSync(syncStatus.type, 'export')}
                        disabled={syncStatus.status === 'running'}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        <FaFileExport className="mr-2" />
                        Экспорт
                      </button>
                      <button
                        onClick={() => runSync(syncStatus.type, 'import')}
                        disabled={syncStatus.status === 'running'}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        <FaFileImport className="mr-2" />
                        Импорт
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Логи синхронизации */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Логи операций</h3>
              </div>
              <div className="p-4">
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {logs.length === 0 ? (
                    <p className="text-gray-500 text-sm">Логи операций пока отсутствуют</p>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="text-sm text-gray-700 p-2 bg-gray-50 rounded">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
