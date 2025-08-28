import { NextResponse } from 'next/server';

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: Record<string, unknown>;
}

export function createApiError(
  message: string, 
  statusCode: number = 500, 
  code?: string,
  details?: Record<string, unknown>
): ApiError {
  return {
    message,
    statusCode,
    code,
    details
  };
}

export function createApiResponse<T>(
  data?: T, 
  meta?: Record<string, unknown>
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta
  });
}

export function createErrorResponse(
  error: ApiError | string, 
  statusCode?: number
): NextResponse<ApiResponse> {
  const apiError: ApiError = typeof error === 'string' 
    ? createApiError(error, statusCode || 500)
    : error;

  return NextResponse.json(
    {
      success: false,
      error: apiError
    }, 
    { status: apiError.statusCode }
  );
}

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error);

  if (error instanceof Error) {
    // Обработка известных ошибок
    if (error.message.includes('Unauthorized') || error.message.includes('Нет доступа')) {
      return createErrorResponse(createApiError('Нет доступа', 403, 'UNAUTHORIZED'));
    }

    if (error.message.includes('Not found') || error.message.includes('не найден')) {
      return createErrorResponse(createApiError('Ресурс не найден', 404, 'NOT_FOUND'));
    }

    // Ошибки валидации
    if (error.message.includes('validation') || error.message.includes('валидация')) {
      return createErrorResponse(createApiError(error.message, 400, 'VALIDATION_ERROR'));
    }

    // Общая ошибка
    return createErrorResponse(createApiError(error.message, 500, 'INTERNAL_ERROR'));
  }

  // Неизвестная ошибка
  return createErrorResponse(createApiError('Внутренняя ошибка сервера', 500, 'UNKNOWN_ERROR'));
}

// Утилита для логирования ошибок
export function logError(context: string, error: unknown, additionalData?: Record<string, unknown>): void {
  const errorInfo = {
    context,
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    ...additionalData
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('🔥 API Error:', errorInfo);
  } else {
    // В продакшене можно отправлять в систему мониторинга
    console.error(JSON.stringify(errorInfo));
  }
}

interface AuthUser {
  id: string;
  role: string;
  email?: string;
  name?: string;
}

// Middleware для проверки авторизации
export async function requireAuth(request: Request): Promise<{ user: AuthUser } | NextResponse> {
  try {
    // Здесь должна быть логика проверки токена/сессии
    // Это упрощенная версия
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return createErrorResponse(createApiError('Требуется авторизация', 401, 'AUTH_REQUIRED'));
    }

    // Возвращаем пользователя (в реальном приложении нужно декодировать токен)
    return { user: { id: '1', role: 'user' } };
  } catch {
    return createErrorResponse(createApiError('Ошибка авторизации', 401, 'AUTH_ERROR'));
  }
}

// Middleware для проверки роли администратора
export async function requireAdmin(request: Request): Promise<{ user: AuthUser } | NextResponse> {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  if (authResult.user.role !== 'admin') {
    return createErrorResponse(createApiError('Требуются права администратора', 403, 'ADMIN_REQUIRED'));
  }

  return authResult;
}

// Утилита для валидации данных
export function validateRequired(data: Record<string, unknown>, fields: string[]): string[] {
  const errors: string[] = [];
  
  for (const field of fields) {
    if (!data[field] || (typeof data[field] === 'string' && (data[field] as string).trim() === '')) {
      errors.push(`Поле "${field}" обязательно для заполнения`);
    }
  }
  
  return errors;
}

// Утилита для пагинации
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  return {
    page: parseInt(searchParams.get('page') || '1'),
    limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100), // Максимум 100 элементов
    sort: searchParams.get('sort') || 'id',
    order: (searchParams.get('order') as 'asc' | 'desc') || 'desc'
  };
}
