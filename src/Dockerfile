
FROM node:18-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY prisma ./prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
CMD ["npm", "start"]