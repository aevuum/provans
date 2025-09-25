// NOTE: Relative import to avoid occasional alias resolution issues in some build contexts
import { prisma } from '../prisma';

export interface FullTextSearchParams {
  q: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface FullTextSearchResultItem {
  id: number;
  title: string;
  price: number;
  category: string | null;
  image: string | null;
  images: string[];
}

export interface FullTextSearchResponse {
  query: string;
  timeMs: number;
  count: number;
  results: FullTextSearchResultItem[];
}

// Raw full-text search using Postgres. Requires a GIN index, see: database-indexes.sql
export async function fullTextSearch({ q, category, limit = 40, offset = 0 }: FullTextSearchParams): Promise<FullTextSearchResponse> {
  const started = Date.now();
  const query = q.trim();
  if (query.length < 2) {
    return { query, timeMs: 0, count: 0, results: [] };
  }
  const safeLimit = Math.min(Math.max(limit, 1), 200);
  const safeOffset = Math.max(offset, 0);

  // Two SQL variants to keep placeholder numbering correct whether category filter is used.
  const baseVector = "to_tsvector('simple', coalesce(p.title,'') || ' ' || coalesce(p.category,'') || ' ' || coalesce(p.comment,''))";
  const rankExpr = `ts_rank(${baseVector}, plainto_tsquery('simple', $1))`;

  let sql: string;
  let params: any[];
  if (category) {
    sql = `
      SELECT p.id, p.title, p.price, p.category, p.image, p.images,
             ${rankExpr} AS rank
      FROM "Product" p
      WHERE p."isConfirmed" = true
        AND ${baseVector} @@ plainto_tsquery('simple', $1)
        AND p."category" = $3
      ORDER BY rank DESC, p.id ASC
      LIMIT $2 OFFSET $4;
    `;
    params = [query, safeLimit, category, safeOffset];
  } else {
    sql = `
      SELECT p.id, p.title, p.price, p.category, p.image, p.images,
             ${rankExpr} AS rank
      FROM "Product" p
      WHERE p."isConfirmed" = true
        AND ${baseVector} @@ plainto_tsquery('simple', $1)
      ORDER BY rank DESC, p.id ASC
      LIMIT $2 OFFSET $3;
    `;
    params = [query, safeLimit, safeOffset];
  }

  try {
    const rows: any[] = await prisma.$queryRawUnsafe(sql, ...params);
    const timeMs = Date.now() - started;
    return {
      query,
      timeMs,
      count: rows.length,
      results: rows.map(r => ({
        id: Number(r.id),
        title: r.title as string,
        price: Number(r.price),
        category: r.category ?? null,
        image: r.image ?? null,
        images: Array.isArray(r.images) ? r.images : (r.image ? [r.image] : [])
      }))
    };
  } catch (e) {
    console.error('[fullTextSearch] error', e);
    return { query, timeMs: Date.now() - started, count: 0, results: [] };
  }
}
