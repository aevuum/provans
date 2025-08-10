import type { Metadata } from 'next';
import CatalogPage from '@/app/components/CatalogPage';

export const metadata: Metadata = {
  title: 'Все категории - Provans Decor'
};

export default function AllCategoriesAsciiPage() {
  return (
    <CatalogPage
      title="Все категории"
      showCategoryFilter={true}
    />
  );
}
