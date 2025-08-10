// API /api/products/json — устарел. Данные products.json перенесены в архив и больше не используются.
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'JSON API deprecated. Use /api/products',
  }, { status: 410 });
}

export const dynamic = 'force-dynamic';
