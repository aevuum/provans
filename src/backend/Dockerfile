FROM node:18-alpine AS base
# Work inside backend subfolder so npm uses backend package.json
WORKDIR /app/src/backend

# Install backend dependencies
COPY src/backend/package*.json ./
RUN npm install

# Copy backend sources
COPY src/backend ./
# Copy shared Prisma schema (located at repo src/prisma)
COPY src/prisma /app/src/prisma

# Ensure no stale generated client is present
RUN rm -rf node_modules/.prisma || true

# Install prisma and @prisma/client to allow generation inside container
RUN npm install prisma@6.16.1 @prisma/client@6.15.0 --no-audit --no-fund || true

# Generate Prisma Client using the shared schema (inside container platform)
RUN npx prisma generate --schema /app/src/prisma/schema.prisma || true

# Build NestJS backend
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app/src/backend

COPY --from=base /app/src/backend/node_modules ./node_modules
COPY --from=base /app/src/backend/package*.json ./
COPY --from=base /app/src/backend/dist ./dist
COPY --from=base /app/src/backend/nest-cli.json ./
COPY --from=base /app/src/backend/node_modules/.prisma /app/src/backend/node_modules/.prisma
COPY --from=base /app/src/prisma /app/src/prisma

EXPOSE 3001
CMD ["node", "dist/main.js"]