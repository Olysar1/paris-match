import type { Metadata } from "next";
import { Suspense, type ReactElement } from "react";

import { CategoryArticles } from "@/components/domain/CategoryArticles";
import { HeroArticle } from "@/components/domain/HeroArticle";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JsonLd } from "@/components/ui/json-ld";
import { Skeleton } from "@/components/ui/skeleton";
import { getArticleRepository } from "@/infrastructure/article-repository";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

interface HomePageProps {
  searchParams: Promise<{ category?: string | string[] }>;
}

function CategorySkeleton(): ReactElement {
  return (
    <div>
      <div className="mt-4 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: HomePageProps): Promise<ReactElement> {
  const articles = await getArticleRepository().getArticles();
  const hero = articles[0];

  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={organizationJsonLd()} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="font-heading text-sm font-semibold tracking-[0.25em] text-brand uppercase">
          À la une
        </h1>

        {articles.length === 0 ? (
          <Card className="mt-8 py-12 text-center">
            <CardHeader className="items-center">
              <CardTitle>
                <h2 className="font-heading text-xl font-semibold">
                  Aucun article disponible
                </h2>
              </CardTitle>
              <CardDescription className="mt-2 max-w-md">
                Le flux d’actualités est momentanément indisponible. Merci de
                réessayer plus tard.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            {hero ? (
              <div className="mt-4">
                <HeroArticle article={hero} />
              </div>
            ) : null}

            <section className="mt-12" aria-labelledby="latest-heading">
              <h2
                id="latest-heading"
                className="font-heading text-2xl font-bold tracking-tight"
              >
                Derniers articles
              </h2>
              <Suspense fallback={<CategorySkeleton />}>
                <CategoryArticles searchParams={searchParams} />
              </Suspense>
            </section>
          </>
        )}
      </div>
    </>
  );
}
