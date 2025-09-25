import { NextRequest, NextResponse } from 'next/server';
import { fullTextSearch } from '@/lib/search/fullTextService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = (searchParams.get('q') || '').trim();
  const category = (searchParams.get('category') || '').trim() || undefined;
  const limit = parseInt(searchParams.get('limit') || '40');
  const offset = parseInt(searchParams.get('offset') || '0');
  if (q.length < 2) {
    return NextResponse.json({ query: q, timeMs: 0, count: 0, results: [] });
  }
  const data = await fullTextSearch({ q, category, limit, offset });
  return NextResponse.json(data);
}
