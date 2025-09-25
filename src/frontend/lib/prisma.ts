import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

// Determine whether we should use a stubbed Prisma client during build/runtime
const databaseUrl = process.env.DATABASE_URL || '';
const isLocalhost = !!databaseUrl && /localhost|127\.0\.0\.1/.test(databaseUrl);

// Try to parse hostname from DATABASE_URL; fallback to regex for unusual formats
let isDockerPostgresHost = false;
if (databaseUrl) {
  try {
    const parsed = new URL(databaseUrl);
    isDockerPostgresHost = parsed.hostname === 'postgres';
  } catch {
    isDockerPostgresHost = /@postgres[:/]|\/\/postgres[:/]/.test(databaseUrl);
  }
}

let shouldStub = !databaseUrl
  || (isLocalhost && process.env.PRISMA_REQUIRE_DB !== '1')
  || (isDockerPostgresHost && process.env.PRISMA_ALLOW_STUB_POSTGRES === '1');

// Debug override: if set, force using real Prisma client (useful for local troubleshooting)
if (process.env.FORCE_REAL_PRISMA === '1') {
  console.warn('[prisma] FORCE_REAL_PRISMA=1 detected — forcing real Prisma client');
  shouldStub = false;
}

function makeStub() {
  // Use a concrete object-like target type for ProxyHandler so TypeScript
  // satisfies the `T extends object` constraint. `Record<string, unknown>`
  // represents a plain object with string keys and unknown values.
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_target, prop) {
      const name = String(prop || '');
      if (name === 'count') return async () => 0;
      if (name === 'findMany') return async () => [];
      if (name === 'findFirst' || name === 'findUnique') return async () => null;
      if (name === 'create' || name === 'update' || name === 'upsert') return async () => null;
      if (name === 'delete' || name === 'deleteMany' || name === 'updateMany') return async () => ({ count: 0 });
      if (name === 'aggregate' || name === 'groupBy') return async () => ({});
      return async () => null;
    }
  }
  return new Proxy({}, {
    get() {
      return new Proxy({}, handler as any);
    }
  }) as unknown as PrismaClient;
}

let prismaInstance: PrismaClient | ReturnType<typeof makeStub>;

if (shouldStub) {
  // Log explicitly so CI logs show why stub is used
  console.warn('[prisma] Using stub client (no DATABASE_URL or localhost without PRISMA_REQUIRE_DB=1 or docker host + PRISMA_ALLOW_STUB_POSTGRES=1)');
  prismaInstance = makeStub();
} else {
  try {
    const realClient = globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] });
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = realClient;

    // Wrap real client with a defensive proxy: methods will timeout and return undefined on failure
    function makeSafePrisma<T extends object>(client: T, timeoutMs = 1500) {
      const createMethodWrapper = (obj: any, methodName: PropertyKey) => {
        const fn = obj[methodName]
        if (typeof fn !== 'function') return fn
        return (...args: any[]) => {
          try {
            const p = fn.apply(obj, args)
            return Promise.race([
              p,
              new Promise((_, rej) => setTimeout(() => rej(new Error('prisma-timeout')), timeoutMs))
            ]).catch((err) => {
              console.warn('[prisma] method failed', String(methodName), err && err.message ? err.message : String(err))
              return undefined
            })
          } catch (err) {
            console.warn('[prisma] method call threw synchronously', String(methodName), String(err))
            return Promise.resolve(undefined)
          }
        }
      }

      const handler: ProxyHandler<any> = {
        get(target, prop, receiver) {
          const val = Reflect.get(target, prop, receiver)
          if (typeof val === 'function') {
            return createMethodWrapper(target, prop)
          }
          if (val && typeof val === 'object') {
            // Return a proxied model/object so its methods are wrapped too
            return new Proxy(val, {
              get(subTarget, subProp) {
                const subVal = Reflect.get(subTarget, subProp)
                if (typeof subVal === 'function') return createMethodWrapper(subTarget, subProp)
                return subVal
              }
            })
          }
          return val
        }
      }

      return new Proxy(client as any, handler) as T
    }

    prismaInstance = makeSafePrisma(realClient)
  } catch (err) {
  console.warn('[prisma] Failed to init real client, falling back to stub:', err);
    prismaInstance = makeStub();
  }
}

export const prisma = prismaInstance;
