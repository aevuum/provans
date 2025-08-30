
export interface Subcategory {
  name: string;
  slug: string;
}

export interface Category {
  name: string;
  slug: string;
  subcategories?: Subcategory[];
}

export const catalogStructure: Category[] = [
  {
    name: 'Декор',
    slug: 'decor',
    subcategories: [
      { name: 'Фоторамки', slug: 'frames' },
      { name: 'Вазы', slug: 'vases' },
      { name: 'Зеркала', slug: 'mirrors' },
      { name: 'Подсвечники', slug: 'candlesticks' },
      { name: 'Шкатулки', slug: 'jewelry-boxes' },
      { name: 'Интерьерные фигуры', slug: 'figurines' },
      { name: 'Часы', slug: 'clocks' },
      { name: 'Садовый декор и фигуры', slug: 'garden' },
    ],
  },
  {
    name: 'Искусственные цветы',
    slug: 'flowers',
    subcategories: [
      { name: 'Искусственные цветы', slug: 'flowers' },
      { name: 'Интерьерные композиции', slug: 'compositions' },
    ],
  },
  {
    name: 'Текстиль',
    slug: 'textiles',
    subcategories: [
      { name: 'Покрывала и пледы', slug: 'blankets' },
      { name: 'Скатерти и салфетки', slug: 'tablecloths' },
      { name: 'Косметички', slug: 'cosmetic-bags' },
      { name: 'Подушки и наволочки', slug: 'pilows' },
      { name: 'Полотенца', slug: 'towels' },
    ],
  },
  {
    name: 'Посуда и бокалы',
    slug: 'tableware',
    subcategories: [
      { name: 'Посуда и сервизы', slug: 'dishes' },
      { name: 'Столовые приборы', slug: 'cutlery' },
      { name: 'Бокалы для напитков', slug: 'glasses' },
      { name: 'Предметы для сервировки', slug: 'serving' },
    ],
  },
  {
    name: 'Мебель',
    slug: 'furniture',
    subcategories: [],
  },
  {
    name: 'Ароматы для дома',
    slug: 'home-fragrances',
    subcategories: [
      { name: 'Диффузоры', slug: 'diffusers' },
      { name: 'Ароматные букеты', slug: 'bouquets' },
      { name: 'Ароматные свечи', slug: 'candles' },
      { name: 'Спреи для дома', slug: 'sprays' },
    ],
  },
  {
    name: 'Пасхальная коллекция',
    slug: 'easter-collection',
    subcategories: [],
  },
  {
    name: 'Новый год',
    slug: 'new-year',
    subcategories: [
      { name: 'Фигуры и статуэтки', slug: 'figures' },
      { name: 'Ветки и композиции', slug: 'branches' },
      { name: 'Елочные игрушки', slug: 'toys' },
      { name: 'Елочные шары', slug: 'balls' },
      { name: 'Елки', slug: 'trees' },
      { name: 'Гирлянды', slug: 'garlands' },
    ],
  },
];