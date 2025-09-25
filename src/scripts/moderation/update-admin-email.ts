import { PrismaClient } from '../../node_modules/@prisma/client';

// Скрипт безопасно обновляет старый admin email на новый
// Запуск: node --loader ts-node/esm src/scripts/moderation/update-admin-email.ts

const prisma = new PrismaClient();

async function main() {
  const oldEmails = ['admin@provans-decor.ru', 'admin@admin-provance.ru'];
  const newEmail = 'admin@provance-decor.ru';

  for (const old of oldEmails) {
    const res = await prisma.user.updateMany({
      where: { email: old },
      data: { email: newEmail },
    });
    console.log(`Updated ${res.count} user(s) from ${old} to ${newEmail}`);
  }

  // Обновим также любые места в других таблицах, где хранится admin email напрямую
  // Например, если есть таблица Settings или SiteConfig с полем contactEmail
  try {
      // Если есть таблица Setting с ключом admin_email, обновим её значение
      await prisma.$executeRawUnsafe(
        `UPDATE "Setting" SET "value" = $1 WHERE "key" = 'admin_email' AND "value" IN (${oldEmails.map(() => '?').join(',')})`,
        newEmail,
        ...oldEmails
      );
  } catch {
    // безопасно игнорируем если таблицы/поля нет
  }
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
