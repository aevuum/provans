// app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/authUtils';
import { prisma } from '@/lib/prisma';
import fs from 'node:fs/promises';
import path from 'node:path';

async function syncNewProductJson(action: 'update' | 'delete', payload: unknown) {
  try {
    const filePath = path.join(process.cwd(), 'new-product.json');
    const backupDir = path.join(process.cwd(), 'archive');
    const raw = await fs.readFile(filePath, 'utf-8');

    // Backup
    try {
      await fs.mkdir(backupDir, { recursive: true });
      const backupName = path.join(backupDir, `new-product.backup.${Date.now()}.json`);
      await fs.writeFile(backupName, raw, 'utf-8');
    } catch {}

    const parsed: unknown = JSON.parse(raw);
    const asArray = Array.isArray(parsed);
    const arr: unknown[] = asArray
      ? (parsed as unknown[])
      : (Array.isArray((parsed as { products?: unknown[] })?.products)
          ? ((parsed as { products: unknown[] }).products as unknown[])
          : []);

    const obj = (payload ?? {}) as Record<string, unknown>;
    const idNum = Number(obj.id);
    const barcode = obj.barcode ? String(obj.barcode) : undefined;
    const title = obj.title ? String(obj.title) : undefined;

    const matchIndex = arr.findIndex((p) => {
      const rec = (p ?? {}) as Record<string, unknown>;
      if (!Number.isNaN(idNum) && Number(rec.id) === idNum) return true;
      if (barcode && String(rec.barcode || rec.article || '') === barcode) return true;
      if (title && String(rec.title || '') === title) return true;
      return false;
    });

    if (action === 'delete') {
      if (matchIndex >= 0) {
        arr.splice(matchIndex, 1);
      }
    } else {
      // update
      const updated = {
        ...(matchIndex >= 0 ? (arr[matchIndex] as Record<string, unknown>) : {}),
        id: idNum || (matchIndex >= 0 ? (arr[matchIndex] as Record<string, unknown>).id : undefined),
        title: obj.title ?? undefined,
        price: obj.price ?? undefined,
        size: obj.size ?? null,
  barcode: obj.barcode ?? (obj as Record<string, unknown>).article ?? null,
        comment: obj.comment ?? null,
        image: obj.image ?? null,
        images: Array.isArray(obj.images) ? (obj.images as unknown[]) : ((obj.image ? [obj.image] : []) as unknown[]),
        discount: obj.discount ?? 0,
        category: obj.category ?? null,
  subcategory: (obj as Record<string, unknown>).subcategory ?? null,
      } as Record<string, unknown>;

      if (matchIndex >= 0) {
        arr[matchIndex] = updated;
      } else {
        arr.push(updated);
      }
    }

    const out = asArray ? JSON.stringify(arr, null, 2) : JSON.stringify({ ...(parsed as Record<string, unknown>), products: arr }, null, 2);
    await fs.writeFile(filePath, out, 'utf-8');
  } catch (e) {
    console.warn('Sync new-product.json skipped:', e);
  }
}

