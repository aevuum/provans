import * as bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';

async function main() {
  const email = 'admin@admin.com';
  const username = 'admin';
  // Requested password — stored only in DB (hashed). Keep this secret and rotate if leaked.
  const passwordPlain = '987654321q';
  const passwordHash = await bcrypt.hash(passwordPlain, 12);

  try {
    const user = await prisma.user.upsert({
      where: { username },
      update: { email, password: passwordHash, role: 'admin' },
      create: { username, email, password: passwordHash, role: 'admin' },
    });

    console.log('✅ Admin ensured:', { id: user.id, username: user.username, email: user.email, role: user.role });
    console.log('ℹ️  Admin credentials (plain):', { username, email, password: passwordPlain });
  } catch (err) {
    console.error('❌ Failed to ensure admin:', err instanceof Error ? err.message : err);
    throw err;
  }
}

main()
  .catch(() => process.exit(1))
  .finally(() => prisma.$disconnect());
