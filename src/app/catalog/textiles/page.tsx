import { CatalogPage } from '@/app/components/CatalogPage';

export default function TextilesPage() {
  return (
    <CatalogPage
      title="Текстиль"
      description="Уютный текстиль для дома: скатерти, подушки, пледы и многое другое."
      category="textiles"
      showCategoryFilter={false}
    />
  );
}
