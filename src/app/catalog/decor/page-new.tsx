'use client';

// import { CatalogPage } from '@app/components/CatalogPage';
import {CatalogPage} from '@/app/components/CatalogPage';

export default function DecorCategoryPage() {
  return (
    <CatalogPage
      title="Декор"
      description="Изысканные декоративные элементы в стиле Прованс для создания уютного интерьера"
      apiEndpoint="/api/products?category=decor"
      category="decor"
    />
  );
}
