import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('=== ПРОВЕРКА ДАННЫХ ===');
    
    // Проверяем категории
    const categories = await prisma.category.findMany({
      include: {
        subcategories: true,
        _count: {
          select: { products: true }
        }
      }
    });
    
    console.log(`\n📁 Категории (${categories.length}):`);
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat._count.products} товаров, ${cat.subcategories.length} подкатегорий)`);
    });
    
    // Проверяем товары
    const productsCount = await prisma.product.count();
    console.log(`\n📦 Всего товаров: ${productsCount}`);
    
    if (productsCount > 0) {
      const sampleProducts = await prisma.product.findMany({
        take: 3,
        include: {
          categoryModel: true,
          subcategoryModel: true
        }
      });
      
      console.log('\n📝 Примеры товаров:');
      sampleProducts.forEach(product => {
        console.log(`  - ${product.title}`);
        console.log(`    Категория: ${product.categoryModel?.name || product.category || 'Не указана'}`);
        console.log(`    Цена: ${product.price}₽`);
        console.log(`    Изображения: ${product.images?.length || 0}`);
        console.log(`    categoryId: ${product.categoryId}`);
      });
    }
    
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
