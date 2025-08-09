import { Metadata } from 'next';
import CatalogPage from '../../components/CatalogPage';

export const metadata: Metadata = {
  title: 'Шкатулки - Коробочки для украшений | Provans Decor',
  description: 'Изысканные шкатулки и коробочки в стиле Прованс для хранения украшений и мелочей. Организуйте пространство с нашими элегантными решениями.',
  keywords: 'шкатулки, коробочки, прованс, хранение украшений, декор для дома',
};

export default function BoxesPage() {
  return (
    <CatalogPage 
      category="шкатулки"
      title="Шкатулки"
      description="Изысканные шкатулки и коробочки в стиле Прованс для хранения украшений и мелочей. Каждая шкатулка - это не просто предмет хранения, а настоящее произведение искусства, которое украсит ваш интерьер."
    />
  );
}
