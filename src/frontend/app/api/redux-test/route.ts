import { NextResponse } from 'next/server';

// API route для проверки Redux состояния (только для разработки)
export async function GET() {
  // В реальном приложении здесь была бы логика получения состояния из store
  // Но поскольку это server-side, мы можем только вернуть mock данные

  return NextResponse.json({
    message: 'Redux context API работает',
    timestamp: new Date().toISOString(),
    note: 'Redux состояние доступно только на клиенте через useAppSelector'
  });
}
