import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDuplicateNames() {
  try {
    console.log('🔍 Ищем товары с дублирующимися названиями...');
    
    // Находим все товары, группируем по названию
    const duplicateGroups = await prisma.product.groupBy({
      by: ['title'],
      _count: {
        title: true
      },
      having: {
        title: {
          _count: {
            gt: 1
          }
        }
      }
    });
    
    console.log(`Найдено ${duplicateGroups.length} групп дублирующихся названий`);
    
    // Обрабатываем каждую группу дубликатов
    for (const group of duplicateGroups) {
      const products = await prisma.product.findMany({
        where: { title: group.title },
        orderBy: { id: 'asc' }
      });
      
      console.log(`\n🔄 Обрабатываем ${products.length} товаров с названием "${group.title}"`);
      
      // Первый товар остается с базовым названием, остальные получают номера
      for (let i = 1; i < products.length; i++) {
        const newTitle = `${group.title} ${i + 1}`;
        await prisma.product.update({
          where: { id: products[i].id },
          data: { title: newTitle }
        });
        console.log(`✅ Товар ID ${products[i].id}: "${newTitle}"`);
      }
    }
    
    console.log('\n🎉 Исправление дублирующихся названий завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка при исправлении названий:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicateNames();
