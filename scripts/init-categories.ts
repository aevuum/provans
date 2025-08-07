// scripts/init-categories.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Декор',
    slug: 'decor',
    image: '/категории/декор.png',
    subcategories: [
      { name: 'Фоторамки', slug: 'frames' },
      { name: 'Вазы', slug: 'vases' },
      { name: 'Зеркала', slug: 'mirrors' },
      { name: 'Подсвечники', slug: 'candle-holders' },
      { name: 'Шкатулки', slug: 'jewelry-boxes' },
      { name: 'Интерьерные фигуры', slug: 'interior-figures' },
      { name: 'Часы', slug: 'clocks' },
      { name: 'Садовый декор и фигуры', slug: 'garden-decor' }
    ]
  },
  {
    name: 'Искусственные цветы',
    slug: 'artificial-flowers',
    image: '/категории/цветы.png',
    subcategories: [
      { name: 'Искусственные цветы', slug: 'artificial-flowers' },
      { name: 'Интерьерные композиции из искусственных цветов', slug: 'interior-compositions' }
    ]
  },
  {
    name: 'Текстиль',
    slug: 'textile',
    image: '/категории/текстиль.png',
    subcategories: [
      { name: 'Покрывала и пледы', slug: 'bedspreads-blankets' },
      { name: 'Скатерти и салфетки', slug: 'tablecloths-napkins' },
      { name: 'Косметички', slug: 'cosmetic-bags' },
      { name: 'Подушки и наволочки', slug: 'pillows-pillowcases' },
      { name: 'Полотенца', slug: 'towels' }
    ]
  },
  {
    name: 'Посуда и бокалы',
    slug: 'dishes-glasses',
    image: '/категории/посуда.png',
    subcategories: [
      { name: 'Посуда и сервизы', slug: 'dishes-sets' },
      { name: 'Столовые приборы', slug: 'cutlery' },
      { name: 'Бокалы для напитков', slug: 'drink-glasses' },
      { name: 'Интересные предметы для сервировки стола', slug: 'table-setting-items' }
    ]
  },
  {
    name: 'Мебель',
    slug: 'furniture',
    image: '/категории/мебель1.png',
    subcategories: []
  },
  {
    name: 'Ароматы для дома и свечи',
    slug: 'home-fragrances-candles',
    image: '/категории/ароматы.png',
    subcategories: [
      { name: 'Диффузоры', slug: 'diffusers' },
      { name: 'Ароматные букеты', slug: 'fragrant-bouquets' },
      { name: 'Ароматные свечи', slug: 'scented-candles' },
      { name: 'Спреи для дома и текстиля', slug: 'home-textile-sprays' }
    ]
  },
  {
    name: 'Пасхальная коллекция',
    slug: 'easter-collection',
    image: '/категории/Пасха.png',
    subcategories: []
  },
  {
    name: 'Новый год',
    slug: 'new-year',
    image: '/категории/Новый год.png',
    subcategories: [
      { name: 'Фигуры и статуэтки', slug: 'figures-statuettes' },
      { name: 'Ветки и композиции', slug: 'branches-compositions' },
      { name: 'Елочные игрушки', slug: 'christmas-toys' },
      { name: 'Елочные шары', slug: 'christmas-balls' },
      { name: 'Елки', slug: 'christmas-trees' },
      { name: 'Гирлянды', slug: 'garlands' }
    ]
  }
];

async function initCategories() {
  console.log('Инициализация категорий...');

  for (const categoryData of categories) {
    try {
      // Создаем категорию
      const category = await prisma.category.upsert({
        where: { slug: categoryData.slug },
        update: {
          name: categoryData.name,
          image: categoryData.image,
        },
        create: {
          name: categoryData.name,
          slug: categoryData.slug,
          image: categoryData.image,
        },
      });

      console.log(`Категория "${category.name}" создана/обновлена`);

      // Создаем подкатегории
      for (let i = 0; i < categoryData.subcategories.length; i++) {
        const subcat = categoryData.subcategories[i];
        const subcategory = await prisma.subcategory.upsert({
          where: {
            categoryId_slug: {
              categoryId: category.id,
              slug: subcat.slug,
            },
          },
          update: {
            name: subcat.name,
            sortOrder: i,
          },
          create: {
            name: subcat.name,
            slug: subcat.slug,
            categoryId: category.id,
            sortOrder: i,
          },
        });

        console.log(`  - Подкатегория "${subcategory.name}" создана/обновлена`);
      }
    } catch (error) {
      console.error(`Ошибка при создании категории ${categoryData.name}:`, error);
    }
  }

  console.log('Инициализация категорий завершена!');
}

initCategories()
  .catch((e) => {
    console.error('Ошибка инициализации:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
