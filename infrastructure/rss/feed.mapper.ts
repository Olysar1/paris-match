import type { Article } from "@/domain/article/article";
import { deriveCategory } from "@/lib/category";
import { toISODate } from "@/lib/date";
import { deriveSlug } from "@/lib/slug";
import { RawItemSchema } from "./feed.schema";

export function mapItemToArticle(raw: unknown): Article | null {
  const parsed = RawItemSchema.safeParse(raw);
  if (!parsed.success) {
    return null;
  }

  const item = parsed.data;
  const media = item["media:content"];

  try {
    const image = media
      ? {
          url: media["@_url"],
          width: media["@_width"] ?? 0,
          height: media["@_height"] ?? 0,
          caption: media["media:description"] ?? null,
          credit: media["media:credit"] ?? null,
          alt: media["media:description"] ?? item.title,
        }
      : null;

    return {
      slug: deriveSlug(item.link),
      sourceUrl: item.link,
      title: item.title.trim(),
      description: item.description.trim(),
      publishedAt: toISODate(item.pubDate),
      category: deriveCategory(item.link),
      image,
    };
  } catch {
    return null;
  }
}
