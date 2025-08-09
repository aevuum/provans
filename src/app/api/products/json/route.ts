// API для работы с данными из products.json
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface ProductData {
  title: string;
  raw_title: string;
  image_path: string;
  price?: number;
}

// GET - получение товаров из JSON файла
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    
    // Читаем JSON файл
    const jsonPath = path.join(process.cwd(), 'products.json');
    
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json(
        { error: 'Products JSON file not found' },
        { status: 404 }
      );
    }
    
    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    let products: ProductData[] = JSON.parse(jsonData);
    
    // Фильтрация по поиску
    if (search) {
      products = products.filter(product => 
        product.title.toLowerCase().includes(search.toLowerCase()) ||
        product.raw_title.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Фильтрация по категории (на основе названия)
    if (category) {
      products = products.filter(product => {
        const name = product.raw_title.toLowerCase();
        switch (category.toLowerCase()) {
          case 'вазы':
            return name.includes('ваза');
          case 'цветы':
            return name.includes('роза') || name.includes('тюльпан') || 
                   name.includes('пион') || name.includes('букет');
          case 'фигуры':
            return name.includes('ангел') || name.includes('балерина') || 
                   name.includes('фигур');
          case 'подсвечники':
            return name.includes('подсвечник');
          case 'фоторамки':
            return name.includes('фоторамка') || name.includes(' ф ');
          default:
            return true;
        }
      });
    }
    
    // Пагинация
    const total = products.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = products.slice(startIndex, endIndex);
    
    // Преобразуем формат для совместимости с существующим API
    const formattedProducts = paginatedProducts.map((product, index) => ({
      id: startIndex + index + 1, // Временный ID для совместимости
      title: product.title,
      price: product.price || 0,
      image: product.image_path,
      images: product.image_path ? [product.image_path] : [],
      category: determineCategory(product.raw_title),
      size: extractSize(product.title),
      barcode: null,
      comment: null,
      isConfirmed: true,
      quantity: 1,
      reserved: 0,
      discount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    return NextResponse.json({
      data: formattedProducts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: endIndex < total,
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('JSON Products API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products from JSON' },
      { status: 500 }
    );
  }
}

// Функция для определения категории
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
  
  return 'декор';
}

// Функция для извлечения размеров
function extractSize(title: string): string | null {
  const sizeMatch = title.match(/\d+(?:\.\d+)?[\*\s]+\d+(?:\.\d+)?(?:[\*\s]+\d+(?:\.\d+)?)?/);
  return sizeMatch ? sizeMatch[0].replace(/\s+/g, ' ').trim() : null;
}
