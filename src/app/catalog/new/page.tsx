'use client';

import CatalogPage from '@/app/components/CatalogPage';

export default function NewProductsAsciiPage() {
  return (
    <CatalogPage
      title="Новинки"
      description="Самые свежие поступления"
      apiEndpoint="/api/products?type=new"
      pageSize={100}
      highlightNew
      showCategoryFilter={true}
    />
  );
}
