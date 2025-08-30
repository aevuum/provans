import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { categoryName, isNew } = await request.json();
    const { id } = await context.params;
    const productId = parseInt(id);

    if (!productId || !categoryName) {
      return NextResponse.json(
        { error: 'ID товара и название категории обязательны' },
        { status: 400 }
      );
    }

    // Сначала найдем или создадим категорию
    let category = await prisma.category.findFirst({
      where: { name: categoryName }
    });

    if (!category) {
      // Создаем новую категорию
      const slug = categoryName
        .toLowerCase()
        .replace(/[^a-zа-я0-9\s]/gi, '')
        .replace(/\s+/g, '-');

      category = await prisma.category.create({
        data: {
          name: categoryName,
          slug: slug,
          isActive: true,
          sortOrder: 0
        }
      });
    }

    // Обновляем товар
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        category: categoryName,
        categoryId: category.id,
        // Если отмечен как новый, устанавливаем дату создания на текущее время
        ...(isNew && { createdAt: new Date() })
      }
    });

    return NextResponse.json({ 
      success: true, 
      product: updatedProduct,
      category: category
    });
    
  } catch (error) {
    console.error('Error categorizing product:', error);
    return NextResponse.json(
      { error: 'Ошибка категоризации товара' },
      { status: 500 }
    );
  }
}
