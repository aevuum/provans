import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function analyzeAndFixDatabase() {
  console.log('🔍 Анализируем базу данных и исправляем проблемы...\n');
  
  try {
    // 1. Проверяем дублированные названия
    console.log('📝 1. Поиск дублированных названий товаров:');
    const duplicates = await prisma.$queryRaw<Array<{title: string, count: bigint}>>`
      SELECT title, COUNT(*) as count 
      FROM "Product" 
      WHERE title IS NOT NULL AND title != ''
      GROUP BY title 
      HAVING COUNT(*) > 1 
      ORDER BY count DESC, title
    `;
    
    console.log(`   Найдено ${duplicates.length} групп с дублированными названиями\n`);
    
    let fixedImages = 0;
    
    for (const dup of duplicates.slice(0, 10)) { // Показываем первые 10
      console.log(`📦 "${dup.title}" - ${dup.count} товаров`);
      
      // Получаем все товары с этим названием
      const products = await prisma.product.findMany({
        where: { title: dup.title },
        select: { id: true, title: true, image: true, images: true },
        orderBy: { id: 'asc' }
      });
      
      // Исправляем изображения для дублированных товаров
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        console.log(`   ID ${product.id}: ${product.image || 'НЕТ ИЗОБРАЖЕНИЯ'}`);
        
        if (i > 0 && product.image) { // Для второго и последующих товаров
          const result = await findAndAssignAlternativeImage(product, i + 1);
          if (result) {
            fixedImages++;
            console.log(`   ✅ Обновлено: ${result}`);
          }
        }
      }
      console.log('');
    }
    
    // 2. Проверяем категории
    console.log('🏷️ 2. Анализ категорий:');
    const categoryStats = await prisma.$queryRaw<Array<{category: string, count: bigint}>>`
      SELECT category, COUNT(*) as count 
      FROM "Product" 
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category 
      ORDER BY count DESC
    `;
    
    console.log('   Товары по категориям:');
    categoryStats.forEach(stat => {
      console.log(`   ${stat.category}: ${stat.count} товаров`);
    });
    
    // 3. Проверяем доступность изображений
    console.log('\n🖼️ 3. Проверка доступности изображений:');
    const productsWithImages = await prisma.product.findMany({
      where: { 
        image: { not: null },
        isConfirmed: true 
      },
      select: { id: true, image: true },
      take: 50 // Проверяем первые 50
    });
    
    let missingImages = 0;
    let existingImages = 0;
    
    for (const product of productsWithImages) {
      if (product.image) {
        const fullPath = path.join(process.cwd(), 'public', product.image);
        if (fs.existsSync(fullPath)) {
          existingImages++;
        } else {
          missingImages++;
          console.log(`   ❌ Отсутствует: ${product.image} (ID: ${product.id})`);
        }
      }
    }
    
    console.log(`   ✅ Существует: ${existingImages} изображений`);
    console.log(`   ❌ Отсутствует: ${missingImages} изображений`);
    
    // 4. Итоговая статистика
    console.log('\n📊 Итоговая статистика:');
    console.log(`   Исправлено изображений для дублированных товаров: ${fixedImages}`);
    console.log(`   Всего категорий: ${categoryStats.length}`);
    console.log(`   Основные категории: ${categoryStats.slice(0, 5).map(s => s.category).join(', ')}`);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function findAndAssignAlternativeImage(product: any, number: number): Promise<string | null> {
  if (!product.image) return null;
  
  const publicDir = path.join(process.cwd(), 'public');
  const baseImagePath = product.image;
  const dir = path.dirname(baseImagePath);
  const ext = path.extname(baseImagePath);
  const baseName = path.basename(baseImagePath, ext);
  
  // Попробуем найти файлы с номерами
  const candidates = [
    `${baseName} ${number}${ext}`,
    `${baseName}${number}${ext}`,
    `${baseName} (${number})${ext}`,
  ];
  
  for (const candidate of candidates) {
    const candidatePath = path.join(dir, candidate);
    const fullPath = path.join(publicDir, candidatePath);
    
    if (fs.existsSync(fullPath)) {
      // Обновляем товар в базе
      await prisma.product.update({
        where: { id: product.id },
        data: {
          image: candidatePath,
          images: [candidatePath]
        }
      });
      
      return candidatePath;
    }
  }
  
  return null;
}

analyzeAndFixDatabase();
