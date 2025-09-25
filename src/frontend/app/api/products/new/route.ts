// ARCHIVED-COMPAT: Эндпоинт совместимости. 307 → /api/products?type=new
// app/api/products/new/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // 307 Redirect на унифицированный эндпоинт
  const url = new URL(req.url);
  url.pathname = '/api/products';
  if (!url.searchParams.get('type')) {
    url.searchParams.set('type', 'new');
  }
  return NextResponse.redirect(url, 307);
}

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Эндпоинт архивирован. Используйте /api/products?type=new' },
    { status: 410 }
  );
}
