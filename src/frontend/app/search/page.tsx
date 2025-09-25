import React from 'react';
import AllProductsSearchClient from './search-client';
import { prisma } from '@/lib/prisma';
import { tryPrisma } from '@/lib/prismaSafe';
import fs from 'fs';
import path from 'path';

export const revalidate = 0;

async function loadProductsFromFileFallback() {
  try {
    const filePath = path.resolve(process.cwd(), 'src/frontend/new-product.json');
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((p) => ({ id: p.id, title: p.title, price: p.price, category: p.category ?? null, image: p.image ?? null, images: p.images ?? [] })) : [];
  } catch (err) {
    console.warn('[search/page] failed to load fallback file', err);
    return [];
  }
}

export default async function SearchPage() {
  let products: Array<{ id: number; title: string; price: number; category: string | null; image: string | null; images: string[] }> = [];
  try {
    const res = await tryPrisma(() => prisma.product.findMany({
      where: { isConfirmed: true },
      select: { id: true, title: true, price: true, category: true, image: true, images: true },
      orderBy: { id: 'asc' }
    }), { timeoutMs: 1500, retries: 1 });
    if (Array.isArray(res)) products = res as any
    else {
      console.warn('[search/page] prisma returned undefined, using fallback');
      products = await loadProductsFromFileFallback();
    }
  } catch (err) {
    console.warn('[search/page] DB unavailable or prisma stub active, falling back to file', String(err));
    products = await loadProductsFromFileFallback();
  }
  return <AllProductsSearchClient initialProducts={products} />;
}
