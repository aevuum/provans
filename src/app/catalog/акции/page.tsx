'use client';

import CatalogPage from '@/app/components/CatalogPage';

export default function DiscountProductsPage() {
  return (
    <CatalogPage
      title="🔥 Акции и скидки"
      description="Товары со скидками - не упустите выгодные предложения!"
      apiEndpoint="/api/products?type=discount&limit=1000&sortBy=discount&sortOrder=desc"
      showCategoryFilter={true}
    />
  );
}
