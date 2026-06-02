export interface Category {
  slug: string;
  name: string;
}

export interface ArticleImage {
  url: string;
  width: number;
  height: number;
  alt: string;
  caption: string | null;
  credit: string | null;
}

export interface Article {
  slug: string;
  sourceUrl: string;
  title: string;
  description: string;
  publishedAt: string;
  category: Category;
  image: ArticleImage | null;
}
