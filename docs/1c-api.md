# API Интеграции с 1C

## Обзор

API предоставляет endpoints для синхронизации данных между интернет-магазином Provans Decor и системой 1C.

### Базовый URL
```
https://your-domain.com/api/1c
```

### Аутентификация

Все запросы должны содержать заголовок авторизации:

```http
Authorization: Bearer YOUR_API_KEY
```

или

```http
Authorization: Basic base64(username:password)
```

## Endpoints

### 1. Общая информация

**GET** `/api/1c`

Возвращает информацию о доступных endpoints.

**Ответ:**
```json
{
  "status": "ok",
  "message": "1C Integration API",
  "version": "1.0",
  "endpoints": {
    "catalog": "/api/1c/catalog",
    "orders": "/api/1c/orders", 
    "stocks": "/api/1c/stocks"
  }
}
```

### 2. Синхронизация каталога

#### Экспорт товаров из интернет-магазина

**GET** `/api/1c/catalog`

**Параметры:**
- `lastSync` (опционально) - дата последней синхронизации в ISO формате
- `limit` (опционально) - максимальное количество товаров (по умолчанию 1000)

**Пример запроса:**
```http
GET /api/1c/catalog?lastSync=2025-01-01T00:00:00Z&limit=500
Authorization: Bearer YOUR_API_KEY
```

**Ответ:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "123",
      "title": "Ваза декоративная",
      "price": 2500,
      "material": "Керамика",
      "country": "Италия",
      "barcode": "1234567890123",
      "size": "25x15 см",
      "comment": "Ручная работа",
      "images": ["image1.jpg", "image2.jpg"],
      "isConfirmed": true,
      "updatedAt": "2025-01-01T12:00:00Z"
    }
  ],
  "count": 1,
  "syncTime": "2025-01-01T12:30:00Z"
}
```

#### Импорт товаров в интернет-магазин

**POST** `/api/1c/catalog`

**Тело запроса:**
```json
{
  "products": [
    {
      "id": "1C_ID_123",
      "title": "Новый товар",
      "price": 3000,
      "material": "Дерево",
      "country": "Россия",
      "barcode": "9876543210987",
      "size": "30x20 см",
      "comment": "Эксклюзивная модель",
      "images": ["new_image1.jpg"]
    }
  ]
}
```

**Ответ:**
```json
{
  "status": "success",
  "summary": {
    "processed": 1,
    "created": 1,
    "updated": 0,
    "errors": 0
  },
  "syncTime": "2025-01-01T12:30:00Z"
}
```

### 3. Синхронизация заказов

#### Экспорт заказов в 1C

**GET** `/api/1c/orders`

**Параметры:**
- `lastSync` (опционально) - дата последней синхронизации
- `status` (опционально) - фильтр по статусу заказа
- `limit` (опционально) - максимальное количество заказов

**Ответ:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "ORDER_123",
      "externalId": "WEB-2025-001",
      "customerName": "Иван Петров",
      "customerEmail": "ivan@example.com",
      "customerPhone": "+7 (999) 123-45-67",
      "customerAddress": "Москва, ул. Тестовая, д. 1",
      "items": [
        {
          "productId": "123",
          "productTitle": "Ваза декоративная",
          "quantity": 2,
          "price": 2500
        }
      ],
      "total": 5000,
      "status": "new",
      "createdAt": "2025-01-01T10:00:00Z",
      "notes": "Доставка курьером"
    }
  ],
  "count": 1,
  "syncTime": "2025-01-01T12:30:00Z"
}
```

#### Обновление статусов заказов

**POST** `/api/1c/orders`

**Тело запроса:**
```json
{
  "orders": [
    {
      "externalId": "WEB-2025-001",
      "status": "processing"
    }
  ]
}
```

#### Создание заказа из 1C

**PUT** `/api/1c/orders`

**Тело запроса:**
```json
{
  "externalId": "1C-2025-001",
  "customerName": "Мария Сидорова",
  "customerEmail": "maria@example.com",
  "customerPhone": "+7 (999) 987-65-43",
  "items": [
    {
      "productId": "456",
      "quantity": 1,
      "price": 3500
    }
  ],
  "total": 3500,
  "status": "processing"
}
```

### 4. Синхронизация остатков

#### Экспорт остатков

**GET** `/api/1c/stocks`

**Параметры:**
- `warehouse` (опционально) - код склада
- `productIds` (опционально) - список ID товаров через запятую

**Ответ:**
```json
{
  "status": "success",
  "data": [
    {
      "productId": "123",
      "barcode": "1234567890123",
      "quantity": 15,
      "reserved": 3,
      "warehouse": "main",
      "lastUpdated": "2025-01-01T12:00:00Z"
    }
  ],
  "count": 1,
  "warehouse": "main",
  "syncTime": "2025-01-01T12:30:00Z"
}
```

#### Обновление остатков

**POST** `/api/1c/stocks`

**Тело запроса:**
```json
{
  "stocks": [
    {
      "productId": "123",
      "barcode": "1234567890123",
      "quantity": 20,
      "reserved": 5,
      "warehouse": "main"
    }
  ]
}
```

#### Обновление цен

**PUT** `/api/1c/stocks`

**Тело запроса:**
```json
{
  "prices": [
    {
      "productId": "123",
      "price": 2700,
      "barcode": "1234567890123"
    }
  ]
}
```

## Коды ошибок

- `400` - Неверные параметры запроса
- `401` - Неавторизованный доступ
- `404` - Ресурс не найден
- `500` - Внутренняя ошибка сервера

## Примеры использования

### Пример синхронизации каталога (1C → Интернет-магазин)

```http
POST /api/1c/catalog
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "products": [
    {
      "id": "ITEM_001",
      "title": "Подсвечник керамический",
      "price": 1200,
      "material": "Керамика",
      "country": "Россия",
      "barcode": "2000000000001",
      "size": "10x10x8 см",
      "images": ["candle_holder_1.jpg"]
    }
  ]
}
```

### Пример получения новых заказов

```http
GET /api/1c/orders?status=new&lastSync=2025-01-01T00:00:00Z
Authorization: Bearer YOUR_API_KEY
```

### Пример обновления остатков

```http
POST /api/1c/stocks
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "stocks": [
    {
      "productId": "ITEM_001",
      "quantity": 50,
      "reserved": 2
    }
  ]
}
```

## Переменные окружения

Для настройки интеграции необходимо установить следующие переменные:

```env
NEXT_1C_API_KEY=your_secret_api_key_here
NEXT_1C_BASIC_AUTH=base64_encoded_credentials
NEXT_1C_BASE_URL=http://your-1c-server:8080/api
```

## Рекомендации

1. **Частота синхронизации:**
   - Каталог: 1-2 раза в день
   - Заказы: каждые 15-30 минут
   - Остатки: каждые 30-60 минут
   - Цены: 1-2 раза в день

2. **Обработка ошибок:**
   - Используйте retry механизм для временных сбоев
   - Логируйте все операции синхронизации
   - Проверяйте статус ответов API

3. **Безопасность:**
   - Используйте HTTPS для всех запросов
   - Храните API ключи в безопасном месте
   - Регулярно обновляйте учетные данные
