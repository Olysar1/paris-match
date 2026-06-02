import type { ArticleRepository } from "@/domain/article/article-repository";
import { lemondeRssRepository } from "./rss/lemonde.repository";

export function getArticleRepository(): ArticleRepository {
  return lemondeRssRepository;
}
