import CatalogPage from "@/components/CatalogPage";

export default function TablewarePage() {
  return (
    <CatalogPage
      title="Посуда"
  // description="Элегантная посуда для вашего стола. Создайте стильную атмосферу за любым ужином."
      category="tableware"
      showCategoryFilter={false}
    />
  );
}
