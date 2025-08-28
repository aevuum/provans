import CatalogPage from "@/components/CatalogPage";

export default function FurniturePage() {
  return (
    <CatalogPage
      title="Мебель"
      description="Стильная и удобная мебель для вашего интерьера. Подберите идеальные решения для дома."
      category="furniture"
      showCategoryFilter={false}
    />
  );
}
