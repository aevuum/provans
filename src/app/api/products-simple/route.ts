// app/api/products-new/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Эндпоинт архивирован. Используйте /api/products',
    },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Эндпоинт архивирован. Используйте /api/products',
    },
    { status: 410 }
  );
}
