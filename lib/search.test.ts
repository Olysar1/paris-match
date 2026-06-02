import { describe, expect, it } from "vitest";

import type { Article } from "@/domain/article/article";
import { filterArticles } from "@/lib/search";

function makeArticle(overrides: Partial<Article>): Article {
  return {
    slug: "slug",
    sourceUrl: "https://www.lemonde.fr/x",
    title: "Titre",
    description: "Description",
    publishedAt: "2026-06-02T00:00:00.000Z",
    category: { slug: "international", name: "International" },
    image: null,
    ...overrides,
  };
}

const articles = [
  makeArticle({ slug: "a", title: "Élections en Algérie", description: "scrutin" }),
  makeArticle({ slug: "b", title: "Économie européenne", description: "salaires" }),
  makeArticle({ slug: "c", title: "Guerre en Ukraine", description: "Kiev" }),
];

describe("filterArticles", () => {
  it("returns no results for an empty query", () => {
    expect(filterArticles(articles, "")).toEqual([]);
    expect(filterArticles(articles, "   ")).toEqual([]);
  });

  it("matches accent- and case-insensitively", () => {
    const results = filterArticles(articles, "elections");
    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe("a");
  });

  it("matches against the description as well as the title", () => {
    expect(filterArticles(articles, "kiev")).toHaveLength(1);
  });

  it("requires every term to match (AND semantics)", () => {
    expect(filterArticles(articles, "economie salaires")).toHaveLength(1);
    expect(filterArticles(articles, "economie ukraine")).toHaveLength(0);
  });
});
