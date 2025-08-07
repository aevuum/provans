import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function fixImagePaths() {
  console.log('🔍 Начинаем исправление путей к изображениям...');
  
  try {
    // Получаем все товары
    const products = await prisma.product.findMany();
    console.log(`📦 Найдено товаров: ${products.length}`);
    
    let fixedCount = 0;
    let errorsCount = 0;
    
    for (const product of products) {
      try {
        let needsUpdate = false;
        let newImage = product.image;
        let newImages = product.images;
        
        // Исправляем основное изображение
        if (product.image && product.image.startsWith('/uploads/ФОТО/')) {
          const correctedPath = product.image.replace('/uploads/ФОТО/', '/ФОТО/');
          const filePath = path.join(process.cwd(), 'public', correctedPath);
          
          if (fs.existsSync(filePath)) {
            newImage = correctedPath;
            needsUpdate = true;
            console.log(`✅ Исправлен путь: ${product.image} -> ${correctedPath}`);
          } else {
            console.log(`❌ Файл не найден: ${filePath}`);
            errorsCount++;
          }
        }
        
        // Исправляем массив изображений
        if (product.images && Array.isArray(product.images)) {
          const correctedImages = product.images.map(img => {
            if (typeof img === 'string' && img.startsWith('/uploads/ФОТО/')) {
              const correctedPath = img.replace('/uploads/ФОТО/', '/ФОТО/');
              const filePath = path.join(process.cwd(), 'public', correctedPath);
              
              if (fs.existsSync(filePath)) {
                console.log(`✅ Исправлен путь в массиве: ${img} -> ${correctedPath}`);
                return correctedPath;
              } else {
                console.log(`❌ Файл не найден: ${filePath}`);
                errorsCount++;
                return img;
              }
            }
            return img;
          });
          
          if (JSON.stringify(correctedImages) !== JSON.stringify(product.images)) {
            newImages = correctedImages;
            needsUpdate = true;
          }
        }
        
        // Обновляем товар если нужно
        if (needsUpdate) {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              image: newImage,
              images: newImages
            }
          });
          fixedCount++;
        }
        
      } catch (error) {
        console.error(`❌ Ошибка при обработке товара ${product.id}:`, error);
        errorsCount++;
      }
    }
    
    console.log(`\n📊 Результаты:`);
    console.log(`✅ Исправлено товаров: ${fixedCount}`);
    console.log(`❌ Ошибок: ${errorsCount}`);
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Также исправим названия товаров
async function fixProductTitles() {
  console.log('\n🔍 Начинаем исправление названий товаров...');
  
  try {
    const products = await prisma.product.findMany();
    let fixedCount = 0;
    
    for (const product of products) {
      let newTitle = product.title;
      let needsUpdate = false;
      
      // Исправляем известные ошибки
      const corrections = {
        'ион гибрид': 'пион гибрид',
        'ион желтый': 'пион желтый',
        'ион белый': 'пион белый',
        'ион с бутоном': 'пион с бутоном',
        'увшин': 'кувшин',
        'оторамка': 'фоторамка',
        'арфоровая': 'фарфоровая'
      };
      
      for (const [wrong, correct] of Object.entries(corrections)) {
        if (product.title.toLowerCase().includes(wrong.toLowerCase())) {
          newTitle = newTitle.replace(new RegExp(wrong, 'gi'), correct);
          needsUpdate = true;
        }
      }
      
      // Форматируем название: первая буква заглавная
      const words = newTitle.toLowerCase().split(' ');
      const formattedTitle = words.map(word => {
        // Специальные сокращения оставляем как есть
        if (['см', 'мм', 'кг', 'гр', 'мл', 'л', 'и', 'с', 'на', 'в', 'по', 'от', 'до'].includes(word)) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(' ');
      
      if (formattedTitle !== product.title) {
        newTitle = formattedTitle;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await prisma.product.update({
          where: { id: product.id },
          data: { title: newTitle }
        });
        
        console.log(`✅ ${product.title} -> ${newTitle}`);
        fixedCount++;
      }
    }
    
    console.log(`\n📊 Исправлено названий: ${fixedCount}`);
    
  } catch (error) {
    console.error('❌ Ошибка при исправлении названий:', error);
  }
}

async function main() {
  await fixImagePaths();
  await fixProductTitles();
}

main().catch(console.error);
