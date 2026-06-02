import Link from "next/link";
import type { ReactElement } from "react";

import type { Article } from "@/domain/article/article";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/date";
import { CoverImage } from "./CoverImage";

interface HeroArticleProps {
  article: Article;
}

export function HeroArticle({ article }: HeroArticleProps): ReactElement {
  return (
    <article>
      <Link
        href={`/article/${article.slug}`}
        className="block rounded-xl outline-none transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Card className="gap-0 overflow-hidden p-0">
          <div className="relative">
            <AspectRatio ratio={16 / 9}>
              <CoverImage
                image={article.image}
                sizes="(min-width: 1280px) 1152px, 100vw"
                priority
                className="transition-transform duration-500 group-hover/card:scale-105"
              />
            </AspectRatio>
            <Badge variant="brand" className="absolute top-4 right-4">
              {article.category.name}
            </Badge>
          </div>
          <CardContent className="px-6 py-6 sm:px-8 sm:py-8">
            <time
              dateTime={article.publishedAt}
              className="text-xs font-semibold tracking-wider text-brand uppercase"
            >
              {formatDate(article.publishedAt)}
            </time>
            <h2 className="mt-2 font-heading text-3xl leading-tight font-bold tracking-tight transition-colors group-hover/card:text-brand sm:text-4xl lg:text-5xl">
              {article.title}
            </h2>
            <p className="mt-3 line-clamp-3 max-w-prose text-base leading-relaxed text-muted-foreground sm:text-lg">
              {article.description}
            </p>
            <Button asChild className="mt-5 w-fit">
              <span>Lire l’article</span>
            </Button>
          </CardContent>
        </Card>
      </Link>
    </article>
  );
}
