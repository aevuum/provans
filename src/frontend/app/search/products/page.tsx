import CatalogPage from "../../components/CatalogPage";

export default function SearchProductsPage() {
  // Корневой каталог в разделе поиска: отображаем только карточки товаров,
  // скрываем визуальные плитки категорий и загружаем большое количество
  // товаров (pageSize=1000) чтобы по умолчанию показывать все товары.
  return (
    <CatalogPage
      title="Продукция"
      showCategoryFilter={true}
      showCategoryTiles={false}
      pageSize={1000}
      minSearchLength={1}
    />
  );
}
