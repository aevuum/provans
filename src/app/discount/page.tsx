import { Metadata } from 'next';
import { CatalogPage } from '../components/CatalogPage';

export const metadata: Metadata = {
  title: 'Акции - Provans Decor',
  description: 'Специальные предложения и скидки на товары для дома в интернет-магазине Provans Decor.',
};

interface SearchParams {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  sortBy?: string;
  sortOrder?: string;
  material?: string;
  country?: string;
}

export default async function DiscountPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <CatalogPage
      apiEndpoint="/api/products/promotions"
      title="🔥 Горячие скидки!"
    />
  );
}
