import { prisma } from '@/lib/prisma';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://example.com';

  // Базовые страницы
  const routes = [
    '',
    '/catalog/all',
    '/catalog/new',
    '/discount',
    '/search',
    '/help',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // Категории из БД (если есть)
  let categoryEntries: Array<{ url: string; lastModified: string; changeFrequency: 'daily'; priority: number }> = [];
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });
    categoryEntries = categories.map((c) => ({
      url: `${baseUrl}/catalog/${encodeURIComponent(c.slug)}`,
      lastModified: c.updatedAt.toISOString(),
      changeFrequency: 'daily',
      priority: 0.6,
    }));
  } catch {
    // ignore if no categories table
  }

  // Продукты (только подтвержденные)
  let productEntries: Array<{ url: string; lastModified: string; changeFrequency: 'weekly'; priority: number }> = [];
  try {
    const products = await prisma.product.findMany({
      where: { isConfirmed: true },
      select: { id: true, updatedAt: true },
      take: 5000, 
      orderBy: { updatedAt: 'desc' },
    });
    productEntries = products.map((p) => ({
      url: `${baseUrl}/products/${p.id}`,
      lastModified: p.updatedAt.toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));
  } catch {
    // ignore if prisma not available
  }

  return [...routes, ...categoryEntries, ...productEntries];
}
