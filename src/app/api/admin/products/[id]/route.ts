// app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/authUtils';
import { prisma } from '@/lib/prisma';
import fs from 'node:fs/promises';
import path from 'node:path';

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

    if (!product) {
      return NextResponse.json({ error: 'Продукт не найден' }, { status: 404 });
    }

    return NextResponse.json(product);

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
      return NextResponse.json({ error: 'Продукт не найден' }, { status: 404 });
    }

    // Обновляем товар, сохраняя изображения если они не переданы
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        title: title?.trim() || currentProduct.title,
        price: price ? parseInt(price) : currentProduct.price,
        size: size !== undefined ? (size?.trim() || null) : currentProduct.size,
        barcode: barcode !== undefined ? (barcode?.trim() || null) : currentProduct.barcode,
        comment: comment !== undefined ? (comment?.trim() || null) : currentProduct.comment,
        // Сохраняем изображения только если они переданы явно
        image: image !== undefined ? (image?.trim() || null) : currentProduct.image,
        images: images !== undefined ? (Array.isArray(images) ? images.filter(Boolean) : []) : currentProduct.images,
        isConfirmed: isConfirmed !== undefined ? Boolean(isConfirmed) : currentProduct.isConfirmed,
        discount: discount !== undefined ? (discount ? parseFloat(discount) : 0) : currentProduct.discount,
        category: category !== undefined ? (category?.trim() || null) : currentProduct.category
      }
    });

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
