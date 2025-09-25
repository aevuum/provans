import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

function genPassword() {
  return crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
}

async function main() {
  const newPassword = genPassword();
  const hash = await bcrypt.hash(newPassword, 12);

  const res = await prisma.user.updateMany({
    where: { username: 'admin' },
    data: { password: hash },
  });

  if (res.count === 0) {
    // create admin if not exists
    await prisma.user.create({
      data: { username: 'admin', email: 'admin@provance-decor.ru', password: hash, role: 'admin' },
    });
    console.log('Admin created with new password');
  } else {
    console.log(`Updated password for ${res.count} admin(s)`);
  }

  console.log('NEW_ADMIN_PASSWORD:', newPassword);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
