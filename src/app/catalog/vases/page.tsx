import type { Metadata } from 'next';

import { CatalogPage } from '@/app/components/CatalogPage';

export default function VasesPage() {
  return (
    <CatalogPage
      title="Вазы"
      description="Элегантные вазы в стиле Прованс для создания уютного интерьера. Выберите идеальную вазу из нашей коллекции"
      category="vases"
      showCategoryFilter={false}
    />
  );
}

export const metadata: Metadata = {
  title: 'Вазы — Provans Decor',
  description: 'Элегантные вазы в стиле Прованс. Большой выбор, быстрая доставка по России.',
};
