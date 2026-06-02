import Link from "next/link";
import type { ReactElement } from "react";

import type { Category } from "@/domain/article/article";
import { Button } from "@/components/ui/button";

interface CategoryChipsProps {
  categories: Category[];
  active: string | null;
}

export function CategoryChips({
  categories,
  active,
}: CategoryChipsProps): ReactElement {
  return (
    <nav aria-label="Filtrer par catégorie" className="mt-4">
      <ul className="flex flex-wrap gap-2">
        <li>
          <Button
            asChild
            size="sm"
            variant={active === null ? "default" : "outline"}
            className="rounded-full"
          >
            <Link
              href="/"
              scroll={false}
              aria-current={active === null ? "page" : undefined}
            >
              Toutes
            </Link>
          </Button>
        </li>
        {categories.map((category) => {
          const isActive = category.slug === active;
          return (
            <li key={category.slug}>
              <Button
                asChild
                size="sm"
                variant={isActive ? "default" : "outline"}
                className="rounded-full"
              >
                <Link
                  href={`/?category=${category.slug}`}
                  scroll={false}
                  aria-current={isActive ? "page" : undefined}
                >
                  {category.name}
                </Link>
              </Button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
