import type { Article, Category } from "./article";

export interface ArticleRepository {
  getArticles(): Promise<Article[]>;
  getArticleBySlug(slug: string): Promise<Article | null>;
  getCategories(): Promise<Category[]>;
}
