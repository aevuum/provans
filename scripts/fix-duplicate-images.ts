import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface Product {
  id: number;
  title: string;
  image: string | null;
  images: string[];
}

async function fixDuplicateImages() {
  console.log('🔍 Начинаем исправление дублированных изображений...');
  
  try {
    // Получаем все товары
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        image: true,
        images: true,
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log(`📦 Найдено товаров: ${products.length}`);

    // Группируем по названиям (без учета регистра и лишних пробелов)
    const groupedByTitle = new Map<string, Product[]>();
    
    for (const product of products) {
      if (!product.title) continue;
      
      const normalizedTitle = product.title.trim().toLowerCase();
      if (!groupedByTitle.has(normalizedTitle)) {
        groupedByTitle.set(normalizedTitle, []);
      }
      groupedByTitle.get(normalizedTitle)!.push(product);
    }

    // Обрабатываем только группы с несколькими товарами
    const duplicateGroups = Array.from(groupedByTitle.entries()).filter(([_, items]) => items.length > 1);
    
    console.log(`🔄 Найдено групп с дублированными названиями: ${duplicateGroups.length}`);

    let fixedCount = 0;
    let errorsCount = 0;

    for (const [normalizedTitle, items] of duplicateGroups) {
      const displayTitle = items[0].title; // Берем оригинальное название для отображения
      console.log(`\n📝 Обрабатываем группу: "${displayTitle}" (${items.length} товаров)`);
      
      for (let i = 0; i < items.length; i++) {
        const product = items[i];
        const isFirst = i === 0;
        
        try {
          if (!product.image) {
            console.log(`⚠️ ID ${product.id}: Нет изображения`);
            continue;
          }

          // Для первого товара проверяем, что его изображение существует
          if (isFirst) {
            const fullPath = path.join(process.cwd(), 'public', product.image);
            if (fs.existsSync(fullPath)) {
              console.log(`✅ ID ${product.id}: Оставляем оригинальное изображение ${product.image}`);
              continue;
            }
          }

          // Для остальных товаров ищем альтернативные изображения
          const baseImageName = getBaseImageName(product.image);
          const baseName = path.basename(baseImageName, path.extname(baseImageName));
          const dir = path.dirname(baseImageName);
          const publicDir = path.join(process.cwd(), 'public');
          const dirPath = path.join(publicDir, dir);

          if (!fs.existsSync(dirPath)) {
            console.log(`❌ ID ${product.id}: Папка не существует ${dirPath}`);
            errorsCount++;
            continue;
          }

          const files = fs.readdirSync(dirPath);
          const extensions = ['.jpeg', '.jpg', '.png', '.webp'];
          let found = false;

          // Ищем файлы с суффиксами
          for (let num = 2; num <= 10; num++) {
            for (const ext of extensions) {
              const candidateName = `${baseName} ${num}${ext}`;
              if (files.includes(candidateName)) {
                const newImagePath = path.join(dir, candidateName).replace(/\\/g, '/');
                
                await prisma.product.update({
                  where: { id: product.id },
                  data: {
                    image: newImagePath,
                    images: [newImagePath]
                  }
                });
                
                console.log(`✅ ID ${product.id}: ${product.image} → ${newImagePath}`);
                fixedCount++;
                found = true;
                break;
              }
            }
            if (found) break;
          }

          if (!found) {
            console.log(`❌ ID ${product.id}: Альтернативное изображение не найдено для "${baseName}"`);
            errorsCount++;
          }

        } catch (error) {
          console.error(`❌ Ошибка при обработке товара ${product.id}:`, error);
          errorsCount++;
        }
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

function getBaseImageName(imagePath: string): string {
  if (!imagePath) return '';
  
  // Убираем ведущий слеш если есть
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  return cleanPath;
}

function addSuffixToImageName(imagePath: string, suffix: string): string {
  const ext = path.extname(imagePath);
  const nameWithoutExt = imagePath.replace(ext, '');
  return `${nameWithoutExt}${suffix}${ext}`;
}

async function findAlternativeImage(product: Product, suffix: string): Promise<boolean> {
  if (!product.image) return false;
  
  const publicDir = path.join(process.cwd(), 'public');
  const baseImageName = getBaseImageName(product.image);
  const baseName = path.basename(baseImageName, path.extname(baseImageName));
  const dir = path.dirname(baseImageName);
  
  // Проверяем файлы с суффиксами в той же папке
  const dirPath = path.join(publicDir, dir);
  
  if (!fs.existsSync(dirPath)) return false;
  
  const files = fs.readdirSync(dirPath);
  const extensions = ['.jpeg', '.jpg', '.png', '.webp'];
  
  for (const ext of extensions) {
    for (let num = 2; num <= 10; num++) {
      const candidateName = `${baseName} ${num}${ext}`;
      if (files.includes(candidateName)) {
        const newImagePath = path.join(dir, candidateName).replace(/\\/g, '/');
        
        try {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              image: newImagePath,
              images: [newImagePath]
            }
          });
          
          console.log(`✅ ID ${product.id}: Найдена альтернатива → ${newImagePath}`);
          return true;
        } catch (error) {
          console.error(`❌ Ошибка при обновлении ${product.id}:`, error);
        }
      }
    }
  }
  
  return false;
}

// Запускаем скрипт
fixDuplicateImages();
