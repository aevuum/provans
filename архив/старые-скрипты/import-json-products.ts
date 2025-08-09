import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ProductData {
  title: string;
  raw_title: string;
  image_path: string;
  price?: number;
}

async function importProductsFromJson() {
  try {
    console.log('🔄 Загружаем товары из products.json...\n');
    
    // Читаем JSON файл
    const jsonPath = path.join(process.cwd(), 'products.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    const products: ProductData[] = JSON.parse(jsonData);
    
    console.log(`📦 Найдено ${products.length} товаров в JSON файле\n`);
    
    // Очищаем существующие товары (опционально)
    const shouldClear = process.argv.includes('--clear');
    if (shouldClear) {
      console.log('🗑️ Удаляем существующие товары...');
      await prisma.product.deleteMany({});
      console.log('✅ Существующие товары удалены\n');
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    console.log('📥 Начинаем импорт товаров...\n');
    
    for (const [index, productData] of products.entries()) {
      try {
        // Валидация обязательных полей
        if (!productData.title || !productData.raw_title) {
          console.log(`⚠️ Пропускаем товар ${index + 1}: отсутствует название`);
          continue;
        }
        
        // Определяем категорию на основе raw_title
        const category = determineCategory(productData.raw_title);
        
        // Создаем товар
        await prisma.product.create({
          data: {
            title: productData.title.trim(),
            price: productData.price || 0,
            image: productData.image_path || null,
            category: category,
            isConfirmed: false, // Товары из JSON требуют модерации
            // Дополнительные поля можно добавить при необходимости
            size: extractSize(productData.title),
            material: null,
            country: null,
            barcode: null,
            comment: null,
            images: [], // Массив дополнительных изображений пока пустой
            quantity: 1,
            reserved: 0,
            discount: 0
          }
        });
        
        successCount++;
        
        if (successCount % 100 === 0) {
          console.log(`✅ Импортировано ${successCount} товаров...`);
        }
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Ошибка при импорте товара "${productData.title}":`, error);
      }
    }
    
    console.log(`\n🎉 Импорт завершен!`);
    console.log(`✅ Успешно импортировано: ${successCount} товаров`);
    console.log(`❌ Ошибок: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ Критическая ошибка при импорте:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Функция для определения категории на основе названия
function determineCategory(title: string): string {
  const name = title.toLowerCase();
  
  if (name.includes('ваза')) return 'вазы';
  if (name.includes('подсвечник')) return 'подсвечники';
  if (name.includes('фоторамка') || name.includes(' ф ')) return 'фоторамки';
  if (name.includes('шкатулка')) return 'шкатулки';
  if (name.includes('держатель')) return 'держатели';
  if (name.includes('роза') || name.includes('тюльпан') || name.includes('пион') || 
      name.includes('орхидея') || name.includes('букет')) return 'цветы';
  if (name.includes('ангел') || name.includes('балерина') || name.includes('фигур')) return 'фигуры';
  if (name.includes('свеча') || name.includes('свечи')) return 'свечи';
  if (name.includes('тарелка') || name.includes('блюдо') || name.includes('кружка') || 
      name.includes('чашка') || name.includes('посуда')) return 'посуда';
  if (name.includes('подушка') || name.includes('покрывал') || name.includes('плед')) return 'текстиль';
  if (name.includes('зеркало')) return 'зеркала';
  if (name.includes('часы')) return 'часы';
  if (name.includes('корзин')) return 'корзины';
  if (name.includes('лампа') || name.includes('светиль')) return 'светильники';
  if (name.includes('новый год') || name.includes('елочные') || name.includes('рождест')) return 'новый год';
  if (name.includes('пасха')) return 'пасха';
  
  return 'декор'; // Категория по умолчанию
}

// Функция для извлечения размеров из названия
function extractSize(title: string): string | null {
  // Ищем размеры в формате "число*число*число" или "число*число"
  const sizeMatch = title.match(/\d+(?:\.\d+)?[\*\s]+\d+(?:\.\d+)?(?:[\*\s]+\d+(?:\.\d+)?)?/);
  return sizeMatch ? sizeMatch[0].replace(/\s+/g, ' ').trim() : null;
}

// Запускаем импорт
importProductsFromJson();
