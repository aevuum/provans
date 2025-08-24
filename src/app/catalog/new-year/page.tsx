import { CatalogPage } from '@/app/components/CatalogPage';

export default function NewYearPage() {
  return (
    <CatalogPage
      title="Новогодняя коллекция"
      description="Лучшие товары для праздничного новогоднего декора вашего дома."
      category="new-year"
      showCategoryFilter={false}
    />
  );
}
