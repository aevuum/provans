import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Интерфейс для товаров из JSON
interface ProductFromJson {
  title: string
  raw_title: string
  image_path: string
  price: number
}

// Функция для исправления грамматики в названиях
function fixGrammar(title: string): string {
  const corrections: Record<string, string> = {
    'ваза аза': 'ваза',
    'увшин': 'кувшин',
    'увшинчик': 'кувшинчик',
    'абочка': 'бабочка',
    'вфрикан': 'африкан',
    'Африкан': 'Африкан',
    'фигурка фарфор': 'фарфоровая фигурка',
    'музыкант музыкант': 'музыкант',
    'Балерина': 'Балерина',
    'на подставке на подставке': 'на подставке',
    // Убираем дубли слов
    '  ': ' '
  }
  
  let corrected = title
  
  for (const [wrong, correct] of Object.entries(corrections)) {
    const regex = new RegExp(wrong, 'gi')
    corrected = corrected.replace(regex, correct)
  }
  
  // Убираем дубликаты слов
  corrected = corrected.replace(/\b(\w+)\s+\1\b/gi, '$1')
  
  // Убираем лишние пробелы
  corrected = corrected.replace(/\s+/g, ' ').trim()
  
  return corrected
}

async function restoreFromJson() {
  console.log('🔄 Восстанавливаем названия товаров из products.json...')
  
  try {
    // Читаем JSON файл
    const jsonPath = path.join(process.cwd(), 'products.json')
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8')
    const productsFromJson: ProductFromJson[] = JSON.parse(jsonContent)
    
    console.log(`📦 Найдено товаров в JSON: ${productsFromJson.length}`)
    
    // Получаем все товары из базы
    const dbProducts = await prisma.product.findMany({
      orderBy: { id: 'asc' }
    })
    
    console.log(`🗃️  Товаров в базе данных: ${dbProducts.length}`)
    
    let restoredCount = 0
    let updatedImages = 0
    
    // Пытаемся сопоставить товары по позиции или цене
    for (let i = 0; i < Math.min(productsFromJson.length, dbProducts.length); i++) {
      const jsonProduct = productsFromJson[i]
      const dbProduct = dbProducts[i]
      
      // Исправляем название
      let correctedTitle = fixGrammar(jsonProduct.title)
      
      // Формируем путь к изображению
      const imagePath = `/uploads${jsonProduct.image_path}`
      
      try {
        const updateData: any = {
          title: correctedTitle,
          price: jsonProduct.price
        }
        
        // Обновляем изображения, если они пустые
        if (!dbProduct.images || dbProduct.images.length === 0) {
          updateData.images = [imagePath]
          updateData.image = imagePath
          updatedImages++
        }
        
        await prisma.product.update({
          where: { id: dbProduct.id },
          data: updateData
        })
        
        console.log(`✅ Восстановлено ID ${dbProduct.id}: "${dbProduct.title}" → "${correctedTitle}"`)
        restoredCount++
        
      } catch (error) {
        console.error(`❌ Ошибка при обновлении товара ID ${dbProduct.id}:`, error)
      }
    }
    
    console.log(`✅ Восстановлено названий: ${restoredCount}`)
    console.log(`🖼️  Обновлено изображений: ${updatedImages}`)
    
  } catch (error) {
    console.error('❌ Ошибка при восстановлении из JSON:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restoreFromJson()
