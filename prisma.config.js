/**
 * Central Prisma config to avoid deprecated package.json#prisma field
 * and unify schema path usage across sub-packages.
 * Keep schema relative to repo root for simpler referencing.
 */
/** @type {import('prisma').Config} */
module.exports = {
  // Каноническая схема перенесена в src/prisma/schema.prisma
  // Это устраняет дублирование и ошибки при Docker build (в образ копируется только src/prisma)
  schema: 'src/prisma/schema.prisma'
};
