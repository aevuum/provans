import { Metadata } from 'next';
import CatalogPage from '../components/CatalogPage';

export const metadata: Metadata = {
  title: 'Акции - Provans Decor',
  description: 'Специальные предложения и скидки на товары для дома в интернет-магазине Provans Decor.',
};

export default function DiscountPage() {
  return (
    <CatalogPage
      apiEndpoint="/api/products?type=discount"
      title="🔥 Акции и скидки"
      // description="Товары со скидками — не упустите выгодные предложения!"
      showCategoryFilter={true}
      emptyAlign="right"
    />
  );
}
