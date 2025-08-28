import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { Prisma } from '@prisma/client';
import { getAdminSession } from '../../../../../lib/authUtils';
import { prisma } from '../../../../../lib/prisma';

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
    const toCreate: Prisma.ProductCreateInput[] = [];
    for (const p of products) {
      const title = p.title?.trim();
      const price = typeof p.price === 'number' ? Math.round(p.price) : undefined;
      if (!title || price === undefined) continue;

      const data: Prisma.ProductCreateInput = {
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
      await prisma.$transaction([
        prisma.orderItem.deleteMany({}), // очищаем зависимые записи
        prisma.order.deleteMany({}),
        prisma.product.deleteMany({}),
      ]);

      // createMany не поддерживает массивы в некоторых драйверах, поэтому создадим по одному в транзакции
      await prisma.$transaction(
        toCreate.map((data) => prisma.product.create({ data }))
      );
      created = toCreate.length;
    } else {
      // upsert по уникальному ключу. У нас уникальный только barcode; если его нет — используем (title, price) как эвристику
      for (const data of toCreate) {
        if (data.barcode) {
          await prisma.product.upsert({
            where: { barcode: data.barcode },
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
          });
          upserted++;
        } else {
          // ищем по title+price
          const existing = await prisma.product.findFirst({
            where: { title: data.title, price: data.price },
          });
          if (existing) {
            await prisma.product.update({
              where: { id: existing.id },
              data: {
                size: data.size ?? null,
                comment: data.comment ?? null,
                image: data.image ?? null,
                images: data.images ?? [],
                discount: data.discount ?? 0,
                category: data.category ?? null,
                isConfirmed: true,
              },
            });
          } else {
            await prisma.product.create({ data });
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
