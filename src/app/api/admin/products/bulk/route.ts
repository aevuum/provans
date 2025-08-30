// app/api/admin/products/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '../../../../../lib/authUtils';
import { prisma } from '../../../../../lib/prisma';

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

        const pending = await prisma.product.findMany({
          where: { isConfirmed: false },
          select: { id: true, title: true, price: true, image: true, images: true }
        });

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

        const { count } = await prisma.product.deleteMany({ where: { id: { in: toDelete } } });
        return NextResponse.json({
          message: `Удалено дублей: ${count}`,
          affected: count,
          deletedIds: toDelete
        });
      }

      case 'confirm': {
        // подтверждаем только те, у кого есть хотя бы одно изображение
        const candidates = await prisma.product.findMany({
          where: { id: { in: validIds } },
          select: { id: true, image: true, images: true }
        });
        const okIds = candidates
          .filter(p => {
            const imgs = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
            const main = (p.image || '').trim();
            return imgs.length > 0 || !!main;
          })
          .map(p => p.id);
        const skippedIds = candidates
          .filter(p => !okIds.includes(p.id))
          .map(p => p.id);

        const updated = okIds.length > 0
          ? await prisma.product.updateMany({ where: { id: { in: okIds } }, data: { isConfirmed: true } })
          : { count: 0 };

  return NextResponse.json({
          message: `Одобрено ${updated.count}, пропущено: ${skippedIds.length}`,
          affected: updated.count,
          skipped: skippedIds,
        });
      }

      case 'unconfirm':
        result = await prisma.product.updateMany({
          where: { id: { in: validIds } },
          data: { isConfirmed: false }
        });
        break;

      case 'delete':
        result = await prisma.product.deleteMany({
          where: { id: { in: validIds } }
        });
        break;

      case 'move-category': {
        const { category } = body as { category?: string };
        if (!category || typeof category !== 'string' || category.trim() === '') {
          return NextResponse.json({ error: 'Не указана категория' }, { status: 400 });
        }
        result = await prisma.product.updateMany({
          where: { id: { in: validIds } },
          data: { category: category.trim() }
        });
        break;
      }

      case 'move-and-confirm': {
        const { category } = body as { category?: string };
        if (!category || typeof category !== 'string' || category.trim() === '') {
          return NextResponse.json({ error: 'Не указана категория' }, { status: 400 });
        }
        const cat = category.trim();
        // сначала проставим категорию выбранным
        await prisma.product.updateMany({ where: { id: { in: validIds } }, data: { category: cat } });
        // перечитаем и отфильтруем тех, кого можно подтверждать
        const candidates = await prisma.product.findMany({
          where: { id: { in: validIds } },
          select: { id: true, image: true, images: true, price: true }
        });
        const isPlaceholder = (s?: string | null) => {
          const v = (s || '').toLowerCase();
          return !v || v.endsWith('/fon.png') || v.endsWith('/fonb.png') || v.endsWith('/fonc.png') || v.endsWith('/placeholder.jpg');
        };
        const okIds = candidates
          .filter(p => {
            const mainOk = !!p.image && !isPlaceholder(p.image);
            const anyOk = Array.isArray(p.images) && p.images.some(x => !!x && !isPlaceholder(x));
            return (mainOk || anyOk) && (p.price || 0) > 0;
          })
          .map(p => p.id);
        const skipped = candidates.filter(p => !okIds.includes(p.id)).map(p => p.id);
        const updated = okIds.length ? await prisma.product.updateMany({ where: { id: { in: okIds } }, data: { isConfirmed: true } }) : { count: 0 };
        return NextResponse.json({ message: `Перемещено в '${cat}', одобрено ${updated.count}, пропущено ${skipped.length}`, affected: updated.count, skipped });
      }

      default:
        return NextResponse.json(
          { error: 'Неизвестное действие' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Действие '${action}' выполнено для ${result.count} продуктов`,
      affected: result.count
    });

  } catch (error) {
    console.error('Bulk operation error:', error);
    return NextResponse.json(
      { error: 'Ошибка выполнения массовой операции' },
      { status: 500 }
    );
  }
}
