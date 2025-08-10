/* ARCHIVED: Устаревший эндпоинт. Используйте /api/products */
export const runtime = 'edge';
export function GET() { return new Response('Archived', { status: 410 }); }
export function POST() { return new Response('Archived', { status: 410 }); }
