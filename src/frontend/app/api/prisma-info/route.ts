import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function maskUrl(u: string | undefined) {
  if (!u) return null;
  try {
    const url = new URL(u);
    // url.pathname already contains a leading '/'
    return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}${url.pathname}`;
  } catch {
    return u ? `${u.substring(0, 64)}...` : null;
  }
}

export async function GET() {
  try {
    const envUrl = process.env.DATABASE_URL || null;
  // Detect stub by checking for a real client's low-level API method.
  // Model methods (like `user.findMany`) may not exist on the top-level type,
  // so check for `$queryRaw` which should be present on a real Prisma client
  // (and proxied by our defensive wrapper).
  const usingStub = !(prisma && typeof (prisma as any).$queryRaw === 'function');

    // Attempt a lightweight DB ping if real client
    let ping = null;
    if (!usingStub) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const res = await (prisma as any).$queryRaw`SELECT 1 as ok`;
        ping = 'ok';
      } catch (err: any) {
        ping = String(err?.message || err || 'error');
      }
    }

    return NextResponse.json({
      usingStub,
      databaseUrl: maskUrl(envUrl || undefined),
      prismaProbe: ping,
      envFlags: {
        PRISMA_REQUIRE_DB: process.env.PRISMA_REQUIRE_DB || null,
        PRISMA_ALLOW_STUB_POSTGRES: process.env.PRISMA_ALLOW_STUB_POSTGRES || null
      }
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
