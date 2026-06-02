import type { MetadataRoute } from "next";

import { getArticleRepository } from "@/infrastructure/article-repository";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getArticleRepository().getArticles();

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteConfig.url}/article/${article.slug}`,
    lastModified: article.publishedAt,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [
    {
      url: siteConfig.url,
      lastModified: articles[0]?.publishedAt,
      changeFrequency: "hourly",
      priority: 1,
    },
    ...articleEntries,
  ];
}
