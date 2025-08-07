// lib/1c-config.ts
// Конфигурация интеграции с 1С

export interface C1Config {
  apiKey: string;
  basicAuth?: string;
  baseUrl: string;
  syncInterval: number; // в минутах
  batchSize: number;
  retryAttempts: number;
  timeout: number; // в миллисекундах
}

export interface C1SyncSettings {
  catalog: {
    enabled: boolean;
    autoSync: boolean;
    syncInterval: number;
    lastSync?: string;
  };
  orders: {
    enabled: boolean;
    autoSync: boolean;
    syncInterval: number;
    lastSync?: string;
  };
  stocks: {
    enabled: boolean;
    autoSync: boolean;
    syncInterval: number;
    lastSync?: string;
  };
  prices: {
    enabled: boolean;
    autoSync: boolean;
    syncInterval: number;
    lastSync?: string;
  };
}

// Конфигурация по умолчанию
export const defaultC1Config: C1Config = {
  apiKey: process.env.NEXT_1C_API_KEY || '',
  basicAuth: process.env.NEXT_1C_BASIC_AUTH,
  baseUrl: process.env.NEXT_1C_BASE_URL || 'http://localhost:8080/api',
  syncInterval: 60, // 1 час
  batchSize: 100,
  retryAttempts: 3,
  timeout: 30000 // 30 секунд
};

export const defaultSyncSettings: C1SyncSettings = {
  catalog: {
    enabled: true,
    autoSync: false, // Ручная синхронизация по умолчанию
    syncInterval: 60 // 1 час
  },
  orders: {
    enabled: true,
    autoSync: true,
    syncInterval: 15 // 15 минут
  },
  stocks: {
    enabled: true,
    autoSync: true,
    syncInterval: 30 // 30 минут
  },
  prices: {
    enabled: true,
    autoSync: false,
    syncInterval: 120 // 2 часа
  }
};

// Типы для логирования синхронизации
export interface C1SyncLog {
  id: string;
  type: 'catalog' | 'orders' | 'stocks' | 'prices';
  direction: 'import' | 'export';
  status: 'success' | 'error' | 'partial';
  startTime: Date;
  endTime?: Date;
  recordsProcessed: number;
  recordsSuccess: number;
  recordsError: number;
  errors?: string[];
  summary?: Record<string, unknown>;
}

// Утилиты для работы с 1C
export class C1Integration {
  private config: C1Config;

  constructor(config: C1Config = defaultC1Config) {
    this.config = config;
  }

  // Проверка подключения к 1C
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/test`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  // Отправка данных в 1C
  async sendTo1C(endpoint: string, data: unknown): Promise<Response> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(this.config.timeout)
    });

    if (!response.ok) {
      throw new Error(`1C API Error: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  // Получение данных из 1C
  async getFrom1C(endpoint: string, params?: Record<string, string>): Promise<Response> {
    const url = new URL(`${this.config.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(this.config.timeout)
    });

    if (!response.ok) {
      throw new Error(`1C API Error: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  // Создание лога синхронизации
  createSyncLog(
    type: C1SyncLog['type'],
    direction: C1SyncLog['direction']
  ): C1SyncLog {
    return {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      direction,
      status: 'success',
      startTime: new Date(),
      recordsProcessed: 0,
      recordsSuccess: 0,
      recordsError: 0,
      errors: []
    };
  }

  // Завершение лога синхронизации
  finishSyncLog(log: C1SyncLog, status: C1SyncLog['status'], summary?: Record<string, unknown>): C1SyncLog {
    return {
      ...log,
      status,
      endTime: new Date(),
      summary
    };
  }
}

// Экспорт экземпляра для использования
export const c1Integration = new C1Integration();
