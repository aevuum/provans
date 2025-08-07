'use client';

import { CatalogPage } from '@/app/components/CatalogPage';

export default function FlowersPage() {
  return (
    <CatalogPage
      title="Цветы"
      description="Искусственные цветы высочайшего качества в стиле Прованс. Создайте вечную красоту в вашем интерьере"
      apiEndpoint="/api/products?category=цветы"
      category="flowers"
    />
  );
}
