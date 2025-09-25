import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getAdminSession } from '@/lib/authUtils';
import { prisma } from '@/lib/prisma';
import { tryPrisma } from '@/lib/prismaSafe';
// Local prepared shape for products to be created/upserted.
// We avoid relying on Prisma.*Input types because generated types can
// differ between Prisma versions and cause build-time type errors.
interface PreparedProduct {
  title: string;
  price: number;
  size?: string | null;
  barcode?: string | null;
  comment?: string | null;
  image?: string | null;
  images?: string[];
  isConfirmed?: boolean;
  discount?: number;
  category?: string | null;
  quantity?: number;
  reserved?: number;
}

interface JsonProduct {
  title?: string;
  image_path?: string;
  price?: number;
  discount?: number;
  size?: string | null;
  category?: string | null;
  barcode?: string | null;
  comment?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Нет доступа' }, { status: 403 });
    }

    const mode = req.nextUrl.searchParams.get('mode') || 'replace'; // replace | upsert

    // Поддерживаем импорт из archive/products.json, если корневой файл отсутствует или пуст
    const primary = path.join(process.cwd(), 'products.json');
    const fallback = path.join(process.cwd(), 'archive', 'products.json');
    let raw: string | null = null;
    try {
      raw = await fs.readFile(primary, 'utf-8');
      if (!raw || raw.trim().length === 0) raw = null;
    } catch {}
    if (!raw) {
      raw = await fs.readFile(fallback, 'utf-8');
    }
    const parsed = JSON.parse(raw) as { products?: JsonProduct[] } | JsonProduct[];

    const products: JsonProduct[] = Array.isArray(parsed)
      ? parsed.filter(Boolean)
      : Array.isArray(parsed.products)
        ? parsed.products.filter(Boolean)
        : [];

    if (products.length === 0) {
      return NextResponse.json({ success: false, error: 'В файле products.json нет данных' }, { status: 400 });
    }

  // Формируем валидные данные для создания с обязательными title и price
  const toCreate: PreparedProduct[] = [];
    for (const p of products) {
      const title = p.title?.trim();
      const price = typeof p.price === 'number' ? Math.round(p.price) : undefined;
      if (!title || price === undefined) continue;

  const data: PreparedProduct = {
        title,
        price,
    size: p.size?.toString().trim() || null,
    barcode: p.barcode?.toString().trim() || null,
    comment: p.comment?.toString().trim() || null,
    image: p.image_path?.toString().trim() || null,
    images: p.image_path ? [p.image_path.toString().trim()] : [],
        isConfirmed: true,
        discount: typeof p.discount === 'number' ? p.discount : 0,
        category: p.category?.toString().trim() || null,
        quantity: 1,
        reserved: 0,
      };
      toCreate.push(data);
    }

    if (toCreate.length === 0) {
      return NextResponse.json({ success: false, error: 'Нет валидных товаров для импорта' }, { status: 400 });
    }

    let created = 0;
    let upserted = 0;

    if (mode === 'replace') {
      const txRes = await tryPrisma(() => prisma.$transaction([
        prisma.orderItem.deleteMany({}), // очищаем зависимые записи
        prisma.order.deleteMany({}),
        prisma.product.deleteMany({}),
      ]), { timeoutMs: 5000, retries: 0 });

      if (txRes === undefined) {
        return NextResponse.json({ success: false, error: 'DB unavailable' }, { status: 503 });
      }

      // createMany не поддерживает массивы в некоторых драйверах, поэтому создадим по одному в транзакции
      const createdRes = await tryPrisma(() => prisma.$transaction(
        toCreate.map((data) => prisma.product.create({ data }))
      ), { timeoutMs: 30_000, retries: 0 });

      if (createdRes === undefined) {
        return NextResponse.json({ success: false, error: 'DB unavailable during create' }, { status: 503 });
      }
      created = toCreate.length;
    } else {
      // upsert по уникальному ключу. У нас уникальный только barcode; если его нет — используем (title, price) как эвристику
      for (const data of toCreate) {
        if (data.barcode) {
          const up = await tryPrisma(() => prisma.product.upsert({
            where: { barcode: data.barcode as string },
            create: data,
            update: {
              price: data.price,
              size: data.size ?? null,
              comment: data.comment ?? null,
              image: data.image ?? null,
              images: data.images ?? [],
              discount: data.discount ?? 0,
              category: data.category ?? null,
              isConfirmed: true,
            },
          }), { timeoutMs: 5000, retries: 0 });
          if (up === undefined) return NextResponse.json({ success: false, error: 'DB unavailable during upsert' }, { status: 503 });
          upserted++;
        } else {
          // ищем по title+price
          const existing = await tryPrisma(() => prisma.product.findFirst({ where: { title: data.title, price: data.price } }), { timeoutMs: 4000, retries: 0 }) as { id: number } | null | undefined;
          if (existing === undefined) return NextResponse.json({ success: false, error: 'DB unavailable during lookup' }, { status: 503 });
          if (existing) {
            const up2 = await tryPrisma(() => prisma.product.update({ where: { id: (existing as { id: number }).id }, data: {
                size: data.size ?? null,
                comment: data.comment ?? null,
                image: data.image ?? null,
                images: data.images ?? [],
                discount: data.discount ?? 0,
                category: data.category ?? null,
                isConfirmed: true,
              } }), { timeoutMs: 5000, retries: 0 });
            if (up2 === undefined) return NextResponse.json({ success: false, error: 'DB unavailable during update' }, { status: 503 });
          } else {
            const createdOne = await tryPrisma(() => prisma.product.create({ data }), { timeoutMs: 5000, retries: 0 });
            if (createdOne === undefined) return NextResponse.json({ success: false, error: 'DB unavailable during create' }, { status: 503 });
            created++;
          }
        }
      }
    }

    return NextResponse.json({ success: true, data: { created, upserted, totalInput: toCreate.length, mode } });
  } catch (error) {
    console.error('Import from JSON error:', error);
    return NextResponse.json({ success: false, error: 'Ошибка импорта из JSON' }, { status: 500 });
  }
}
