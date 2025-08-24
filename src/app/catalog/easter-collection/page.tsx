import { CatalogPage } from '@/app/components/CatalogPage';

export default function EasterCollectionPage() {
  return (
    <CatalogPage
      title="Пасхальная коллекция"
      description="Праздничные товары и аксессуары для создания уютной атмосферы к Пасхе."
      category="easter-collection"
      showCategoryFilter={false}
    />
  );
}
