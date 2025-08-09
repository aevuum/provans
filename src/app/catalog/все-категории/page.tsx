'use client';

import CatalogPage from '@/app/components/CatalogPage';

export default function AllCategoriesPage() {
  return (
    <CatalogPage
      title="Все категории"
      description={undefined}
      category={undefined}
      showCategoryFilter={true}
    />
  );
}
