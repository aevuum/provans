// ARCHIVED: основной поиск (API) отключён.
// Полный оригинал сохранён в archive/search/ (или недоступен если был перезаписан ранее).
// Возвращаем 410 Gone чтобы явно сигнализировать клиентам.
import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ archived: true, results: [] }, { status: 410 });
}
