import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findDuplicateImages() {
  try {
    console.log('🔍 Ищем товары с одинаковыми изображениями...\n');
    
    const products = await prisma.product.findMany({
      select: { id: true, title: true, image: true },
      orderBy: { id: 'asc' }
    });
    
    // Группируем товары по изображениям
    const imageGroups: Record<string, typeof products> = {};
    
    products.forEach(product => {
      const image = product.image || 'NO_IMAGE';
      if (!imageGroups[image]) {
        imageGroups[image] = [];
      }
      imageGroups[image].push(product);
    });
    
    // Показываем группы с одинаковыми изображениями (больше 1 товара)
    let foundDuplicates = false;
    
    Object.entries(imageGroups).forEach(([image, productList]) => {
      if (productList.length > 1) {
        foundDuplicates = true;
        console.log(`📸 Изображение: ${image}`);
        productList.forEach((product, index) => {
          console.log(`  ${index + 1}. ID ${product.id}: "${product.title}"`);
        });
        console.log('');
      }
    });
    
    if (!foundDuplicates) {
      console.log('✅ Товаров с одинаковыми изображениями не найдено');
    }
    
    // Показываем статистику
    const noImageCount = imageGroups['NO_IMAGE']?.length || 0;
    console.log(`📊 Статистика:`);
    console.log(`   Всего товаров: ${products.length}`);
    console.log(`   Товаров без изображений: ${noImageCount}`);
    console.log(`   Уникальных изображений: ${Object.keys(imageGroups).length - (noImageCount > 0 ? 1 : 0)}`);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findDuplicateImages();
