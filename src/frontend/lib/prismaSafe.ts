// Helper around prisma calls to add timeout/retry and avoid throwing during build when DB is unreachable

type Fn<T> = () => Promise<T>

export async function tryPrisma<T>(fn: Fn<T>, opts?: { timeoutMs?: number; retries?: number }): Promise<T | undefined> {
  const timeoutMs = opts?.timeoutMs ?? 1500
  const retries = opts?.retries ?? 1

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const p = fn()
      const res = await Promise.race([
        p,
        new Promise<undefined>((_, rej) => setTimeout(() => rej(new Error('prisma-timeout')), timeoutMs))
      ])
      return res as T
    } catch (err) {
      // On last attempt rethrow (or return undefined) — we prefer to return undefined so callers can fallback
      if (attempt === retries) {
        console.warn('[prismaSafe] call failed after attempts:', { attempt, retries, err: String(err) })
        return undefined
      }
      // small backoff
      await new Promise((r) => setTimeout(r, 100 * (attempt + 1)))
    }
  }
  return undefined
}

export const safe = {
  findMany: <T = any>(call: () => Promise<T[]>, opts?: Parameters<typeof tryPrisma>[1]) => tryPrisma(call, opts),
  count: (call: () => Promise<number>, opts?: Parameters<typeof tryPrisma>[1]) => tryPrisma(call, opts),
  findFirst: <T = any>(call: () => Promise<T | null>, opts?: Parameters<typeof tryPrisma>[1]) => tryPrisma(call, opts),
}

export default tryPrisma
