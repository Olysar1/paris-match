import type { Category } from "@/domain/article/article";

const CATEGORY_LABELS: Record<string, string> = {
  international: "International",
  economie: "Économie",
  politique: "Politique",
  societe: "Société",
  culture: "Culture",
  idees: "Idées",
  planete: "Planète",
  sciences: "Sciences",
  sport: "Sport",
  sante: "Santé",
  pixels: "Pixels",
  campus: "Campus",
  education: "Éducation",
  "les-decodeurs": "Les Décodeurs",
};

function fallbackLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function deriveCategory(link: string): Category {
  const segments = new URL(link).pathname.split("/").filter(Boolean);
  const slug = segments[0] ?? "actualites";
  return { slug, name: CATEGORY_LABELS[slug] ?? fallbackLabel(slug) };
}
