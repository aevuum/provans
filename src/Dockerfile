FROM node:18-alpine AS base
WORKDIR /app

# Устанавливаем зависимости фронтенда
COPY src/frontend/package*.json ./
RUN npm ci --omit=dev

# Копируем исходники фронтенда
COPY src/frontend ./

# Сборка
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package*.json ./

ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]