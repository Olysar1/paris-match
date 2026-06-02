import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { cache, type ReactElement } from "react";

import { CoverImage } from "@/components/domain/CoverImage";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/ui/json-ld";
import { getArticleRepository } from "@/infrastructure/article-repository";
import { formatDate } from "@/lib/date";
import { breadcrumbJsonLd, newsArticleJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const getArticle = cache((slug: string) =>
  getArticleRepository().getArticleBySlug(slug),
);

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const articles = await getArticleRepository().getArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: "Article introuvable" };
  }

  const path = `/article/${slug}`;

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      url: path,
      publishedTime: article.publishedAt,
      section: article.category.name,
      images: article.image
        ? [
            {
              url: article.image.url,
              width: article.image.width,
              height: article.image.height,
              alt: article.image.alt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: article.image ? [article.image.url] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: ArticlePageProps): Promise<ReactElement> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const breadcrumbs = [
    { name: "Accueil", url: siteConfig.url },
    {
      name: article.category.name,
      url: `${siteConfig.url}/?category=${article.category.slug}`,
    },
    { name: article.title, url: `${siteConfig.url}/article/${slug}` },
  ];

  return (
    <>
      <JsonLd data={newsArticleJsonLd(article)} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />

      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Accueil</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/?category=${article.category.slug}`}>
                  {article.category.name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1">
                {article.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Badge asChild variant="brand">
            <Link href={`/?category=${article.category.slug}`}>
              {article.category.name}
            </Link>
          </Badge>
          <time
            dateTime={article.publishedAt}
            className="text-sm text-muted-foreground"
          >
            {formatDate(article.publishedAt)}
          </time>
        </div>

        <h1 className="mt-3 font-heading text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
          {article.title}
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {article.description}
        </p>

        <figure className="mt-6">
          <div className="relative overflow-hidden rounded-xl">
            <AspectRatio ratio={16 / 9}>
              <CoverImage
                image={article.image}
                sizes="(min-width: 768px) 768px, 100vw"
                priority
              />
            </AspectRatio>
          </div>
          {article.image && (article.image.caption || article.image.credit) ? (
            <figcaption className="mt-2 text-xs text-muted-foreground">
              {article.image.caption}
              {article.image.credit ? (
                <span>
                  {article.image.caption ? " · " : ""}© {article.image.credit}
                </span>
              ) : null}
            </figcaption>
          ) : null}
        </figure>

        <aside className="mt-8 rounded-xl border bg-muted/30 p-5 sm:p-6">
          <p className="text-sm text-muted-foreground">
            Ceci est un résumé issu du flux de Le Monde. Lisez la version
            intégrale sur leur site.
          </p>
          <Button asChild className="mt-4">
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink aria-hidden="true" />
              Lire l’article complet sur Le Monde
            </a>
          </Button>
        </aside>
      </article>
    </>
  );
}
