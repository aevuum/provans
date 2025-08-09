import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixImagePaths() {
  console.log('🔧 Быстрое исправление путей изображений...\n');
  
  try {
    // Получаем товары с неправильными путями изображений
    const productsToFix = await prisma.product.findMany({
      where: {
        AND: [
          { image: { not: null } },
          { image: { not: '' } },
          { image: { not: { startsWith: '/' } } },
          { image: { not: { startsWith: 'http' } } }
        ]
      },
      select: { id: true, image: true }
    });
    
    // Исправляем основное изображение
    let fixedMain = 0;
    for (const product of productsToFix) {
      if (product.image) {
        await prisma.product.update({
          where: { id: product.id },
          data: { image: `/${product.image}` }
        });
        fixedMain++;
      }
    }
    
    console.log(`✅ Исправлено основных изображений: ${fixedMain}`);
    
    // Получаем все товары с массивом изображений
    const productsWithImages = await prisma.product.findMany({
      where: {
        images: {
          isEmpty: false
        }
      },
      select: {
        id: true,
        images: true
      }
    });
    
    let fixedArrays = 0;
    
    for (const product of productsWithImages) {
      if (product.images && Array.isArray(product.images)) {
        const fixedImages = product.images.map((img: string) => {
          if (img && !img.startsWith('/') && !img.startsWith('http')) {
            return `/${img}`;
          }
          return img;
        }).filter(Boolean);
        
        if (JSON.stringify(fixedImages) !== JSON.stringify(product.images)) {
          await prisma.product.update({
            where: { id: product.id },
            data: { images: fixedImages }
          });
          fixedArrays++;
        }
      }
    }
    
    console.log(`✅ Исправлено массивов изображений: ${fixedArrays}`);
    console.log('🎉 Исправление путей завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImagePaths();
