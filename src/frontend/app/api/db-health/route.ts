import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Quick check
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const res = await (prisma as any).$queryRaw`SELECT 1 as result`;
    return new Response(JSON.stringify({ database: 'connected' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ database: 'disconnected', error: String(err) }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  }
}
