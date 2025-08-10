/* ARCHIVED: Используйте /api/products?type=discount */
export const runtime = 'edge';
export function GET() { return new Response('Archived', { status: 410 }); }
export function POST() { return new Response('Archived', { status: 410 }); }
