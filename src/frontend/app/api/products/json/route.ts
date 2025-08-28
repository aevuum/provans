// API /api/products/json — устарел. Данные products.json перенесены в архив, актуален new-product.json.
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'JSON API deprecated. Use /api/products (source: new-product.json)'
  }, { status: 410 });
}

export const dynamic = 'force-dynamic';
