import Link from "next/link";
import type { ReactElement } from "react";

import type { Article } from "@/domain/article/article";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/date";
import { CoverImage } from "./CoverImage";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps): ReactElement {
  return (
    <article>
      <Link
        href={`/article/${article.slug}`}
        className="block h-full rounded-xl outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Card className="h-full gap-0 pt-0">
          <div className="relative">
            <AspectRatio ratio={16 / 9}>
              <CoverImage
                image={article.image}
                sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                className="transition-transform duration-300 group-hover/card:scale-105"
              />
            </AspectRatio>
            <Badge variant="brand" className="absolute top-3 left-3">
              {article.category.name}
            </Badge>
          </div>
          <CardHeader className="pt-5">
            <time
              dateTime={article.publishedAt}
              className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
            >
              {formatDate(article.publishedAt)}
            </time>
            <CardTitle className="mt-1">
              <h3 className="font-heading text-lg leading-snug font-semibold tracking-tight transition-colors group-hover/card:text-brand">
                {article.title}
              </h3>
            </CardTitle>
            <CardDescription className="mt-2 line-clamp-3 leading-relaxed">
              {article.description}
            </CardDescription>
          </CardHeader>
        </Card>
      </Link>
    </article>
  );
}
