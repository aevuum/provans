# Dockerfile.backend
# STAGE 1: Сборка
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем зависимости
COPY src/backend/package*.json ./

# Устанавливаем ТОЛЬКО production-зависимости
RUN npm ci --only=production && npm cache clean --force

# Копируем исходники
COPY src/backend/ ./

# Генерируем Prisma Client (обязательно!)
RUN npx prisma generate

# Собираем бэкенд
RUN npm run build

# STAGE 2: Финальный образ
FROM node:20-alpine AS runner

WORKDIR /app

# Копируем package.json для установки зависимостей
COPY src/backend/package*.json ./

# Устанавливаем только production-зависимости
RUN npm ci --only=production && npm cache clean --force

# Копируем собранный код (из builder/dist)
COPY --from=builder /app/dist ./dist

# Копируем Prisma-схему и клиент (нужно для миграций и генерации)
COPY --from=builder /app/prisma ./prisma

# Порт по умолчанию для NestJS — 3000 или 3001 (уточни в main.ts)
EXPOSE 3001

# Запуск
CMD ["npm", "run", "start:prod"]