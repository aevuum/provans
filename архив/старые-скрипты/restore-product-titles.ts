import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Функция для правильного исправления названий товаров
function correctProductTitle(title: string): string {
  if (!title || title.trim() === '' || title.includes('.')) {
    return title; // Возвращаем как есть если некорректное название
  }

  let corrected = title.trim();
  
  // Исправляем конкретные ошибки из примеров
  const corrections = {
    // Убираем дублирование слов
    'Ваза аза': 'Ваза',
    'Фоторамка оторамка': 'Фоторамка',
    'Подсвечник одсвечник': 'Подсвечник',
    'Картина артина': 'Картина',
    'Декор екор': 'Декор',
    
    // Исправляем конкретные слова
    'увшин': 'кувшин',
    'молочнй': 'молочный',
    'горляшку': 'горлышку',
    'ранцузский': 'французский',
    'игура': 'фигура',
    'игурка': 'фигурка',
    'тица': 'птица',
    'опугай': 'попугай',
    'ендробиум': 'дендробиум',
    'нигодержатель': 'книгодержатель',
    'етка': 'ветка',
    'ержатель': 'держатель',
    'евочка': 'девочка',
    'ерламутр': 'перламутр',
    'одсв': 'подсв',
    'узнечик': 'кузнечик',
    'лоун': 'клоун',
    'онь': 'конь',
    'ролик': 'кролик',
    'ин ': 'пион ',
    'иолетовый': 'фиолетовый',
    'анда': 'панда',
    'рида': 'фрида',
    
    // Исправляем размеры и форматирование
    ' аза ': ' ',
    'мешок': '',
    ' б ': ' большая ',
    ' м ': ' маленькая ',
    ' с ': ' средняя ',
    
    // Убираем лишние символы
    '¿': '',
    '=': '-',
    '..': '.',
    '  ': ' ',
    ' ,': ',',
    ' .': '.'
  };
  
  // Применяем исправления
  Object.entries(corrections).forEach(([wrong, right]) => {
    const regex = new RegExp(wrong, 'gi');
    corrected = corrected.replace(regex, right);
  });
  
  // Убираем дублирующиеся слова рядом
  corrected = corrected.replace(/\b(\w+)\s+\1\b/gi, '$1');
  
  // Исправляем капитализацию
  corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
  
  // Убираем лишние пробелы
  corrected = corrected.replace(/\s+/g, ' ').trim();
  
  return corrected;
}

async function restoreAndFixTitles() {
  try {
    console.log('🔄 Восстанавливаем и исправляем названия товаров...');
    
    // Получаем все товары
    const allProducts = await prisma.product.findMany({
      select: { id: true, title: true }
    });
    
    console.log(`📦 Всего товаров в базе: ${allProducts.length}`);
    
    let fixedCount = 0;
    const corrections: Array<{id: number, oldTitle: string, newTitle: string}> = [];
    
    for (const product of allProducts) {
      // Пропускаем товары с точками (они были повреждены)
      if (product.title.includes('...') || product.title.length < 5) {
        console.log(`❌ Пропускаем поврежденное название ID ${product.id}: "${product.title}"`);
        continue;
      }
      
      const correctedTitle = correctProductTitle(product.title);
      
      if (correctedTitle !== product.title && correctedTitle.length > 4) {
        corrections.push({
          id: product.id,
          oldTitle: product.title,
          newTitle: correctedTitle
        });
        
        await prisma.product.update({
          where: { id: product.id },
          data: { title: correctedTitle }
        });
        
        fixedCount++;
      }
    }
    
    console.log(`✅ Исправлено названий: ${fixedCount}`);
    
    if (corrections.length > 0) {
      console.log('\n📋 Первые 10 исправлений:');
      corrections.slice(0, 10).forEach((correction, index) => {
        console.log(`${index + 1}. ID: ${correction.id}`);
        console.log(`   Было: "${correction.oldTitle}"`);
        console.log(`   Стало: "${correction.newTitle}"`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreAndFixTitles();
