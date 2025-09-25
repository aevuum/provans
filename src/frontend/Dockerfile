### Stage 1: deps (production + dev needed just to build) ###
FROM node:20-alpine AS deps
WORKDIR /app
ENV CI=1

COPY src/frontend/package*.json ./
RUN npm ci --include=dev

### Stage 2: builder (Next build with standalone output) ###
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY src/frontend ./src/frontend
COPY src/types ./src/types
COPY src/lib ./src/lib
COPY src/prisma ./src/prisma

WORKDIR /app/src/frontend

# Generate Prisma client (fail fast if что-то не так с путём схемы)
RUN npx prisma generate

# Build Next (standalone enabled in next.config.js)
RUN npm run build

### Stage 3: prune production dependencies only ###
FROM node:20-alpine AS proddeps
WORKDIR /app
COPY src/frontend/package*.json ./
RUN npm ci --omit=dev

### Stage 4: runtime (minimal) ###
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy production node_modules
COPY --from=proddeps /app/node_modules ./node_modules

# Copy standalone server + static assets
COPY --from=builder /app/src/frontend/.next/standalone ./
COPY --from=builder /app/src/frontend/.next/static ./.next/static
COPY --from=builder /app/src/frontend/public ./public

# Healthcheck (optional curl existence)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/_next/static/BUILD_ID').catch(()=>process.exit(1))" || exit 1

EXPOSE 3000
CMD ["node", "server.js"]