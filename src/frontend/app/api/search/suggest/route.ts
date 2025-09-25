// ARCHIVED: endpoint автодополнения отключён. См. archive/search/original/api_search_suggest_route.orig.ts
import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ archived: true, suggestions: [] }, { status: 410 });
}
