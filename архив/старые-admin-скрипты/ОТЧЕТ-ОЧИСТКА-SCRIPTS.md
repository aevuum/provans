# ОТЧЕТ: Очистка дублирующихся скриптов администрирования

## ✅ Проблема решена

### Было (9 файлов):
```
scripts/
├── check-admin-password.ts      ❌ ДУБЛЬ
├── check-all-admins.ts          ❌ ДУБЛЬ  
├── check-old-admin.ts           ❌ ДУБЛЬ
├── create-simple-admin.ts       ❌ ДУБЛЬ
├── create.admin.ts              ✅ ОСТАВЛЕН
├── import-products.ts           ✅ ОСТАВЛЕН
├── list-all-users.ts            ❌ ДУБЛЬ
├── reset-admin-password.ts      ❌ ДУБЛЬ
└── update-admin-email.ts        ❌ ДУБЛЬ
```

### Стало (3 файла):
```
scripts/
├── admin-manager.ts      🆕 УНИВЕРСАЛЬНЫЙ МЕНЕДЖЕР
├── create.admin.ts       ✅ БАЗОВОЕ СОЗДАНИЕ АДМИНА
└── import-products.ts    ✅ ИМПОРТ ТОВАРОВ
```

## 🔧 Новый admin-manager.ts

### Возможности:
- ✅ Создание администраторов
- ✅ Список всех администраторов  
- ✅ Проверка паролей
- ✅ Обновление паролей
- ✅ Обновление email

### Использование:
```bash
# Показать всех админов
npx tsx scripts/admin-manager.ts list

# Проверить пароль
npx tsx scripts/admin-manager.ts check admin@provans.ru admin123

# Создать нового админа
npx tsx scripts/admin-manager.ts create newadmin admin@new.ru password123

# Обновить пароль
npx tsx scripts/admin-manager.ts update-password admin@provans.ru newpassword

# Обновить email
npx tsx scripts/admin-manager.ts update-email admin newemail@provans.ru
```

## 📦 Архивированные файлы

Перемещены в `архив/старые-admin-скрипты/`:
- check-admin-password.ts
- check-all-admins.ts
- check-old-admin.ts
- create-simple-admin.ts
- list-all-users.ts
- reset-admin-password.ts
- update-admin-email.ts

## 📊 Результат

✅ **Уменьшение с 9 до 3 файлов** (66% сокращение)
✅ **Устранение дублирования кода**
✅ **Единая точка управления администраторами**
✅ **Лучшая организация и поддержка**
✅ **CLI интерфейс для удобства**

## 🎯 Актуальные данные для входа

### Email: `admin@provans.ru`
### Пароль: `admin123`

Проверено через: `npx tsx scripts/admin-manager.ts check admin@provans.ru admin123`
