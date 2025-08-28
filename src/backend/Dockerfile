FROM node:18-alpine AS base
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package*.json ./
COPY --from=base /app/dist ./dist
COPY --from=base /app/nest-cli.json ./

EXPOSE 3001
CMD ["node", "dist/main.js"]