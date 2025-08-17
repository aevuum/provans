import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normTitle(t?: string | null) {
  return (t || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[,.;:!?'"()\[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  const apply = process.argv.includes('--apply');

  const pending = await prisma.product.findMany({ where: { isConfirmed: false } });
  const confirmed = await prisma.product.findMany({ where: { isConfirmed: true } });

  // Индексы по подтвержденным
  const byBarcode = new Set(confirmed.map(p => (p.barcode || '').trim()).filter(Boolean));
  const byTitlePrice = new Set(confirmed.map(p => `${normTitle(p.title)}|${p.price}`));

  const toDelete: number[] = [];

  for (const p of pending) {
    const barcode = (p.barcode || '').trim();
    const tKey = `${normTitle(p.title)}|${p.price}`;
    if ((barcode && byBarcode.has(barcode)) || byTitlePrice.has(tKey)) {
      toDelete.push(p.id);
    }
  }

  console.log(`Candidates to delete (pending duplicates of confirmed): ${toDelete.length}`);
  if (toDelete.length > 0) {
    console.log(toDelete.slice(0, 100).join(', '));
  }

  if (apply && toDelete.length) {
    let deleted = 0;
    for (const id of toDelete) {
      try {
        await prisma.product.delete({ where: { id } });
        deleted++;
      } catch {}
    }
    console.log('Deleted:', deleted);
  } else {
    console.log('Dry run. Use --apply to delete.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
