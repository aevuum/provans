'use client';

import CatalogPage from '@/app/components/CatalogPage';

export default function NewProductsPage() {
  return (
    <CatalogPage
      title="Новинки"
      description="Самые свежие поступления"
      apiEndpoint="/api/products?type=new&limit=100&sortBy=createdAt&sortOrder=desc"
      isNew={true}
      showCategoryFilter={true}
    />
  );
}
