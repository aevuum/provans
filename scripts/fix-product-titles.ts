import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Словарь исправлений для названий товаров
const titleCorrections: Record<string, string> = {
  // Исправление дублирования слов
  'Ваза аза': 'Ваза',
  'Ваза аза мешок': 'Ваза-мешок',
  
  // Исправление грамматических ошибок
  'Картина увшин молочный с узором по горляшку': 'Кувшин молочный с узорами',
  'Кувшин молочнй': 'Кувшин молочный',
  'увшин': 'кувшин',
  'горляшку': 'горлышку',
  'молочнй': 'молочный',
  
  // Исправление опечаток
  'фигура ': 'фигурка ',
  'подсвечик': 'подсвечник',
  'зеркало': 'зеркало',
  'рамка': 'рамка',
  'ароматы': 'ароматы',
  'текстил': 'текстиль',
  'посуд': 'посуда',
  'мебел': 'мебель',
  
  // Убираем лишние пробелы и символы
  '  ': ' ',
  ' .': '.',
  ' ,': ',',
  '..': '.',
  ',,': ',',
};

// Функция для очистки и исправления названия
function correctTitle(title: string): string {
  let correctedTitle = title.trim();
  
  // Применяем все исправления
  Object.entries(titleCorrections).forEach(([wrong, correct]) => {
    const regex = new RegExp(wrong, 'gi');
    correctedTitle = correctedTitle.replace(regex, correct);
  });
  
  // Удаляем дублирующиеся слова подряд
  correctedTitle = correctedTitle.replace(/\b(\w+)\s+\1\b/gi, '$1');
  
  // Исправляем регистр - первая буква заглавная
  correctedTitle = correctedTitle.charAt(0).toUpperCase() + correctedTitle.slice(1).toLowerCase();
  
  // Исправляем капитализацию после точек и запятых
  correctedTitle = correctedTitle.replace(/([.!?]\s+|^)(\w)/g, (match, punct, letter) => 
    punct + letter.toUpperCase()
  );
  
  // Убираем лишние пробелы
  correctedTitle = correctedTitle.replace(/\s+/g, ' ').trim();
  
  return correctedTitle;
}

async function correctProductTitles() {
  try {
    console.log('🔍 Начинаем проверку и исправление названий товаров...');
    
    // Получаем все товары
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true
      }
    });
    
    console.log(`📦 Найдено товаров: ${products.length}`);
    
    let correctedCount = 0;
    const corrections: Array<{id: number, oldTitle: string, newTitle: string}> = [];
    
    for (const product of products) {
      const correctedTitle = correctTitle(product.title);
      
      if (correctedTitle !== product.title) {
        corrections.push({
          id: product.id,
          oldTitle: product.title,
          newTitle: correctedTitle
        });
        
        // Обновляем название в базе данных
        await prisma.product.update({
          where: { id: product.id },
          data: { title: correctedTitle }
        });
        
        correctedCount++;
      }
    }
    
    console.log(`✅ Исправлено названий: ${correctedCount}`);
    
    if (corrections.length > 0) {
      console.log('\n📋 Список исправлений:');
      corrections.forEach((correction, index) => {
        console.log(`${index + 1}. ID: ${correction.id}`);
        console.log(`   Было: "${correction.oldTitle}"`);
        console.log(`   Стало: "${correction.newTitle}"`);
        console.log('');
      });
    }
    
    console.log('🎉 Проверка завершена!');
    
  } catch (error) {
    console.error('❌ Ошибка при исправлении названий:', error);
  } finally {
    await prisma.$disconnect();
  }
}

correctProductTitles();
