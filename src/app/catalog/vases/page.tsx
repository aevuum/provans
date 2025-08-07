'use client';

import { CatalogPage } from '@/app/components/CatalogPage';

export default function VasesPage() {
  return (
    <CatalogPage
      title="Вазы"
      description="Элегантные вазы в стиле Прованс для создания уютного интерьера. Выберите идеальную вазу из нашей коллекции"
      apiEndpoint="/api/products?category=вазы"
      category="vases"
    />
  );
}
