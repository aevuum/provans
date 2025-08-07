import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProductStructure() {
  try {
    const product = await prisma.product.findFirst();
    
    console.log('=== СТРУКТУРА ТОВАРА ===');
    console.log(JSON.stringify(product, null, 2));
    
    // Проверим все поля которые есть
    if (product) {
      console.log('\n=== ЗАПОЛНЕННЫЕ ПОЛЯ ===');
      Object.entries(product).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          console.log(`${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
        }
      });
    }
    
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductStructure();
