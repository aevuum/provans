import { NextRequest, NextResponse } from 'next/server';

// DEPRECATED: используйте /api/payment/create
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    // Проксирование тела на новый маршрут для обратной совместимости
    const url = new URL(req.url);
    url.pathname = '/api/payment/create';
    try {
        const res = await fetch(url.toString(), {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: await req.text(),
            cache: 'no-store'
        });
        const data = await res.json();
        return NextResponse.json({ deprecated: true, ...data }, { status: res.status });
    } catch (e) {
        const msg = e instanceof Error ? e.message : 'Proxy error';
        return NextResponse.json({ deprecated: true, success: false, error: msg }, { status: 500 });
    }
}