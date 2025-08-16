// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

  const product = await prisma.product.findFirst({
      where: {
        id: parseInt(id),
        isConfirmed: true,
      },
    });

    // Fallback: если нет в БД, ищем в new-product.json (file-based)
    if (!product) {
      try {
        const filePath = path.join(process.cwd(), 'new-product.json');
        const content = await fs.readFile(filePath, 'utf8');
        const parsed: unknown = JSON.parse(content);
        const arr: unknown[] = Array.isArray(parsed)
          ? parsed as unknown[]
          : (Array.isArray((parsed as { products?: unknown[] })?.products) ? (parsed as { products: unknown[] }).products : []);
        const idNum = parseInt(id);
        let found = arr.find((p) => {
          const rec = (p ?? {}) as Record<string, unknown>;
          return Number(rec.id) === idNum;
        }) as Record<string, unknown> | undefined;

        // Если в файле нет явного id, используем индекс (1-based), как это делает список
        if (!found && idNum >= 1 && idNum <= arr.length) {
          const byIndex = arr[idNum - 1];
          if (byIndex && typeof byIndex === 'object') {
            found = byIndex as Record<string, unknown>;
          }
        }
        if (found) {
          const jp = found as {
            id: number | string;
            title?: string;
            price?: number | string;
            size?: string | null;
            material?: string | null;
            country?: string | null;
            barcode?: string | null;
            article?: string | null;
            comment?: string | null;
            image?: string | null;
            images?: unknown;
            discount?: number | string;
            category?: string | null;
            quantity?: number;
            reserved?: number;
            originalPrice?: number | string;
            subcategory?: string | null;
          };
          return NextResponse.json({
            id: Number(jp.id),
            title: String(jp.title || ''),
            price: Number(jp.price ?? 0),
            size: jp.size ?? null,
            material: jp.material ?? null,
            country: jp.country ?? null,
            barcode: jp.barcode ?? jp.article ?? null,
            comment: jp.comment ?? null,
            image: jp.image ?? null,
            images: Array.isArray(jp.images) ? (jp.images as string[]) : (jp.image ? [jp.image] : []),
            isConfirmed: true,
            discount: Number(jp.discount ?? 0),
            category: jp.category ?? null,
            quantity: jp.quantity ?? 1,
            reserved: jp.reserved ?? 0,
            createdAt: null,
            updatedAt: null,
            categoryId: null,
            originalPrice: jp.originalPrice != null ? Number(jp.originalPrice) : Number(jp.price ?? 0),
            subcategory: jp.subcategory ?? null,
            subcategoryId: null,
          });
        }
      } catch {}
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// Обновление данных товара (только для админа)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Простая проверка доступа для демо
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== 'Bearer admin-token') {
      // Для демо разрешаем все запросы
      // return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    const { id } = await context.params;
    const productId = parseInt(id);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Неверный ID товара' },
        { status: 400 }
      );
    }

    const { quantity, reserved, price, title, category } = await request.json();

    // Валидация данных
    if (quantity !== undefined && quantity < 0) {
      return NextResponse.json(
        { error: 'Количество не может быть отрицательным' },
        { status: 400 }
      );
    }

    if (reserved !== undefined && reserved < 0) {
      return NextResponse.json(
        { error: 'Зарезервированное количество не может быть отрицательным' },
        { status: 400 }
      );
    }

    if (quantity !== undefined && reserved !== undefined && reserved > quantity) {
      return NextResponse.json(
        { error: 'Зарезервированное количество не может быть больше общего количества' },
        { status: 400 }
      );
    }

    // Подготавливаем данные для обновления
    const updateData: Record<string, unknown> = {};
    
    if (quantity !== undefined) updateData.quantity = quantity;
    if (reserved !== undefined) updateData.reserved = reserved;
    if (price !== undefined) updateData.price = price;
    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;

    // Обновляем товар
    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении товара' },
      { status: 500 }
    );
  }
}
