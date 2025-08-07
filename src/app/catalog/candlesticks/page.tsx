'use client';

import { CatalogPage } from '@/app/components/CatalogPage';

export default function CandlesticksPage() {
  return (
    <CatalogPage
      title="Подсвечники"
      description="Изысканные подсвечники в стиле Прованс для создания романтической атмосферы. Выберите идеальный подсвечник из нашей коллекции"
      apiEndpoint="/api/products?category=подсвечники"
      category="candlesticks"
    />
  );
}
