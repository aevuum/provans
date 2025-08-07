import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAllProductsQuantity() {
  try {
    console.log('Обновляем количество всех товаров на 1...');
    
    const result = await prisma.product.updateMany({
      data: {
        quantity: 1
      }
    });
    
    console.log(`Обновлено товаров: ${result.count}`);
    
    // Проверяем результат
    const totalProducts = await prisma.product.count();
    const productsWithQuantityOne = await prisma.product.count({
      where: {
        quantity: 1
      }
    });
    
    console.log(`Всего товаров: ${totalProducts}`);
    console.log(`Товаров с количеством 1: ${productsWithQuantityOne}`);
    
  } catch (error) {
    console.error('Ошибка при обновлении количества товаров:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllProductsQuantity();
