import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Article } from "@/domain/article/article";
import { ArticleCard } from "@/components/domain/ArticleCard";

const article: Article = {
  slug: "un-titre-de-test-123",
  sourceUrl: "https://www.lemonde.fr/international/article/x.html",
  title: "Un titre de test",
  description: "Une description de test.",
  publishedAt: "2026-06-02T12:00:00.000Z",
  category: { slug: "international", name: "International" },
  image: {
    url: "https://img.lemde.fr/photo.jpg",
    width: 644,
    height: 322,
    alt: "Légende de la photo",
    caption: "Légende de la photo",
    credit: "AFP",
  },
};

describe("ArticleCard", () => {
  it("renders the article content and links to its detail page", () => {
    render(<ArticleCard article={article} />);

    expect(
      screen.getByRole("heading", { name: "Un titre de test" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Une description de test.")).toBeInTheDocument();
    expect(screen.getByText("International")).toBeInTheDocument();

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/article/un-titre-de-test-123",
    );
    expect(
      screen.getByRole("img", { name: "Légende de la photo" }),
    ).toBeInTheDocument();
  });

  it("renders a placeholder when the article has no image", () => {
    render(<ArticleCard article={{ ...article, image: null }} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
