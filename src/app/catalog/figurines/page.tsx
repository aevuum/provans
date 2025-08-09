'use client';

import { CatalogPage } from '@/app/components/CatalogPage';

export default function FigurinesPage() {
  return (
    <CatalogPage 
      category="figures"
      title="Фигурки"
      description="Очаровательные декоративные фигурки и статуэтки, которые привнесут особую атмосферу в ваш дом. От нежных ангелочков до забавных животных - каждая фигурка рассказывает свою историю."
      showCategoryFilter={false}
    />
  );
}
