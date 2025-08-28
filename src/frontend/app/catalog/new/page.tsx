import type { Metadata } from 'next';

import CatalogPage from "@/components/CatalogPage";

export const metadata: Metadata = {
  title: 'Новинки — Provans Decor',
  description: 'Последние поступления — свежие модели прямо со склада',
};

export default function NewProductsAsciiPage() {
  return (
    <CatalogPage
      title="Новинки"
      description="Самые свежие поступления"
      apiEndpoint="/api/products?type=new"
      pageSize={100}
      highlightNew
      showCategoryFilter={false}
    />
  );
}
