// scripts/import-new-products.ts
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import prisma from '../src/lib/prisma';

interface CSVProduct {
  'Фото': string;
  'название': string;
  'размер': string;
  'состав/материал': string;
  'цена': string;
  'Страна производста': string;
  'Штрихкод': string;
  'комментарий': string;
}

// Функция для нормализации названия файла
function normalizeFileName(name: string): string {
  return name
    .trim()
    .replace(/["""'']/g, '"') // Заменить различные кавычки на стандартные
    .replace(/\s+/g, ' ') // Заменить множественные пробелы одним
    .replace(/:/g, ':') // Нормализовать двоеточия
    .replace(/\//g, ':') // Заменить слеши на двоеточия для Windows совместимости
;
}

// Функция для поиска соответствующего изображения
function findMatchingImage(productName: string, imageFiles: string[]): string | null {
  const normalizedProductName = normalizeFileName(productName);
  
  // Ищем точное совпадение
  for (const imageFile of imageFiles) {
    const imageName = path.parse(imageFile).name;
    const normalizedImageName = normalizeFileName(imageName);
    
    if (normalizedImageName === normalizedProductName) {
      return `/ФОТО/${imageFile}`;
    }
  }
  
  // Ищем частичное совпадение
  for (const imageFile of imageFiles) {
    const imageName = path.parse(imageFile).name;
    const normalizedImageName = normalizeFileName(imageName);
    
    if (normalizedImageName.includes(normalizedProductName) || 
        normalizedProductName.includes(normalizedImageName)) {
      return `/ФОТО/${imageFile}`;
    }
  }
  
  return null;
}

// Функция для определения категории по названию
function getCategory(productName: string): string {
  const name = productName.toLowerCase();
  
  if (name.includes('ваза')) return 'Вазы';
  if (name.includes('подсвечник')) return 'Подсвечники';
  if (name.includes('фоторамка') || name.includes('ф ')) return 'Фоторамки';
  if (name.includes('шкатулка')) return 'Шкатулки';
  if (name.includes('держатель') || name.includes('книгодержатель')) return 'Книгодержатели';
  if (name.includes('роза') || name.includes('тюльпан') || name.includes('пион') || 
      name.includes('орхидея') || name.includes('георгин') || name.includes('калина') ||
      name.includes('сирень') || name.includes('эремрус') || name.includes('эустома') ||
      name.includes('яблоня') || name.includes('ветка') || name.includes('лотос') ||
      name.includes('дендробиум') || name.includes('гортензия') || name.includes('целозия')) {
    return 'Цветы';
  }
  
  // Если это фигурка/статуэтка
  if (name.includes('фигура') || name.includes('статуэтка') || name.includes('ангел') ||
      name.includes('будда') || name.includes('клоун') || name.includes('балерина') ||
      name.includes('девочка') || name.includes('мальчик') || name.includes('мама') ||
      name.includes('папа') || name.includes('ребенок') || name.includes('заяц') ||
      name.includes('зайчик') || name.includes('кролик') || name.includes('собака') ||
      name.includes('кот') || name.includes('лис') || name.includes('орел') ||
      name.includes('попугай') || name.includes('птица') || name.includes('слон') ||
      name.includes('панда') || name.includes('мишка') || name.includes('микки') ||
      name.includes('гусь') || name.includes('лягушка') || name.includes('носорог') ||
      name.includes('улитка') || name.includes('кузнечик') || name.includes('конь') ||
      name.includes('цыпленок') || name.includes('бюст') || name.includes('индус') ||
      name.includes('гимнастка') || name.includes('близнецы')) {
    return 'Фигуры';
  }
  
  return 'Декор';
}

async function importProducts() {
  try {
    console.log('Начинаем импорт товаров из новой таблицы...');
    
    // Читаем CSV файл
    const csvFilePath = '/Users/haibura/Desktop/numbers1/number 2.csv';
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    // Парсим CSV с точкой с запятой как разделителем
    const records: CSVProduct[] = parse(csvContent, {
      columns: true,
      delimiter: ';',
      skip_empty_lines: true,
      trim: true
    });
    
    // Получаем список всех изображений
    const photosDir = '/Users/haibura/provans-decor/public/ФОТО';
    const imageFiles = fs.readdirSync(photosDir).filter(file => 
      /\.(jpg|jpeg|png)$/i.test(file)
    );
    
    console.log(`Найдено ${records.length} товаров в CSV`);
    console.log(`Найдено ${imageFiles.length} изображений в папке ФОТО`);
    
    // Очищаем старые товары (опционально)
    // await prisma.product.deleteMany({});
    // console.log('Удалены все старые товары');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const record of records) {
      try {
        // Пропускаем записи без названия
        if (!record.название || record.название.trim() === '') {
          continue;
        }
        
        const productName = record.название.trim();
        const price = parseFloat(record.цена) || 0;
        
        // Ищем соответствующее изображение
        const imageFile = findMatchingImage(productName, imageFiles);
        
        // Создаем товар
        const product = await prisma.product.create({
          data: {
            title: productName,
            price: price,
            category: getCategory(productName),
            material: record['состав/материал'] || null,
            size: record.размер || null,
            country: record['Страна производста'] || null,
            barcode: record['Штрихкод'] || null,
            comment: record.комментарий || null,
            image: imageFile,
            images: imageFile ? [imageFile] : [],
            isConfirmed: true, // Автоматически подтверждаем импортированные товары
            discount: 0 // По умолчанию без скидки
          }
        });
        
        console.log(`✅ Импортирован: ${productName} ${imageFile ? '(с фото)' : '(без фото)'}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Ошибка при импорте товара "${record.название}":`, error);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Импорт завершен!`);
    console.log(`✅ Успешно импортировано: ${successCount} товаров`);
    console.log(`❌ Ошибок: ${errorCount}`);
    
    // Статистика по изображениям
    const productsWithImages = await prisma.product.count({
      where: { image: { not: null } }
    });
    const totalProducts = await prisma.product.count();
    
    console.log(`📸 Товаров с изображениями: ${productsWithImages}/${totalProducts}`);
    
  } catch (error) {
    console.error('Ошибка при импорте:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск импорта
importProducts();
