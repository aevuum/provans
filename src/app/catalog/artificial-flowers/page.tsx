import CatalogPage from "@/components/CatalogPage";

export default function ArtificialFlowersPage() {
  return (
      <CatalogPage
        category="artificial-flowers"
        title="Искусственные цветы"
  // description="Яркие и реалистичные искусственные цветы для вашего интерьера."
        showCategoryFilter={false}
      />
  );
}
