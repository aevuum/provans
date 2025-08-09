// app/api/products-new/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // 307 Redirect на новый актуальный эндпоинт с теми же параметрами
  const url = new URL(req.url);
  url.pathname = '/api/products';
  return NextResponse.redirect(url, 307);
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Эндпоинт архивирован. Используйте /api/admin/products или /api/products',
    },
    { status: 410 }
  );
}
