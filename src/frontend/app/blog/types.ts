export type BlogSection = {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  images?: string[]; // пути к изображениям из public
};

export type BlogPost = {
  id?: number; // внешний идентификатор для синхронизации
  slug: string;
  title: string;
  description?: string; // краткое описание из JSON
  content?: string; // полный текст статьи (Markdown/текст)
  excerpt: string;
  category: string;
  date: string; // ISO либо YYYY-MM-DD
  coverImage: string; // путь из public для карточки/баннера
  sections: BlogSection[];
  // Если false — внутри статьи и в баннере не показываем фото, только текстовый баннер
  showImages?: boolean;
};
