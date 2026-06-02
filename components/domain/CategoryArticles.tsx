import type { ReactElement } from "react";

import type { Article } from "@/domain/article/article";
import { getArticleRepository } from "@/infrastructure/article-repository";
import { ArticleCard } from "./ArticleCard";
import { CategoryChips } from "./CategoryChips";

interface CategoryArticlesProps {
  searchParams: Promise<{ category?: string | string[] }>;
}

export async function CategoryArticles({
  searchParams,
}: CategoryArticlesProps): Promise<ReactElement> {
  const params = await searchParams;
  const active = typeof params.category === "string" ? params.category : null;

  const repository = getArticleRepository();
  const [articles, categories] = await Promise.all([
    repository.getArticles(),
    repository.getCategories(),
  ]);

  const rest = articles.slice(1);
  const visible: Article[] = active
    ? rest.filter((article) => article.category.slug === active)
    : rest;

  return (
    <>
      <CategoryChips categories={categories} active={active} />

      {visible.length === 0 ? (
        <p className="mt-6 text-muted-foreground">
          Aucun article dans cette catégorie pour le moment.
        </p>
      ) : (
        <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </>
  );
}
