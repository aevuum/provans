export async function GET() {
	return new Response(JSON.stringify({ ok: true, message: 'redux-test GET' }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
}

export async function POST(request: Request) {
	try {
		const body = await request.json().catch(() => ({}));
		return new Response(JSON.stringify({ ok: true, received: body }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (e) {
		return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
	}
}
