# 🏺 Прованс Декор - Интернет-магазин декора

Современный интернет-магазин товаров для дома и декора, построенный на Next.js 15 с полной системой управления товарами и заказами.

## 🚀 Технологии

- **Frontend**: Next.js 15, React 19, TypeScript
- **Стилизация**: Tailwind CSS 4, Custom CSS
- **База данных**: PostgreSQL + Prisma ORM
- **Аутентификация**: NextAuth.js (Email/Password + OAuth)
- **Состояние**: Redux Toolkit
- **Изображения**: Next.js Image Optimization

## �� Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/AlexQsQ/provans33.git
cd provans33
```

2. Установите зависимости:
```bash
npm install
```

3. Настройте переменные окружения:
```bash
cp .env.example .env.local
```

4. Настройте базу данных:
```bash
npx prisma db push
npx prisma generate
```

5. Запустите проект:
```bash
npm run dev
```

## 🔧 Конфигурация

### База данных
Создайте PostgreSQL базу данных и обновите `DATABASE_URL` в `.env.local`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/provans"
```

### NextAuth
Настройте переменные для аутентификации:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## 📁 Структура проекта

```
src/
├── app/                    # App Router (Next.js 15)
│   ├── components/         # React компоненты
│   ├── api/               # API endpoints
│   ├── catalog/           # Страницы каталога
│   └── admin/             # Админ панель
├── components/            # Переиспользуемые компоненты
├── lib/                   # Утилиты и конфигурация
├── styles/               # CSS стили
└── types/                # TypeScript типы
```

## 🌟 Функциональность

- ✅ Каталог товаров с фильтрацией и поиском
- ✅ Корзина и избранное
- ✅ Система пользователей и заказов
- ✅ Админ панель для управления товарами
- ✅ Адаптивный дизайн
- ✅ Оптимизация изображений
- ✅ SEO оптимизация

## 🔐 Безопасность

- Хеширование паролей (bcryptjs)
- CSRF защита
- Валидация данных
- Защищенные API endpoints

## 📱 Адаптивность

Проект полностью адаптирован для всех устройств:
- 📱 Мобильные телефоны
- 📱 Планшеты  
- 💻 Десктопы

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Сделайте коммит изменений
4. Отправьте Pull Request

## 📄 Лицензия

Этот проект использует MIT лицензию.
