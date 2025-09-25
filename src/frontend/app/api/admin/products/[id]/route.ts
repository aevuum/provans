import { getAdminSession } from '@/lib/authUtils';
import type { ProductMinimal } from '@/lib/prisma-types';
import { prisma } from '@/lib/prisma';
import { tryPrisma } from '@/lib/prismaSafe';
import { NextRequest, NextResponse } from 'next/server';


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

  const product = await tryPrisma(() => prisma.product.findUnique({ where: { id: productId } })) as unknown as ProductMinimal | null | undefined;
    if (product) return NextResponse.json(product);
    // Если product === undefined — возможно DB недоступна либо продукт не найден
    if (product === undefined) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });


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
    const updatedProduct = await tryPrisma(() => prisma.product.update({ where: { id: productId }, data: body }));
    if (!updatedProduct) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
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
  const currentProduct = await tryPrisma(() => prisma.product.findUnique({ where: { id: productId } })) as unknown as ProductMinimal | null | undefined;
    if (!currentProduct) {
      // Если товара нет — создаем новый (upsert поведение)
      const created = await tryPrisma(() => prisma.product.create({
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
      }));
      if (!created) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
      return NextResponse.json(created);
    }

    // Нормализация полей изображений
    const imagesNorm = images !== undefined
      ? (Array.isArray(images) ? images.map((s: unknown) => String(s || '').trim()).filter(Boolean) : [])
      : undefined;
    const imageNorm = image !== undefined ? (String(image || '').trim() || null) : undefined;
    const curImages = Array.isArray(currentProduct?.images) ? currentProduct.images : undefined;

    // Обновляем товар, сохраняя изображения если они не переданы
    const updatedProduct = await tryPrisma(() => prisma.product.update({ where: { id: productId }, data: {
        title: (typeof title === 'string' ? title.trim() : currentProduct.title) || currentProduct.title,
        price: typeof price === 'number' ? price : (price ? parseInt(price) : currentProduct.price),
        size: size !== undefined ? (size?.trim() || null) : currentProduct.size,
        barcode: barcode !== undefined ? (barcode?.trim() || null) : currentProduct.barcode,
        comment: comment !== undefined ? (comment?.trim() || null) : currentProduct.comment,
        // Сохраняем изображения только если они переданы явно
        image: imageNorm !== undefined ? imageNorm : currentProduct.image,
  images: imagesNorm !== undefined ? imagesNorm : curImages,
        isConfirmed: isConfirmed !== undefined ? Boolean(isConfirmed) : currentProduct.isConfirmed,
        discount: discount !== undefined ? (typeof discount === 'number' ? discount : (discount ? parseFloat(discount) : 0)) : currentProduct.discount,
        category: category !== undefined ? (category?.trim() || null) : currentProduct.category
      } }));

    if (!updatedProduct) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
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
