import CatalogPage from '@/app/components/CatalogPage';

export default function AllShopPage() {
  return (
    <CatalogPage
      title="Все товары"
      description="Полный каталог товаров нашего интернет-магазина"
      apiEndpoint="/api/products?limit=1000"
      isNew={false}
      showCounter={true}
      emptyMessage="Товары не найдены"
    />
  );
}
