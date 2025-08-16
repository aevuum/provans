import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Группировка по категориям и подкатегориям среди подтверждённых и в наличии
    const byCat = await prisma.product.groupBy({
      by: ['category'],
      where: { isConfirmed: true, quantity: { gt: 0 } },
      _count: { _all: true },
    });

    const bySub = await prisma.product.groupBy({
      by: ['category', 'subcategory'],
      where: { isConfirmed: true, quantity: { gt: 0 }, NOT: { subcategory: null } },
      _count: { _all: true },
    });

    // Подтягиваем метаданные категорий (названия/сортировка), если есть
    const categoriesMeta = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, name: true, sortOrder: true },
    });
    const catMetaMap = new Map(categoriesMeta.map(c => [c.slug, c]));

    const categories = byCat
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

    const subcategories = bySub
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
