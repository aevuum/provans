const bcrypt = require('bcryptjs');
const { PrismaClient } = require('../../node_modules/@prisma/client');

async function run() {
  const prisma = new PrismaClient();
  try {
  const email = 'admin@provance-decor.ru';
    const username = 'admin';
    const passwordHash = await bcrypt.hash('admin123', 12);

    const user = await prisma.user.upsert({
      where: { username },
      update: { email, password: passwordHash, role: 'admin' },
      create: { username, email, password: passwordHash, role: 'admin' },
    });

    console.log('ADMIN OK', { id: user.id, username: user.username, email: user.email, role: user.role });
  } finally {
    await prisma.$disconnect();
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
