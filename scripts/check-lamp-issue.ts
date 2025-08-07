import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLampProducts() {
  try {
    console.log('🔍 Ищем товары с названием "лампа"...\n');
    
    // Ищем товары с названием "лампа"
    const lampProducts = await prisma.product.findMany({
      where: {
        title: {
          contains: 'лампа',
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        title: true,
        image: true,
        images: true
      },
      orderBy: { id: 'asc' }
    });
    
    console.log(`Найдено ${lampProducts.length} товаров со словом "лампа":\n`);
    
    lampProducts.forEach((product, index) => {
      console.log(`${index + 1}. Товар ID ${product.id}: "${product.title}"`);
      console.log(`   image: ${product.image || 'НЕТ'}`);
      console.log(`   images: ${product.images ? JSON.stringify(product.images) : 'НЕТ'}`);
      console.log('');
    });
    
    // Проверяем файлы фотографий
    const fs = require('fs');
    const path = require('path');
    
    const photoDir = path.join(process.cwd(), 'public', 'ФОТО');
    const photoFiles = fs.readdirSync(photoDir);
    
    console.log('🖼️ Ищем фото со словом "лампа" в папке ФОТО:\n');
    
    const lampPhotos = photoFiles.filter((file: string) => 
      file.toLowerCase().includes('лампа') || 
      file.toLowerCase().includes('светил') ||
      file.toLowerCase().includes('свет')
    );
    
    if (lampPhotos.length > 0) {
      lampPhotos.forEach((photo: string, index: number) => {
        console.log(`${index + 1}. ${photo}`);
      });
    } else {
      console.log('❌ Фото со словом "лампа", "светил" или "свет" не найдены');
    }
    
    console.log('\n🎯 Рекомендации:');
    console.log('1. Проверьте названия файлов фотографий в папке public/ФОТО');
    console.log('2. Убедитесь, что названия товаров точно совпадают с именами файлов');
    console.log('3. Используйте компонент PhotoMatchingComponent для автоматической привязки');
    console.log('4. Или загрузите фото вручную через PhotoUploader');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLampProducts();
