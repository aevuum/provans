// app/api/products/filters/route.ts
import { NextResponse } from 'next/server';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { prisma } from '@/lib/prisma';
import { tryPrisma } from '@/lib/prismaSafe';

export async function GET() {
  try {
    // Диапазон цен — явно указываем тип агрегата чтобы TypeScript понять структуру
    const priceRange = await tryPrisma<{
      _min: { price: number | null } | null;
      _max: { price: number | null } | null;
    }>(() => prisma.product.aggregate({
      _min: { price: true },
      _max: { price: true }
    }));

    if (!priceRange) {
      throw new Error('DB unavailable');
    }

    // Defensive extraction: Prisma aggregate may return null for _min/_max
    const minVal = priceRange._min && typeof priceRange._min.price === 'number' ? priceRange._min.price : null;
    const maxVal = priceRange._max && typeof priceRange._max.price === 'number' ? priceRange._max.price : null;
    return NextResponse.json({
      priceRange: {
        min: minVal ?? 0,
        max: maxVal ?? 100000
      }
    });

  } catch (error) {
    console.error('API Filters Error (DB). Fallback to file-based:', error);
    // Фоллбек: читаем new-product.json и считаем min/max
    try {
  const filePath = path.join(process.cwd(), 'new-product.json');
      const content = await fs.readFile(filePath, 'utf8');
      const parsed: unknown = JSON.parse(content);
      const arrRaw: unknown[] = Array.isArray(parsed)
        ? parsed as unknown[]
        : (parsed && typeof parsed === 'object' && Array.isArray((parsed as { products?: unknown }).products))
          ? (parsed as { products: unknown[] }).products
          : [];
      let min = Infinity;
      let max = -Infinity;
      for (const rec of arrRaw) {
        const priceVal = (rec as Record<string, unknown> | null | undefined)?.price;
        const price = typeof priceVal === 'number'
          ? priceVal
          : (typeof priceVal === 'string' ? parseFloat(priceVal) : NaN);
        if (!Number.isFinite(price) || price <= 0) continue;
        if (price < min) min = price;
        if (price > max) max = price;
      }
      if (!Number.isFinite(min) || !Number.isFinite(max)) {
        return NextResponse.json({ priceRange: { min: 0, max: 100000 } });
      }
      return NextResponse.json({ priceRange: { min, max } });
    } catch (e) {
      console.error('API Filters Fallback Error:', e);
      return NextResponse.json(
        { error: 'Ошибка получения фильтров' },
        { status: 500 }
      );
    }
  }
}
