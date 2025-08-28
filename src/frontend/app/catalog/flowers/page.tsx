import CatalogPage from "@/components/CatalogPage";

export default function FlowersPage() {
  return (
    <CatalogPage
      title="Цветы"
      description="Искусственные цветы высочайшего качества в стиле Прованс. Создайте вечную красоту в вашем интерьере"
      category="flowers"
      showCategoryFilter={false}
    />
  );
}
