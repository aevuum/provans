// Простейший in-memory rate limit (per-process). Для прод лучше Redis.

interface Bucket {
  tokens: number;
  last: number;
}

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, refillMs: number): boolean {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b) {
    b = { tokens: limit, last: now };
    buckets.set(key, b);
  }
  const elapsed = now - b.last;
  if (elapsed > refillMs) {
    const refillCount = Math.floor(elapsed / refillMs);
    b.tokens = Math.min(limit, b.tokens + refillCount);
    b.last = now;
  }
  if (b.tokens <= 0) return false;
  b.tokens -= 1;
  return true;
}
