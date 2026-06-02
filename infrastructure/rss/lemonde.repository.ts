import { XMLParser } from "fast-xml-parser";
import { cacheLife, cacheTag } from "next/cache";
import type { Article, Category } from "@/domain/article/article";
import type { ArticleRepository } from "@/domain/article/article-repository";
import { mapItemToArticle } from "./feed.mapper";
import { RawFeedSchema } from "./feed.schema";

const FEED_URL = "https://www.lemonde.fr/international/rss_full.xml";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  processEntities: true,
  removeNSPrefix: false,
});

async function loadArticles(): Promise<Article[]> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 600, expire: 3600 });
  cacheTag("articles");

  try {
    const response = await fetch(FEED_URL, {
      headers: { "User-Agent": "ParisMatch/1.0 (+https://paris-match.example)" },
    });
    if (!response.ok) {
      return [];
    }

    const parsed = RawFeedSchema.safeParse(parser.parse(await response.text()));
    if (!parsed.success) {
      return [];
    }

    return parsed.data.rss.channel.item
      .map(mapItemToArticle)
      .filter((article): article is Article => article !== null);
  } catch {
    return [];
  }
}

export const lemondeRssRepository: ArticleRepository = {
  async getArticles() {
    return loadArticles();
  },

  async getArticleBySlug(slug) {
    const articles = await loadArticles();
    return articles.find((article) => article.slug === slug) ?? null;
  },

  async getCategories() {
    const articles = await loadArticles();
    const categories = new Map<string, Category>();
    for (const article of articles) {
      categories.set(article.category.slug, article.category);
    }
    return [...categories.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "fr"),
    );
  },
};
