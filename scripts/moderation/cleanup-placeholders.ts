import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const pending = await prisma.product.findMany({ where: { isConfirmed: false } });
  let changed = 0;
  for (const p of pending) {
    const images = Array.isArray(p.images) ? p.images : [];
    // если стоит фон или пустая ссылка, убираем и оставляем null
    const clean = images.filter(u => !!u && !/\/fon(?:c|b)?\.png$/i.test(u) && !/\/placeholder\.jpg$/i.test(u));
    const image = p.image && !/\/fon(?:c|b)?\.png$/i.test(p.image) && !/\/placeholder\.jpg$/i.test(p.image) ? p.image : null;
    if (clean.length !== images.length || image !== p.image) {
      await prisma.product.update({ where: { id: p.id }, data: { images: clean, image } });
      changed++;
    }
  }
  console.log('Cleaned pending with placeholders:', changed);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
