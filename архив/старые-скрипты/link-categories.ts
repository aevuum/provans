import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function linkProductsToCategories() {
  try {
    console.log('=== ПРИВЯЗКА ТОВАРОВ К КАТЕГОРИЯМ ===');
    
    // Получаем все категории и подкатегории
    const categories = await prisma.category.findMany({
      include: { subcategories: true }
    });
    
    // Создаем мапы для быстрого поиска
    const categoryMap = new Map();
    const subcategoryMap = new Map();
    
    categories.forEach(cat => {
      categoryMap.set(cat.name.toLowerCase(), cat.id);
      categoryMap.set(cat.slug.toLowerCase(), cat.id);
      
      cat.subcategories.forEach(sub => {
        subcategoryMap.set(sub.name.toLowerCase(), { categoryId: cat.id, subcategoryId: sub.id });
        subcategoryMap.set(sub.slug.toLowerCase(), { categoryId: cat.id, subcategoryId: sub.id });
      });
    });
    
    // Маппинг текстовых категорий к ID
    const categoryMappings: { [key: string]: { categoryName: string; subcategoryName?: string } } = {
      'вазы': { categoryName: 'Декор', subcategoryName: 'Вазы' },
      'декор': { categoryName: 'Декор' },
      'текстиль': { categoryName: 'Текстиль' },
      'посуда': { categoryName: 'Посуда и бокалы' },
      'мебель': { categoryName: 'Мебель' },
      'цветы': { categoryName: 'Искусственные цветы' },
      'ароматы': { categoryName: 'Ароматы для дома и свечи' },
      'свечи': { categoryName: 'Ароматы для дома и свечи' },
      'новый год': { categoryName: 'Новый год' },
      'пасха': { categoryName: 'Пасхальная коллекция' },
    };
    
    let updatedCount = 0;
    
    // Получаем товары без categoryId
    const products = await prisma.product.findMany({
      where: { categoryId: null }
    });
    
    console.log(`Найдено ${products.length} товаров без привязки к категориям`);
    
    for (const product of products) {
      const categoryText = product.category?.toLowerCase().trim();
      
      if (categoryText && categoryMappings[categoryText]) {
        const mapping = categoryMappings[categoryText];
        
        // Находим ID категории
        const categoryId = categoryMap.get(mapping.categoryName.toLowerCase());
        let subcategoryId = null;
        
        // Если есть подкатегория, находим её ID
        if (mapping.subcategoryName) {
          const subcategoryData = subcategoryMap.get(mapping.subcategoryName.toLowerCase());
          if (subcategoryData) {
            subcategoryId = subcategoryData.subcategoryId;
          }
        }
        
        if (categoryId) {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              categoryId,
              subcategoryId
            }
          });
          
          updatedCount++;
          
          if (updatedCount % 50 === 0) {
            console.log(`Обновлено ${updatedCount} товаров...`);
          }
        }
      }
    }
    
    console.log(`\n✅ Обновлено ${updatedCount} товаров`);
    
    // Проверяем результат
    const categoriesWithCounts = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    
    console.log('\n📊 Результат:');
    categoriesWithCounts.forEach(cat => {
      console.log(`  ${cat.name}: ${cat._count.products} товаров`);
    });
    
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

linkProductsToCategories();
