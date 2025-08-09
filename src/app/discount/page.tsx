import { Metadata } from 'next';
import { CatalogPage } from '../components/CatalogPage';

export const metadata: Metadata = {
  title: 'Акции - Provans Decor',
  description: 'Специальные предложения и скидки на товары для дома в интернет-магазине Provans Decor.',
};

export default async function DiscountPage() {
  return (
    <CatalogPage
      apiEndpoint="/api/products/promotions"
      title="🔥 Горячие скидки!"
    />
  );
}
