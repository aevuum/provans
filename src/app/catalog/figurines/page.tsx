import { Metadata } from 'next';
import CatalogPage from '../../components/CatalogPage';

export const metadata: Metadata = {
  title: 'Фигурки - Декоративные статуэтки | Provans Decor',
  description: 'Коллекция декоративных фигурок и статуэток в стиле прованс. Ангелы, животные, сказочные персонажи для украшения дома.',
  keywords: 'фигурки, статуэтки, декоративные фигурки, ангелы, прованс, декор для дома',
};

export default function FigurinesPage() {
  return (
    <CatalogPage 
      category="фигурки"
      title="Фигурки"
      description="Очаровательные декоративные фигурки и статуэтки, которые привнесут особую атмосферу в ваш дом. От нежных ангелочков до забавных животных - каждая фигурка рассказывает свою историю."
    />
  );
}
