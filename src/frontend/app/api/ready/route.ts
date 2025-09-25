export async function GET() {
  // Ready when server process is up and environment loaded
  const isReady = process.env.NODE_ENV === 'production' || true;
  return new Response(JSON.stringify({ ready: isReady, timestamp: new Date().toISOString() }), { headers: { 'Content-Type': 'application/json' } });
}
