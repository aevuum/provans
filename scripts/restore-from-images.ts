import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Функция для очистки имени файла и преобразования в читаемое название
function cleanFileName(fileName: string): string {
  // Убираем расширение
  let name = fileName.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')
  
  // Убираем цифры в конце (которые могли быть добавлены при обработке)
  name = name.replace(/\s*\d+$/, '')
  
  // Заменяем подчеркивания и дефисы на пробелы
  name = name.replace(/[_-]/g, ' ')
  
  // Убираем лишние пробелы
  name = name.replace(/\s+/g, ' ').trim()
  
  // Делаем первую букву заглавной
  if (name.length > 0) {
    name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  }
  
  return name
}

// Грамматические исправления
function fixGrammar(title: string): string {
  const corrections: Record<string, string> = {
    // Исправления из предыдущего скрипта
    'ваза аза': 'ваза',
    'увшин': 'кувшин',
    'увшинчик': 'кувшинчик',
    'абочка': 'бабочка',
    'огонь': 'огонь',
    'свеча': 'свеча',
    'фигурка': 'фигурка',
    'статуэтка': 'статуэтка',
    'подсвечник': 'подсвечник',
    'лампа': 'лампа',
    'светильник': 'светильник',
    'тарелка': 'тарелка',
    'чашка': 'чашка',
    'блюдо': 'блюдо',
    'миска': 'миска',
    'кружка': 'кружка',
    'стакан': 'стакан',
    'бокал': 'бокал',
    'рюмка': 'рюмка',
    'салатник': 'салатник',
    'тарелочка': 'тарелочка',
    'блюдце': 'блюдце',
    'поднос': 'поднос',
    'шкатулка': 'шкатулка',
    'коробка': 'коробка',
    'корзина': 'корзина',
    'корзинка': 'корзинка',
    'ящик': 'ящик',
    'контейнер': 'контейнер',
    'банка': 'банка',
    'баночка': 'баночка',
    'шкаф': 'шкаф',
    'комод': 'комод',
    'стол': 'стол',
    'столик': 'столик',
    'стул': 'стул',
    'кресло': 'кресло',
    'диван': 'диван',
    'полка': 'полка',
    'полочка': 'полочка',
    'этажерка': 'этажерка',
    'стеллаж': 'стеллаж',
    'картина': 'картина',
    'рамка': 'рамка',
    'зеркало': 'зеркало',
    'часы': 'часы',
    'будильник': 'будильник',
    'подушка': 'подушка',
    'наволочка': 'наволочка',
    'одеяло': 'одеяло',
    'плед': 'плед',
    'покрывало': 'покрывало',
    'скатерть': 'скатерть',
    'салфетка': 'салфетка',
    'полотенце': 'полотенце',
    'занавеска': 'занавеска',
    'штора': 'штора',
    'гардина': 'гардина',
    'ковер': 'ковер',
    'коврик': 'коврик',
    'дорожка': 'дорожка',
    'цветок': 'цветок',
    'растение': 'растение',
    'горшок': 'горшок',
    'ваза для цветов': 'ваза для цветов',
    'кашпо': 'кашпо',
    'ангел': 'ангел',
    'ангелок': 'ангелок',
    'балерина': 'балерина',
    'танцовщица': 'танцовщица',
    'музыкант': 'музыкант',
    'фарфор': 'фарфоровая фигурка',
    'керамика': 'керамическая фигурка',
    'стекло': 'стеклянная фигурка',
    'хрусталь': 'хрустальная фигурка',
    'африканский': 'африканская фигурка',
    'африканская': 'африканская фигурка',
    'белая': 'белый',
    'черная': 'черный',
    'красная': 'красный',
    'синяя': 'синий',
    'зеленая': 'зеленый',
    'желтая': 'желтый',
    'розовая': 'розовый',
    'коричневая': 'коричневый',
    'серая': 'серый',
    'золотая': 'золотой',
    'серебряная': 'серебряный',
    'перламутр': 'перламутровый',
    'кожа': 'кожаный',
    'лен': 'льняной',
    'хром': 'хромированный',
    'мятая': 'мятый'
  }
  
  let corrected = title.toLowerCase()
  
  for (const [wrong, correct] of Object.entries(corrections)) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi')
    corrected = corrected.replace(regex, correct)
  }
  
  // Делаем первую букву заглавной
  return corrected.charAt(0).toUpperCase() + corrected.slice(1)
}

async function restoreFromImageNames() {
  console.log('🔄 Восстанавливаем названия товаров из имен файлов изображений...')
  
  try {
    // Получаем все товары
    const allProducts = await prisma.product.findMany()
    
    // Фильтруем поврежденные названия
    const damagedProducts = allProducts.filter(product => {
      const title = product.title || ''
      return (
        title.includes('.') ||
        title.length <= 4 ||
        title === '' ||
        /^\.+\d*$/.test(title) // Только точки с возможными цифрами
      )
    })
    
    console.log(`📦 Найдено товаров с поврежденными названиями: ${damagedProducts.length}`)
    
    let restoredCount = 0
    
    for (const product of damagedProducts) {
      if (product.images && product.images.length > 0) {
        // Берем имя первого изображения
        const firstImageUrl = product.images[0]
        
        // Извлекаем имя файла из пути
        const fileName = path.basename(firstImageUrl)
        
        // Очищаем имя файла и делаем читаемое название
        let newTitle = cleanFileName(fileName)
        
        // Применяем грамматические исправления
        newTitle = fixGrammar(newTitle)
        
        if (newTitle && newTitle.length > 2) {
          try {
            await prisma.product.update({
              where: { id: product.id },
              data: { title: newTitle }
            })
            
            console.log(`✅ Восстановлено ID ${product.id}: "${product.title}" → "${newTitle}"`)
            restoredCount++
          } catch (error) {
            console.error(`❌ Ошибка при обновлении товара ID ${product.id}:`, error)
          }
        } else {
          console.log(`⚠️  Не удалось создать название для товара ID ${product.id} из файла: ${fileName}`)
        }
      } else {
        console.log(`⚠️  У товара ID ${product.id} нет изображений для восстановления названия`)
      }
    }
    
    console.log(`✅ Восстановлено названий: ${restoredCount}`)
    
  } catch (error) {
    console.error('❌ Ошибка при восстановлении названий:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restoreFromImageNames()
