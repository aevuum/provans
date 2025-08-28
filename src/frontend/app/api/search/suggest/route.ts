import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import { promises as fs } from 'node:fs';

type FileProduct = { id: number | string; title?: string; category?: string | null };

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const qRaw = (searchParams.get('q') || '').trim();
    const limit = parseInt(searchParams.get('limit') || '10');
    if (!qRaw) {
      return NextResponse.json({ suggestions: [] });
    }
    const q = qRaw.toLowerCase();

    const filePath = path.join(process.cwd(), 'new-product.json');
    const content = await fs.readFile(filePath, 'utf8');
    const parsed: unknown = JSON.parse(content);
    let arr: FileProduct[] = [];
    if (Array.isArray(parsed)) {
      arr = parsed as FileProduct[];
    } else if (
      parsed && typeof parsed === 'object' && Array.isArray((parsed as { products?: unknown[] }).products)
    ) {
      arr = ((parsed as { products: unknown[] }).products as FileProduct[]);
    }

    const seen = new Set<string>();
  const suggestions: Array<{ id: string; title: string; category?: string | null }> = [];
    for (const p of arr) {
      const title = String(p?.title || '').trim();
      if (!title) continue;
      const key = title.toLowerCase();
      if (key.includes(q) && !seen.has(key)) {
        seen.add(key);
        suggestions.push({ id: String(p.id), title, category: p.category ?? null });
        if (suggestions.length >= limit) break;
      }
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Suggest error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
