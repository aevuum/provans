import CatalogPage from '@/components/CatalogPage';
import type { Metadata } from 'next';

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