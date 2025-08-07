import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicates() {
  console.log('🔍 Проверяем дублированные названия товаров...');
  
  try {
    // SQL запрос для поиска дублированных названий
    const duplicates = await prisma.$queryRaw<Array<{title: string, count: bigint}>>`
      SELECT title, COUNT(*) as count 
      FROM "Product" 
      WHERE title IS NOT NULL 
      GROUP BY title 
      HAVING COUNT(*) > 1 
      ORDER BY count DESC
    `;
    
    console.log(`📊 Найдено групп с дублированными названиями: ${duplicates.length}`);
    
    for (const dup of duplicates) {
      console.log(`\n📝 "${dup.title}" - ${dup.count} товаров`);
      
      // Получаем все товары с этим названием
      const products = await prisma.product.findMany({
        where: { title: dup.title },
        select: { id: true, title: true, image: true, images: true },
        orderBy: { id: 'asc' }
      });
      
      products.forEach((product, index) => {
        console.log(`  ID ${product.id}: ${product.image || 'НЕТ ИЗОБРАЖЕНИЯ'}`);
      });
    }
    
    // Проверяем категории
    console.log('\n🏷️ Проверяем категории...');
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true, isActive: true }
    });
    
    console.log('Доступные категории:');
    categories.forEach(cat => {
      console.log(`  ${cat.slug} (${cat.name}) - ${cat.isActive ? 'активна' : 'неактивна'}`);
    });
    
    // Проверяем товары по категориям
    console.log('\n📦 Товары по категориям:');
    const categoryStats = await prisma.$queryRaw<Array<{category: string, count: bigint}>>`
      SELECT category, COUNT(*) as count 
      FROM "Product" 
      WHERE category IS NOT NULL 
      GROUP BY category 
      ORDER BY count DESC
    `;
    
    categoryStats.forEach(stat => {
      console.log(`  ${stat.category}: ${stat.count} товаров`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicates();
