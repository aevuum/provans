import { Metadata } from 'next';

interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  category?: string;
  subcategory?: string;
  material?: string;
  size?: string;
  country?: string;
  image?: string;
  images?: string[];
  discount?: number;
}

interface SEOProps {
  product?: Product;
  category?: string;
  page?: 'home' | 'catalog' | 'product' | 'cart' | 'checkout' | 'profile' | 'search';
  title?: string;
  description?: string;
  keywords?: string[];
  noIndex?: boolean;
}

export function generateSEO({
  product,
  category,
  page = 'home',
  title,
  description,
  keywords = [],
  noIndex = false
}: SEOProps): Metadata {
  const baseUrl = 'https://provans-decor.ru';
  const siteName = 'Провансаль Декор';
  const defaultDescription = 'Интернет-магазин товаров для дома в стиле Прованс. Декор, мебель, текстиль, посуда, ароматы и аксессуары для создания уютного французского интерьера.';
  
  // Базовые keywords
  const baseKeywords = [
    'прованс',
    'декор',
    'интернет магазин',
    'товары для дома',
    'французский стиль',
    'прованский стиль',
    'интерьер',
    'аксессуары'
  ];

  let seoTitle = title;
  let seoDescription = description || defaultDescription;
  let seoKeywords = [...baseKeywords, ...keywords];
  let canonical = baseUrl;
  let images: string[] = [];

  switch (page) {
    case 'product':
      if (product) {
        seoTitle = `${product.title} - купить в интернет-магазине ${siteName}`;
        seoDescription = `${product.title} за ${product.price.toLocaleString('ru-RU')} ₽. ${product.discount ? `Скидка ${product.discount}%! ` : ''}${product.material ? `Материал: ${product.material}. ` : ''}${product.size ? `Размер: ${product.size}. ` : ''}Доставка по России. Гарантия качества.`;
        
        seoKeywords = [
          ...baseKeywords,
          product.title.toLowerCase(),
          product.category?.toLowerCase() || '',
          product.subcategory?.toLowerCase() || '',
          product.material?.toLowerCase() || '',
          'купить',
          'цена',
          'интернет магазин'
        ].filter(Boolean);

        canonical = `${baseUrl}/products/${product.id}`;
        
        if (product.image) {
          images = [product.image];
        } else if (product.images && product.images.length > 0) {
          images = product.images.slice(0, 3);
        }
      }
      break;

    case 'catalog':
      const categoryNames: Record<string, string> = {
        'decor': 'Декор',
        'photoframes': 'Фоторамки',
        'vases': 'Вазы',
        'mirrors': 'Зеркала',
        'candles': 'Подсвечники',
        'jewelry-boxes': 'Шкатулки',
        'figures': 'Интерьерные фигуры',
        'clocks': 'Часы',
        'garden-decor': 'Садовый декор',
        'flowers': 'Искусственные цветы',
        'textile': 'Текстиль',
        'dishes': 'Посуда и бокалы',
        'furniture': 'Мебель',
        'scents': 'Ароматы для дома',
        'easter': 'Пасхальная коллекция',
        'newyear': 'Новогодние товары'
      };

      if (category && categoryNames[category]) {
        const categoryName = categoryNames[category];
        seoTitle = `${categoryName} в стиле Прованс - купить в интернет-магазине ${siteName}`;
        seoDescription = `${categoryName} в прованском стиле. Большой выбор качественных товаров для дома. Доставка по России. Гарантия качества. ✓ Лучшие цены ✓ Быстрая доставка`;
        seoKeywords = [...baseKeywords, categoryName.toLowerCase(), 'купить', 'каталог', 'выбор'];
        canonical = `${baseUrl}/catalog/${category}`;
      } else {
        seoTitle = `Каталог товаров для дома в стиле Прованс - ${siteName}`;
        seoDescription = `Полный каталог товаров для дома в прованском стиле. Декор, мебель, текстиль, посуда и аксессуары. Создайте уютный французский интерьер с ${siteName}.`;
        canonical = `${baseUrl}/catalog/allshop`;
      }
      break;

    case 'home':
      seoTitle = `${siteName} - интернет-магазин товаров для дома в стиле Прованс`;
      seoDescription = defaultDescription;
      seoKeywords = [...baseKeywords, 'главная', 'магазин', 'французский интерьер'];
      canonical = baseUrl;
      break;

    case 'cart':
      seoTitle = `Корзина - ${siteName}`;
      seoDescription = 'Корзина покупок. Оформите заказ товаров для дома в стиле Прованс с доставкой по России.';
      seoKeywords = [...baseKeywords, 'корзина', 'заказ', 'покупка'];
      canonical = `${baseUrl}/cart`;
      break;

    case 'checkout':
      seoTitle = `Оформление заказа - ${siteName}`;
      seoDescription = 'Оформите заказ товаров для дома в стиле Прованс. Быстрая доставка по России. Удобные способы оплаты.';
      seoKeywords = [...baseKeywords, 'оформление заказа', 'доставка', 'оплата'];
      canonical = `${baseUrl}/checkout`;
      break;

    default:
      seoTitle = title ? `${title} - ${siteName}` : `${siteName}`;
      canonical = baseUrl;
  }

  // Ограничиваем длину title и description
  if (seoTitle && seoTitle.length > 60) {
    seoTitle = seoTitle.substring(0, 57) + '...';
  }
  
  if (seoDescription.length > 160) {
    seoDescription = seoDescription.substring(0, 157) + '...';
  }

  const metadata: Metadata = {
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords.join(', '),
    
    ...(noIndex && { robots: 'noindex, nofollow' }),
    
    alternates: {
      canonical
    },

    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonical,
      siteName,
      locale: 'ru_RU',
      type: 'website',
      ...(images.length > 0 && {
        images: images.map(img => ({
          url: img.startsWith('http') ? img : `${baseUrl}${img}`,
          width: 800,
          height: 600,
          alt: seoTitle
        }))
      })
    },

    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      ...(images.length > 0 && {
        images: [images[0].startsWith('http') ? images[0] : `${baseUrl}${images[0]}`]
      })
    },

    // JSON-LD структурированные данные для товара
    ...(product && {
      other: {
        'application/ld+json': JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.title,
          description: seoDescription,
          image: images.map(img => img.startsWith('http') ? img : `${baseUrl}${img}`),
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'RUB',
            availability: 'https://schema.org/InStock',
            seller: {
              '@type': 'Organization',
              name: siteName
            }
          },
          brand: {
            '@type': 'Brand',
            name: siteName
          },
          ...(product.category && {
            category: product.category
          })
        })
      }
    })
  };

  return metadata;
}
