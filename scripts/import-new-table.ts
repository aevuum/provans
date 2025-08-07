// scripts/import-new-table.ts
import prisma from '../src/lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

// Функция для нормализации названия для поиска фото
function normalizeProductName(name: string): string {
  // Удаляем специальные символы и приводим к нижнему регистру
  return name
    .toLowerCase()
    .replace(/[""«»]/g, '"')  // Заменяем разные кавычки
    .replace(/[()]/g, '')      // Удаляем скобки
    .replace(/[/\\]/g, ':')    // Заменяем слеши на двоеточия
    .replace(/\s+/g, ' ')      // Нормализуем пробелы
    .trim();
}

// Функция для поиска соответствующего фото
function findMatchingPhoto(productName: string, photoFiles: string[]): string | null {
  const normalizedName = normalizeProductName(productName);
  
  // Сначала ищем точное совпадение
  for (const photo of photoFiles) {
    const photoNameNormalized = normalizeProductName(
      photo.replace(' — копия.jpeg', '').replace(' — копия.jpg', '').replace(' — копия.png', '')
    );
    
    if (photoNameNormalized === normalizedName) {
      return `/ФОТО/${photo}`;
    }
  }
  
  // Если точного совпадения нет, ищем частичное
  for (const photo of photoFiles) {
    const photoNameNormalized = normalizeProductName(
      photo.replace(' — копия.jpeg', '').replace(' — копия.jpg', '').replace(' — копия.png', '')
    );
    
    if (photoNameNormalized.includes(normalizedName) || normalizedName.includes(photoNameNormalized)) {
      return `/ФОТО/${photo}`;
    }
  }
  
  return null;
}

async function importNewTable() {
  try {
    console.log('Начинаем импорт новой таблицы...');
    
    // Читаем новую таблицу
    const csvContent = fs.readFileSync('/Users/haibura/Desktop/numbers1/таблица.csv', 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Получаем список фотографий
    const photoDir = '/Users/haibura/provans-decor/public/ФОТО';
    const photoFiles = fs.readdirSync(photoDir).filter(file => 
      file.toLowerCase().includes('копия') && 
      (file.endsWith('.jpeg') || file.endsWith('.jpg') || file.endsWith('.png'))
    );
    
    console.log(`Найдено ${photoFiles.length} фотографий`);
    
    // Удаляем все существующие товары (опционально)
    // await prisma.product.deleteMany({});
    // console.log('Старые товары удалены');
    
    let imported = 0;
    let skipped = 0;
    
    // Пропускаем заголовок и обрабатываем каждую строку
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      const columns = line.split(';');
      if (columns.length < 5) continue;
      
      const [, название, размер, материал, ценаStr, страна, штрихкод, комментарий] = columns;
      
      if (!название || !ценаStr) {
        skipped++;
        continue;
      }
      
      // Парсим цену
      const price = parseFloat(ценаStr) || 0;
      if (price === 0) {
        skipped++;
        continue;
      }
      
      // Определяем категорию по названию
      let category = 'другое';
      const nameUpper = название.toUpperCase();
      
      if (nameUpper.includes('ВАЗА')) category = 'вазы';
      else if (nameUpper.includes('ФОТОРАМКА') || nameUpper.includes('Ф ')) category = 'фоторамки';
      else if (nameUpper.includes('ПОДСВЕЧНИК')) category = 'подсвечники';
      else if (nameUpper.includes('ШКАТУЛКА')) category = 'шкатулки';
      else if (nameUpper.includes('КНИГОДЕРЖАТЕЛ')) category = 'книгодержатели';
      else if (nameUpper.includes('ФИГУР') || nameUpper.includes('СТАТУЭТ') || 
               nameUpper.includes('АНГЕЛ') || nameUpper.includes('ЗАЯЦ') || 
               nameUpper.includes('КРОЛИК') || nameUpper.includes('СОБАКА')) category = 'фигуры';
      else if (nameUpper.includes('РОЗА') || nameUpper.includes('ПИОН') || 
               nameUpper.includes('ТЮЛЬПАН') || nameUpper.includes('ОРХИДЕЯ') ||
               nameUpper.includes('ЭУСТОМА') || nameUpper.includes('ЛОТОС')) category = 'цветы';
      
      // Ищем соответствующее фото
      const image = findMatchingPhoto(название, photoFiles);
      
      try {
        await prisma.product.create({
          data: {
            title: название.trim(),
            price: price,
            comment: комментарий?.trim() || '',
            category: category,
            size: размер?.trim() || '',
            material: материал?.trim() || '',
            country: страна?.trim() || '',
            barcode: штрихкод?.trim() || '',
            image: image,
            images: image ? [image] : [],
            isConfirmed: true, // Автоматически подтверждаем товары
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        
        imported++;
        
        if (imported % 50 === 0) {
          console.log(`Импортировано ${imported} товаров...`);
        }
        
      } catch (error) {
        console.error(`Ошибка импорта товара "${название}":`, error);
        skipped++;
      }
    }
    
    console.log(`\n✅ Импорт завершен!`);
    console.log(`📦 Импортировано: ${imported} товаров`);
    console.log(`⚠️ Пропущено: ${skipped} товаров`);
    console.log(`🖼️ С фотографиями: ${imported} товаров`);
    
  } catch (error) {
    console.error('❌ Ошибка импорта:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем импорт
importNewTable();
