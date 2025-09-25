# Dockerfile.frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY src/frontend/package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY src/frontend/ .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
EXPOSE 3000
CMD ["npm", "start"]