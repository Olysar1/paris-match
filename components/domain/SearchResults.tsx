import type { ReactElement } from "react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getArticleRepository } from "@/infrastructure/article-repository";
import { filterArticles } from "@/lib/search";
import { ArticleCard } from "./ArticleCard";

interface SearchResultsProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

export async function SearchResults({
  searchParams,
}: SearchResultsProps): Promise<ReactElement> {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : (params.q ?? "");
  const query = rawQuery.trim();

  if (!query) {
    return (
      <p className="mt-6 text-muted-foreground">
        Saisissez un terme pour rechercher parmi les articles.
      </p>
    );
  }

  const articles = await getArticleRepository().getArticles();
  const results = filterArticles(articles, query);

  return (
    <div className="mt-6">
      <p className="text-sm text-muted-foreground">
        {results.length} résultat{results.length > 1 ? "s" : ""} pour{" "}
        <span className="font-medium text-foreground">« {query} »</span>
      </p>

      {results.length === 0 ? (
        <Card className="mt-6 py-12 text-center">
          <CardHeader className="items-center">
            <CardTitle>
              <h2 className="font-heading text-xl font-semibold">
                Aucun résultat
              </h2>
            </CardTitle>
            <CardDescription className="mt-2 max-w-md">
              Aucun article ne correspond à votre recherche. Essayez d’autres
              mots-clés.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
