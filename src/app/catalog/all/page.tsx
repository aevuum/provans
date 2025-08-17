import type { Metadata } from 'next';
import CatalogPage from '@/app/components/CatalogPage';

export const metadata: Metadata = {
  title: 'Все товары - Provans Decor',
};

export default function AllCategoriesAsciiPage() {
  return (
    <CatalogPage
      category="all"
      title="Все товары"
      showCategoryFilter={true}
    />
  );
}