// GET - получение одного продукта
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    const { id } = await context.params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Неверный ID' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (product) {
      return NextResponse.json(product);
    }

    // Фолбэк: ищем в new-product.json, чтобы предзаполнить форму
    try {
      const jsonPath = path.join(process.cwd(), 'new-product.json');
      const raw = await fs.readFile(jsonPath, 'utf-8');
      const parsed: unknown = JSON.parse(raw);
      const arr: unknown[] = Array.isArray(parsed)
        ? (parsed as unknown[])
        : (Array.isArray((parsed as { products?: unknown[] })?.products)
            ? ((parsed as { products: unknown[] }).products as unknown[])
            : []);
      const fromJson = (arr.find((p) => Number((p as Record<string, unknown>)?.id) === productId) as Record<string, unknown> | undefined) || null;
      if (fromJson) {
        const fallback = {
          id: productId,
          title: String((fromJson as Record<string, unknown>).title || ''),
          price: Number((fromJson as Record<string, unknown>).price || 0),
          size: (fromJson as Record<string, unknown>).size ?? null,
          barcode: (fromJson as Record<string, unknown>).barcode ?? (fromJson as Record<string, unknown>).article ?? null,
          comment: (fromJson as Record<string, unknown>).comment ?? null,
          image: (fromJson as Record<string, unknown>).image ?? null,
          images: Array.isArray((fromJson as Record<string, unknown>).images)
            ? ((fromJson as Record<string, unknown>).images as unknown[]).filter(Boolean) as string[]
            : (((fromJson as Record<string, unknown>).image ? [((fromJson as Record<string, unknown>).image as string)] : []) as string[]),
          isConfirmed: Boolean((fromJson as Record<string, unknown>).isConfirmed ?? false),
          discount: Number((fromJson as Record<string, unknown>).discount || 0),
          category: (fromJson as Record<string, unknown>).category ?? null,
          quantity: Number((fromJson as Record<string, unknown>).quantity || 0),
          reserved: Number((fromJson as Record<string, unknown>).reserved || 0),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return NextResponse.json(fallback);
      }
    } catch {
      // игнорируем, вернём 404 ниже
    }

    return NextResponse.json({ error: 'Продукт не найден' }, { status: 404 });

  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения продукта' },
      { status: 500 }
    );
  }
}

// PATCH - частичное обновление продукта (для привязки фото)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    const { id } = await context.params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Неверный ID' }, { status: 400 });
    }

    const body = await req.json();
    
    // Для PATCH только обновляем переданные поля
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: body // Обновляем только переданные поля
    });

    return NextResponse.json(updatedProduct);

  } catch (error) {
    console.error('Patch product error:', error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ error: 'Продукт не найден' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Ошибка обновления продукта' },
      { status: 500 }
    );
  }
}

// PUT - обновление продукта
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    const { id } = await context.params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Неверный ID' }, { status: 400 });
    }

  const body = await req.json();
    const {
      title,
      price,
      size,
      barcode,
      comment,
      image,
      images,
      isConfirmed,
      discount,
      category
    } = body;

    // Валидация
    if (!title || !price) {
      return NextResponse.json(
        { error: 'Название и цена обязательны' },
        { status: 400 }
      );
    }

    // Получаем текущие данные товара
    const currentProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!currentProduct) {
      // Если товара нет — создаем новый (upsert поведение)
      const created = await prisma.product.create({
        data: {
          title: title?.trim() || 'Без названия',
          price: price ? parseInt(price) : 0,
          size: size?.trim() || null,
          barcode: barcode?.trim() || null,
          comment: comment?.trim() || null,
          image: image?.trim() || null,
          images: Array.isArray(images) ? images.filter(Boolean) : [],
          isConfirmed: isConfirmed !== undefined ? Boolean(isConfirmed) : false,
          discount: discount ? parseFloat(discount) : 0,
          category: category?.trim() || null,
        }
      });

      // Синхронизация new-product.json
      try { await syncNewProductJson('update', created); } catch {}

      // Синхронизация архива
      try {
        const confirmed = await prisma.product.findMany({ where: { isConfirmed: true } });
        const payload = {
          products: confirmed.map((p) => ({
            title: p.title,
            image_path: p.image || (p.images?.[0] ?? null),
            price: p.price,
            discount: p.discount ?? 0,
            size: p.size ?? null,
            category: p.category ?? null,
            barcode: p.barcode ?? null,
            comment: p.comment ?? null,
          }))
        };
        const filePath = path.join(process.cwd(), 'archive', 'products.json');
        await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf-8');
      } catch (e) {
        console.warn('JSON sync after create-in-PUT failed:', e);
      }

      return NextResponse.json(created);
    }

    // Нормализация полей изображений
    const imagesNorm = images !== undefined
      ? (Array.isArray(images) ? images.map((s: unknown) => String(s || '').trim()).filter(Boolean) : [])
      : undefined;
    const imageNorm = image !== undefined ? (String(image || '').trim() || null) : undefined;

    // Обновляем товар, сохраняя изображения если они не переданы
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        title: (typeof title === 'string' ? title.trim() : currentProduct.title) || currentProduct.title,
        price: typeof price === 'number' ? price : (price ? parseInt(price) : currentProduct.price),
        size: size !== undefined ? (size?.trim() || null) : currentProduct.size,
        barcode: barcode !== undefined ? (barcode?.trim() || null) : currentProduct.barcode,
        comment: comment !== undefined ? (comment?.trim() || null) : currentProduct.comment,
        // Сохраняем изображения только если они переданы явно
        image: imageNorm !== undefined ? imageNorm : currentProduct.image,
        images: imagesNorm !== undefined ? imagesNorm : currentProduct.images,
        isConfirmed: isConfirmed !== undefined ? Boolean(isConfirmed) : currentProduct.isConfirmed,
        discount: discount !== undefined ? (typeof discount === 'number' ? discount : (discount ? parseFloat(discount) : 0)) : currentProduct.discount,
        category: category !== undefined ? (category?.trim() || null) : currentProduct.category
      }
    });

  // Синхронизация в new-product.json
  try { await syncNewProductJson('update', updatedProduct); } catch {}

    // Синхронизация JSON после обновления (в архив)
    try {
      const confirmed = await prisma.product.findMany({ where: { isConfirmed: true } });
      const payload = {
        products: confirmed.map((p) => ({
          title: p.title,
          image_path: p.image || (p.images?.[0] ?? null),
          price: p.price,
          discount: p.discount ?? 0,
          size: p.size ?? null,
          category: p.category ?? null,
          barcode: p.barcode ?? null,
          comment: p.comment ?? null,
        }))
      };
      const filePath = path.join(process.cwd(), 'archive', 'products.json');
      await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (e) {
      console.warn('JSON sync after update failed:', e);
    }

  return NextResponse.json(updatedProduct);

  } catch (error) {
    console.error('Update product error:', error);
    
    // Проверяем, существует ли продукт
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ error: 'Продукт не найден' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Ошибка обновления продукта' },
      { status: 500 }
    );
  }
}

