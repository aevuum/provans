(async ()=>{
  process.env.DATABASE_URL='postgresql://dev:pass@localhost:5432/provance?schema=public';
  process.env.PRISMA_REQUIRE_DB='1';
  process.env.FORCE_REAL_PRISMA='1';
  const authModule = await import('../src/frontend/lib/auth');
  console.log('authModule keys:', Object.keys(authModule));
  const authOptions = (authModule as any).authOptions;
  console.log('has authOptions?', !!authOptions);
  const providers = authOptions.providers;
  console.log('providers length', providers.length);
  const credentialsProvider = providers.find((p: any) => p.name === 'credentials');
  console.log('found provider?', !!credentialsProvider);
  const res = await credentialsProvider.authorize({ email: 'admin@admin.com', password: '987654321q' });
  console.log('authorize result:', res);
})().catch(e => { console.error(e); process.exit(1) });
