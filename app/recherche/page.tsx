import type { Metadata } from "next";
import { Suspense } from "react";
import type { ReactElement } from "react";

import { BackButton } from "@/components/domain/BackButton";
import { SearchResults } from "@/components/domain/SearchResults";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Recherche",
  description: "Recherchez parmi les articles de Paris Match.",
  alternates: { canonical: "/recherche" },
  robots: { index: false, follow: true },
};

interface RecherchePageProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

function ResultsSkeleton(): ReactElement {
  return (
    <div className="mt-6">
      <Skeleton className="h-4 w-48" />
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

export default function RecherchePage({
  searchParams,
}: RecherchePageProps): ReactElement {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <BackButton />
      <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
        Recherche
      </h1>

      <Suspense fallback={<ResultsSkeleton />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
