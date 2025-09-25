(async ()=>{
  process.env.DATABASE_URL='postgresql://dev:pass@localhost:5432/provance?schema=public';
  process.env.FORCE_REAL_PRISMA='1';
  process.env.PRISMA_REQUIRE_DB='1';
  const { PrismaClient } = await import('../src/node_modules/@prisma/client');
  const { compare } = await import('bcryptjs');
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findFirst({ where: { OR: [{ email: 'admin@admin.com' }, { username: 'admin' }] } });
    console.log('user from DB:', user ? { id: user.id, email: user.email, username: user.username, role: user.role } : null);
    if (!user) process.exit(1);
    const ok = await compare('987654321q', user.password);
    console.log('password valid?', ok);
    process.exit(ok ? 0 : 2);
  } catch (e) { console.error(e); process.exit(3); }
})();
