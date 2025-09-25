// app/api/admin/products/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/authUtils';
import { prisma } from '@/lib/prisma';
import { tryPrisma } from '@/lib/prismaSafe';
// removed ProductMinimal import — using local types that match selected fields

// Local helper types matching selected fields from Prisma queries
type ProductImageOnly = { id: number; image: string | null; images: string[] };
type ProductWithPrice = { id: number; image: string | null; images: string[]; price: number | null };

// POST - массовые операции
export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

  const body = await req.json();
  const { action, productIds } = body;

    // Для большинства операций нужны ID, кроме специальных действий типа 'delete-duplicates'
    const needsIds = action !== 'delete-duplicates';
    if (!action || (needsIds && (!Array.isArray(productIds) || productIds.length === 0))) {
      return NextResponse.json(
        { error: needsIds ? 'Действие и список ID обязательны' : 'Не указано действие' },
        { status: 400 }
      );
    }

    // Валидируем ID
    const validIds = Array.isArray(productIds)
      ? productIds.filter((id: unknown) => Number.isInteger(id) && (id as number) > 0)
      : [];
    if (needsIds && validIds.length === 0) {
      return NextResponse.json(
        { error: 'Нет валидных ID продуктов' },
        { status: 400 }
      );
    }

  let result;

  switch (action) {
      case 'delete-duplicates': {
        // Удаляем дубликаты среди товаров на модерации (isConfirmed=false)
        // Критерий дубля: одинаковые (нормализованное название) + одинаковая цена
        const normalize = (t?: string | null) =>
          (t || '')
            .toLowerCase()
            .replace(/[\(\)\[\]{}]/g, ' ')
            .replace(/[^\p{L}\p{N}]+/gu, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const pending = await tryPrisma(() => prisma.product.findMany({
          where: { isConfirmed: false },
          select: { id: true, title: true, price: true, image: true, images: true }
        }));

        if (!Array.isArray(pending)) {
          return NextResponse.json({ message: 'DB unavailable' }, { status: 503 });
        }

        const groups = new Map<string, { id: number; hasPhoto: boolean }[]>();
  for (const p of pending) {
          const key = `${normalize(p.title)}|${p.price}`;
          if (!key || key.startsWith('|')) continue;
          const hasPhoto = Boolean(p.image) || (Array.isArray(p.images) && p.images.some(Boolean));
          const arr = groups.get(key) || [];
          arr.push({ id: p.id, hasPhoto });
          groups.set(key, arr);
        }

        const toDelete: number[] = [];
  for (const [, arr] of groups) {
          if (arr.length <= 1) continue;
          // Оставляем один приоритетно с фото; остальные удаляем
          const sorted = arr.sort((a, b) => Number(b.hasPhoto) - Number(a.hasPhoto) || a.id - b.id);
          sorted.shift(); // первый остаётся
          for (const rest of sorted) toDelete.push(rest.id);
        }

        if (toDelete.length === 0) {
          return NextResponse.json({ message: 'Дубликаты не найдены', affected: 0, deletedIds: [] });
        }

        const delRes = await tryPrisma(() => prisma.product.deleteMany({ where: { id: { in: toDelete } } }));
        if (delRes === undefined || delRes === null || typeof (delRes as any).count !== 'number') {
          return NextResponse.json({ message: 'DB unavailable' }, { status: 503 });
        }
        const { count } = delRes as { count: number };
        return NextResponse.json({
          message: `Удалено дублей: ${count}`,
          affected: count,
          deletedIds: toDelete
        });
      }

      case 'confirm': {
        // подтверждаем только те, у кого есть хотя бы одно изображение
        const candidates = await tryPrisma(() => prisma.product.findMany({
          where: { id: { in: validIds } },
          select: { id: true, image: true, images: true }
        }));
        if (!Array.isArray(candidates)) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
        const okIds = (candidates as ProductImageOnly[])
          .filter((p: ProductImageOnly) => {
            const imgs = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
            const main = (p.image || '').trim();
            return imgs.length > 0 || !!main;
          })
          .map((p: ProductImageOnly) => p.id);
        const skippedIds = (candidates as ProductImageOnly[])
          .filter((p: ProductImageOnly) => !okIds.includes(p.id))
          .map((p: ProductImageOnly) => p.id);

        const updated = okIds.length > 0
          ? await tryPrisma(() => prisma.product.updateMany({ where: { id: { in: okIds } }, data: { isConfirmed: true } }))
          : { count: 0 };
        if (updated === undefined || updated === null || typeof (updated as any).count !== 'number') {
          return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
        }
        const updatedCount = (updated as { count: number }).count;

        return NextResponse.json({
          message: `Одобрено ${updatedCount}, пропущено: ${skippedIds.length}`,
          affected: updatedCount,
          skipped: skippedIds,
        });
      }

      case 'unconfirm':
        result = await tryPrisma(() => prisma.product.updateMany({ where: { id: { in: validIds } }, data: { isConfirmed: false } }));
        if (result === undefined) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
        break;

      case 'delete':
        result = await tryPrisma(() => prisma.product.deleteMany({ where: { id: { in: validIds } } }));
        if (result === undefined) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
        break;

      case 'move-category': {
        const { category } = body as { category?: string };
        if (!category || typeof category !== 'string' || category.trim() === '') {
          return NextResponse.json({ error: 'Не указана категория' }, { status: 400 });
        }
        result = await tryPrisma(() => prisma.product.updateMany({ where: { id: { in: validIds } }, data: { category: category.trim() } }));
        if (result === undefined) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
        break;
      }

      case 'move-and-confirm': {
        const { category } = body as { category?: string };
        if (!category || typeof category !== 'string' || category.trim() === '') {
          return NextResponse.json({ error: 'Не указана категория' }, { status: 400 });
        }
        const cat = category.trim();
        // сначала проставим категорию выбранным
        const upd = await tryPrisma(() => prisma.product.updateMany({ where: { id: { in: validIds } }, data: { category: cat } }));
        if (upd === undefined) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
        // перечитаем и отфильтруем тех, кого можно подтверждать
        const candidates = await tryPrisma(() => prisma.product.findMany({ where: { id: { in: validIds } }, select: { id: true, image: true, images: true, price: true } }));
        if (!Array.isArray(candidates)) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
        const isPlaceholder = (s?: string | null) => {
          const v = (s || '').toLowerCase();
          return !v || v.endsWith('/fon.png') || v.endsWith('/fonb.png') || v.endsWith('/fonc.png') || v.endsWith('/placeholder.jpg');
        };
        const okIds = candidates
          .filter((p: ProductWithPrice) => {
            const mainOk = !!p.image && !isPlaceholder(p.image);
            const anyOk = Array.isArray(p.images) && p.images.some((x: unknown) => !!x && !isPlaceholder(x as string));
            return (mainOk || anyOk) && (p.price || 0) > 0;
          })
          .map((p: ProductWithPrice) => p.id);
  const skipped = (candidates as ProductWithPrice[]).filter((p: ProductWithPrice) => !okIds.includes(p.id)).map((p: ProductWithPrice) => p.id);
  const updatedRaw = okIds.length ? await tryPrisma(() => prisma.product.updateMany({ where: { id: { in: okIds } }, data: { isConfirmed: true } })) : { count: 0 };
  if (updatedRaw === undefined || updatedRaw === null) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
  const updatedCount = typeof (updatedRaw as any).count === 'number' ? (updatedRaw as any).count : 0;
  return NextResponse.json({ message: `Перемещено в '${cat}', одобрено ${updatedCount}, пропущено ${skipped.length}`, affected: updatedCount, skipped });
      }

      default:
        return NextResponse.json(
          { error: 'Неизвестное действие' },
          { status: 400 }
        );
    }

    const affected = result && typeof (result as any).count === 'number' ? (result as any).count : 0;
    return NextResponse.json({
      message: `Действие '${action}' выполнено для ${affected} продуктов`,
      affected
    });

  } catch (error) {
    console.error('Bulk operation error:', error);
    return NextResponse.json(
      { error: 'Ошибка выполнения массовой операции' },
      { status: 500 }
    );
  }
}
