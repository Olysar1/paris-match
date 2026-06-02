import Link from "next/link";
import { Search } from "lucide-react";
import { Suspense, type ReactElement } from "react";

import { Button } from "@/components/ui/button";
import { SearchBox } from "./SearchBox";

export function SiteHeader(): ReactElement {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/75">
      <div aria-hidden="true" className="h-1 w-full bg-brand" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="font-heading text-2xl font-extrabold tracking-tight text-brand sm:text-3xl">
            Paris Match
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <p className="hidden text-sm font-medium text-muted-foreground md:block">
            L’actualité internationale en images
          </p>
          <Suspense
            fallback={
              <Button
                variant="ghost"
                size="sm"
                aria-label="Ouvrir la recherche"
              >
                <Search aria-hidden="true" />
                <span className="hidden sm:inline">Rechercher</span>
              </Button>
            }
          >
            <SearchBox />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
