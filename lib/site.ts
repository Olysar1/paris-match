export const siteConfig = {
  name: "Paris Match",
  description:
    "Paris Match — l’actualité internationale en images : politique, économie, culture et grands récits.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://paris-match.example",
  locale: "fr_FR",
} as const;
