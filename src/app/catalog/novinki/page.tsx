import CatalogPage from '@/app/components/CatalogPage';

export default function NovinkiPage() {
  return (
    <CatalogPage
      title="Новинки"
      description="Последние поступления товаров"
      apiEndpoint="/api/products-new?type=new&limit=100&sortBy=createdAt&sortOrder=desc"
      isNew={true}
      showCounter={true}
      emptyMessage="Новых товаров пока нет"
    />
  );
}
