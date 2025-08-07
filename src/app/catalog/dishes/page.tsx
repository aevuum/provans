'use client';

import { CatalogPage } from '@/app/components/CatalogPage';

export default function DishesPage() {
  return (
    <CatalogPage
      title="Посуда и бокалы"
      description="Элегантная посуда и изящные бокалы в стиле Прованс для особенных моментов"
      apiEndpoint="/api/products?category=dishes"
      category="dishes"
    />
  );
}
