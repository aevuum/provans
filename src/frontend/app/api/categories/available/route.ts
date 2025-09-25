import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tryPrisma } from '@/lib/prismaSafe';

export async function GET() {
  try {
    // Группировка по категориям и подкатегориям среди подтверждённых и в наличии
    const byCat = await tryPrisma(() => (prisma.product.groupBy as any)({
      by: ['category'],
      where: { isConfirmed: true, quantity: { gt: 0 } },
      _count: { _all: true },
    }), { timeoutMs: 1500, retries: 1 }) as Array<{ category: string | null; _count: { _all: number } }> | undefined;

    const bySub = await tryPrisma(() => (prisma.product.groupBy as any)({
      by: ['category', 'subcategory'],
      where: { isConfirmed: true, quantity: { gt: 0 }, NOT: { subcategory: null } },
      _count: { _all: true },
    }), { timeoutMs: 1500, retries: 1 }) as Array<{ category: string | null; subcategory: string | null; _count: { _all: number } }> | undefined;

    // Подтягиваем метаданные категорий (названия/сортировка), если есть
  const categoriesMeta = await tryPrisma(() => prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, name: true, sortOrder: true },
    }), { timeoutMs: 1500, retries: 1 }) as Array<{ slug: string; name: string; sortOrder: number }> | undefined;
  const catMetaMap = new Map((Array.isArray(categoriesMeta) ? categoriesMeta : []).map((c) => [c.slug, c]));
    const categories = (Array.isArray(byCat) ? byCat : [])
      .filter(c => !!c.category && c._count._all > 0)
      .map(c => {
        const slug = String(c.category);
        const meta = catMetaMap.get(slug);
        return {
          slug,
          name: meta?.name || slug,
          count: c._count._all,
          sortOrder: meta?.sortOrder ?? 0,
        };
      })
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    const subcategories = (Array.isArray(bySub) ? bySub : [])
      .filter(s => !!s.category && !!s.subcategory && s._count._all > 0)
      .map(s => ({
        categorySlug: String(s.category),
        slug: String(s.subcategory),
        name: String(s.subcategory),
        count: s._count._all,
      }));

    return NextResponse.json({ categories, subcategories });
  } catch (error) {
    console.error('available categories error:', error);
    return NextResponse.json({ categories: [], subcategories: [] });
  }
}
