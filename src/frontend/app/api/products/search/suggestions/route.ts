// ARCHIVED: DB-backed suggestions endpoint отключён. См. archive/search/original/api_products_search_suggestions_route.orig.ts
import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ archived: true, suggestions: [], total: 0 }, { status: 410 });
}
