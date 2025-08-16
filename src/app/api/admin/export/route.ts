import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const format = (searchParams.get('format') || 'json').toLowerCase();
    const confirmed = (searchParams.get('confirmed') || 'true').toLowerCase();

    const products = await prisma.product.findMany({
      where: confirmed === 'true' ? { isConfirmed: true } : {},
      orderBy: { id: 'asc' },
    });

    if (format === 'csv') {
      const headers = [
        'id','title','price','discount','category','subcategory','barcode','quantity','reserved','images'
      ];
      const rows = products.map(p => [
        p.id,
        safe(p.title),
        p.price,
        p.discount ?? 0,
        safe(p.category || ''),
        safe(p.subcategory || ''),
        safe(p.barcode || ''),
        p.quantity ?? 0,
        p.reserved ?? 0,
        (p.images || []).join('|')
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.map(v => csvCell(v)).join(','))].join('\n');
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="products.csv"',
        }
      });
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Ошибка экспорта' }, { status: 500 });
  }
}

function safe(s: string) { return s.replace(/\n|\r|\t|,/g, ' ').trim(); }
function csvCell(v: unknown) {
  if (v == null) return '';
  const s = String(v).replace(/"/g, '""');
  if (/[",\n\r]/.test(s)) return `"${s}"`;
  return s;
}
