import type { Article } from "@/domain/article/article";

const DIACRITICS = /\p{Diacritic}/gu;

function normalize(text: string): string {
  return text.normalize("NFD").replace(DIACRITICS, "").toLowerCase().trim();
}

export function filterArticles(articles: Article[], query: string): Article[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return [];
  }

  const terms = normalizedQuery.split(/\s+/);
  return articles.filter((article) => {
    const haystack = normalize(`${article.title} ${article.description}`);
    return terms.every((term) => haystack.includes(term));
  });
}
