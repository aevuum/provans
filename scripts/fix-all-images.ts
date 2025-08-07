import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function fixAllImageIssues() {
  console.log('🔧 Исправление всех проблем с изображениями...\n');
  
  try {
    let fixedCount = 0;
    let errorCount = 0;
    
    // 1. Исправляем пути без ведущего слеша
    console.log('1️⃣ Исправляем пути без ведущего слеша...');
    
    const productsWithBadPaths = await prisma.product.findMany({
      where: {
        OR: [
          {
            AND: [
              { image: { not: null } },
              { image: { not: '' } },
              { image: { not: { startsWith: '/' } } },
              { image: { not: { startsWith: 'http' } } }
            ]
          }
        ]
      },
      select: { id: true, image: true, images: true }
    });
    
    for (const product of productsWithBadPaths) {
      try {
        const updates: any = {};
        
        // Исправляем основное изображение
        if (product.image && !product.image.startsWith('/') && !product.image.startsWith('http')) {
          updates.image = `/${product.image}`;
        }
        
        // Исправляем массив изображений
        if (product.images && Array.isArray(product.images)) {
          const fixedImages = product.images.map((img: string) => {
            if (img && !img.startsWith('/') && !img.startsWith('http')) {
              return `/${img}`;
            }
            return img;
          }).filter(Boolean);
          
          if (JSON.stringify(fixedImages) !== JSON.stringify(product.images)) {
            updates.images = fixedImages;
          }
        }
        
        if (Object.keys(updates).length > 0) {
          await prisma.product.update({
            where: { id: product.id },
            data: updates
          });
          fixedCount++;
        }
        
      } catch (error) {
        console.error(`❌ Ошибка при обновлении товара ${product.id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`✅ Исправлено путей: ${fixedCount}`);
    
    // 2. Удаляем товары без изображений (если нужно)
    console.log('\n2️⃣ Проверяем товары без изображений...');
    
    const productsWithoutImages = await prisma.product.count({
      where: {
        AND: [
          {
            OR: [
              { image: null },
              { image: '' }
            ]
          },
          {
            OR: [
              { images: { equals: null } },
              { images: { equals: [] } }
            ]
          }
        ]
      }
    });
    
    console.log(`📊 Товаров без изображений: ${productsWithoutImages}`);
    
    // 3. Очистка недопустимых записей
    console.log('\n3️⃣ Очистка записей с недопустимыми путями...');
    
    const cleanedUp = await prisma.product.updateMany({
      where: {
        image: {
          in: ['undefined', 'null', '', 'ФОТО/', '/ФОТО/', 'uploads/', '/uploads/']
        }
      },
      data: {
        image: null
      }
    });
    
    console.log(`🧹 Очищено недопустимых записей: ${cleanedUp.count}`);
    
    console.log(`\n🎉 Исправление завершено!`);
    console.log(`✅ Исправлено: ${fixedCount}`);
    console.log(`❌ Ошибок: ${errorCount}`);
    console.log(`🧹 Очищено: ${cleanedUp.count}`);
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllImageIssues();
