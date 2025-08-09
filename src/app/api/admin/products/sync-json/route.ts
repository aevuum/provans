import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/authUtils';
import { prisma } from '@/lib/prisma';
import fs from 'node:fs/promises';
import path from 'node:path';

// Синхронизация БД -> products.json (экспорт текущих подтвержденных товаров)
export async function POST() {
  try {
    const session = await getAdminSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Нет доступа' }, { status: 403 });
    }

    const products = await prisma.product.findMany({ where: { isConfirmed: true } });

    const payload = {
      products: products.map((p) => ({
        title: p.title,
        image_path: p.image || (p.images?.[0] ?? null),
        price: p.price,
        discount: p.discount ?? 0,
        size: p.size ?? null,
        category: p.category ?? null,
        barcode: p.barcode ?? null,
        comment: p.comment ?? null,
      })),
    };

    const filePath = path.join(process.cwd(), 'products.json');
    await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf-8');

    return NextResponse.json({ success: true, data: { count: products.length } });
  } catch (error) {
    console.error('Sync to JSON error:', error);
    return NextResponse.json({ success: false, error: 'Ошибка синхронизации в JSON' }, { status: 500 });
  }
}
