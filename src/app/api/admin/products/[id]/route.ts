// app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/authUtils';
import prisma from '@/lib/prisma';

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
      material,
      country,
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
        material: material !== undefined ? (material?.trim() || null) : currentProduct.material,
        country: country !== undefined ? (country?.trim() || null) : currentProduct.country,
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

    await prisma.product.delete({
      where: { id: productId }
    });

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