// DELETE - удаление продукта
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    const { id } = await context.params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Неверный ID' }, { status: 400 });
    }

    // Получаем продукт для доступа к путям изображений
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) {
      return NextResponse.json({ error: 'Продукт не найден' }, { status: 404 });
    }

    // Удаляем запись из БД
    await prisma.product.delete({ where: { id: productId } });

    // Удаляем локальные файлы изображений, если они находятся в /public
    try {
      const toDelete = [existing.image, ...(existing.images || [])].filter(Boolean) as string[];
      for (const rel of toDelete) {
        // пропускаем, если изображение используется другими товарами
        const stillUsed = await prisma.product.count({
          where: {
            OR: [
              { image: rel },
              { images: { has: rel } }
            ]
          }
        });
        if (stillUsed > 0) continue;

        const relPath = rel.startsWith('/') ? rel.slice(1) : rel; // нормализуем
        const publicDir = path.join(process.cwd(), 'public');
        const absPath = path.join(publicDir, relPath);
        // Защита от выхода за пределы /public
        if (!absPath.startsWith(publicDir)) continue;
        await fs.unlink(absPath).catch(() => {});
      }
    } catch (e) {
      console.warn('Failed to delete image files:', e);
    }

    // Синхронизация JSON после удаления (в архив)
    try {
  // Также удаляем из new-product.json
  try { await syncNewProductJson('delete', existing); } catch {}

      const confirmed = await prisma.product.findMany({ where: { isConfirmed: true } });
      const payload = {
        products: confirmed.map((p) => ({
          title: p.title,
          image_path: p.image || (p.images?.[0] ?? null),
          price: p.price,
          discount: p.discount ?? 0,
          size: p.size ?? null,
          category: p.category ?? null,
          barcode: p.barcode ?? null,
          comment: p.comment ?? null,
        }))
      };
      const jsonPath = path.join(process.cwd(), 'archive', 'products.json');
      await fs.writeFile(jsonPath, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (e) {
      console.warn('JSON sync after delete failed:', e);
    }

    return NextResponse.json({ message: 'Продукт удален' });

  } catch (error) {
    console.error('Delete product error:', error);
    
    // Проверяем, существует ли продукт
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json({ error: 'Продукт не найден' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Ошибка удаления продукта' },
      { status: 500 }
    );
  }
}
