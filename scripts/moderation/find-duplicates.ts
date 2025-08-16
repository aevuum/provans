import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Prod = {
  id: number;
  title: string;
  price: number;
  size: string | null;
  barcode: string | null;
  image: string | null;
  images: string[];
  isConfirmed: boolean;
};

function normTitle(t?: string | null) {
  if (!t) return '';
  return t
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[,.;:!?'"()\[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function mainImage(p: Prod) {
  return (p.images?.[0] || p.image || '').trim();
}

async function main() {
  const pending = await prisma.product.findMany({
    where: { isConfirmed: false },
    select: { id: true, title: true, price: true, size: true, barcode: true, image: true, images: true, isConfirmed: true },
    orderBy: { id: 'asc' }
  });
  const confirmed = await prisma.product.findMany({
    where: { isConfirmed: true },
    select: { id: true, title: true, price: true, size: true, barcode: true, image: true, images: true, isConfirmed: true },
    orderBy: { id: 'asc' }
  });

  // Индекс подтвержденных по нормализованным полям
  const indexByTitle = new Map<string, Prod[]>();
  const indexByBarcode = new Map<string, Prod>();

  for (const p of confirmed) {
    const t = normTitle(p.title);
    if (t) indexByTitle.set(t, [...(indexByTitle.get(t) || []), p]);
    if (p.barcode) indexByBarcode.set(p.barcode, p);
  }

  const duplicates: { pending: Prod; reason: string; matchId: number }[] = [];

  for (const p of pending) {
    const t = normTitle(p.title);
    const m1 = t ? indexByTitle.get(t) : undefined;
    if (m1 && m1.length > 0) {
      duplicates.push({ pending: p, reason: 'same title', matchId: m1[0].id });
      continue;
    }
    if (p.barcode && indexByBarcode.has(p.barcode)) {
      duplicates.push({ pending: p, reason: 'same barcode', matchId: indexByBarcode.get(p.barcode)!.id });
      continue;
    }
  }

  console.log(`Pending: ${pending.length}, Confirmed: ${confirmed.length}`);
  console.log(`Duplicates found: ${duplicates.length}`);
  for (const d of duplicates.slice(0, 100)) {
    console.log(`- pending #${d.pending.id} ~ ${d.reason} -> confirmed #${d.matchId} | ${d.pending.title}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
