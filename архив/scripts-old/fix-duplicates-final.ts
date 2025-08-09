import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function fixDuplicateImagesComplete() {
  console.log('🔍 Комплексное исправление дублированных изображений...\n');
  
  try {
    // Находим все дублированные названия
    const duplicates = await prisma.$queryRaw<Array<{title: string, count: bigint}>>`
      SELECT title, COUNT(*) as count 
      FROM "Product" 
      WHERE title IS NOT NULL AND title != ''
      GROUP BY title 
      HAVING COUNT(*) > 1 
      ORDER BY count DESC, title
    `;
    
    console.log(`📝 Найдено ${duplicates.length} групп с дублированными названиями\n`);
    
    let totalFixed = 0;
    let totalErrors = 0;
    
    for (const dup of duplicates) {
      console.log(`\n📦 Обрабатываем группу: "${dup.title}" (${dup.count} товаров)`);
      
      // Получаем все товары с этим названием
      const products = await prisma.product.findMany({
        where: { title: dup.title },
        select: { id: true, title: true, image: true, images: true },
        orderBy: { id: 'asc' }
      });
      
      // Обрабатываем каждый товар
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        console.log(`   ID ${product.id}: ${product.image || 'НЕТ ИЗОБРАЖЕНИЯ'}`);
        
        if (i === 0) {
          // Для первого товара проверяем, существует ли его изображение
          if (product.image) {
            const firstImagePath = path.join(process.cwd(), 'public', product.image);
            if (fs.existsSync(firstImagePath)) {
              console.log(`   ✅ Первое изображение существует`);
            } else {
              console.log(`   ⚠️ Первое изображение не найдено, ищем альтернативу...`);
              const found = await assignAlternativeImage(product, '');
              if (found) {
                totalFixed++;
                console.log(`   ✅ Назначено: ${found}`);
              } else {
                totalErrors++;
              }
            }
          }
        } else {
          // Для остальных товаров ищем изображения с суффиксами
          const found = await assignAlternativeImage(product, ` ${i + 1}`);
          if (found) {
            totalFixed++;
            console.log(`   ✅ Назначено: ${found}`);
          } else {
            // Пробуем альтернативные варианты нумерации
            const altFound = await assignAlternativeImage(product, `${i + 1}`);
            if (altFound) {
              totalFixed++;
              console.log(`   ✅ Назначено (альт): ${altFound}`);
            } else {
              totalErrors++;
              console.log(`   ❌ Не найдено подходящее изображение`);
            }
          }
        }
      }
    }
    
    // Итоговый отчет
    console.log(`\n📊 Итоговая статистика:`);
    console.log(`✅ Исправлено товаров: ${totalFixed}`);
    console.log(`❌ Ошибок: ${totalErrors}`);
    console.log(`📝 Обработано групп: ${duplicates.length}`);
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function assignAlternativeImage(product: any, suffix: string): Promise<string | null> {
  if (!product.image) return null;
  
  const publicDir = path.join(process.cwd(), 'public');
  const originalPath = product.image;
  const dir = path.dirname(originalPath);
  const ext = path.extname(originalPath);
  const baseName = path.basename(originalPath, ext);
  
  // Убираем цифры в конце базового имени если они есть
  const cleanBaseName = baseName.replace(/\s*\d+\s*$/, '').trim();
  
  // Варианты для поиска
  const candidates = [
    `${cleanBaseName}${suffix}${ext}`,
    `${cleanBaseName} ${suffix.trim()}${ext}`,
    `${baseName}${suffix}${ext}`,
  ].filter((name, index, arr) => arr.indexOf(name) === index); // убираем дубликаты
  
  for (const candidate of candidates) {
    const candidatePath = path.join(dir, candidate);
    const fullPath = path.join(publicDir, candidatePath);
    
    if (fs.existsSync(fullPath)) {
      try {
        // Обновляем товар в базе (добавляем ведущий слеш если его нет)
        const normalizedPath = candidatePath.startsWith('/') ? candidatePath : `/${candidatePath}`;
        await prisma.product.update({
          where: { id: product.id },
          data: {
            image: normalizedPath,
            images: [normalizedPath]
          }
        });
        
        return normalizedPath;
      } catch (error) {
        console.error(`   ❌ Ошибка при обновлении товара ${product.id}:`, error);
      }
    }
  }
  
  return null;
}

// Запускаем скрипт
fixDuplicateImagesComplete();
