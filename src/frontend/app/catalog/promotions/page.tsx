import CatalogPage from "../../components/CatalogPage";

export default function PromotionsAsciiPage() {
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
