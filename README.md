# Paris Match — Technical Test

A small, production-quality media site (homepage + article detail) built with **Next.js 16 (App Router)**, **React 19**, **TypeScript (strict)**, **Tailwind CSS v4**, and **shadcn/ui**. Articles are sourced live from the **Le Monde International RSS feed**, normalized through a Clean Architecture data layer, and served with **SSG + ISR** via Next 16 Cache Components.

---

## Features

- **Homepage** — a dominant hero (à la une) + responsive article grid.
- **Article detail** (`/article/[slug]`) — title, date, category, hero image with caption + photo credit, standfirst, and a **"Lire l'article complet"** link out to the original Le Monde article.
- **Search** (`/recherche`) — an expandable header search; submitting navigates to a server-rendered results page filtered by title + description (accent/case-insensitive).
- **Category filter** — chips beside "Derniers articles" filter the grid via the URL, fully server-rendered.
- **SEO** — per-page metadata, Open Graph / Twitter cards, JSON-LD (`WebSite` + `Organization` on the homepage, `NewsArticle` + `BreadcrumbList` on articles), `sitemap.xml`, `robots.txt`.
- **Robust** — defensive feed parsing/validation, graceful empty/error states, branded 404.

---

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build (verifies SSG/ISR prerendering)
npm run start    # serve the production build
npm run lint     # ESLint (flat config)
npm test         # Vitest (unit + integration)
npm run test:watch
```

> Configuration: set `NEXT_PUBLIC_SITE_URL` to your deployed origin so canonical URLs, Open Graph URLs, the sitemap, and JSON-LD use the correct absolute base. It defaults to a placeholder for local development.

Requirements: Node 20+ (developed on Node 24). Package manager: npm (a `package-lock.json` is committed for reproducible installs).

---

## Tech stack & rationale

| Area      | Choice                                       | Why                                                                                                          |
| --------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Framework | Next.js 16 App Router, Server Components     | Server-first rendering for SEO and minimal client JS.                                                        |
| Rendering | Cache Components (`cacheComponents: true`)   | One model for **SSG + ISR** + Partial Prerendering (static shell + streamed holes).                          |
| Language  | TypeScript (strict)                          | Type safety end to end; explicit return types on exported functions.                                         |
| Styling   | Tailwind v4 (CSS-first `@theme`) + shadcn/ui | Accessible Radix-based primitives; design tokens (incl. a Paris Match red brand token) in `app/globals.css`. |
| Data      | `fast-xml-parser` + `zod`                    | Parse the RSS XML with full control; validate/normalize at the boundary.                                     |
| URL state | `nuqs`                                       | Type-safe `q` search-param state.                                                                            |
| Testing   | Vitest + React Testing Library               | Fast, first-class ESM/TS support for unit + integration tests.                                               |

---

## Architecture — Clean Architecture (ports & adapters)

Dependencies point **inward**: Presentation → Domain → Data. The Domain defines interfaces; the Infrastructure layer implements them (dependency inversion). The UI never imports a concrete data source.

```
app/                 Presentation: routes, layouts, metadata, sitemap/robots, error/not-found
components/
  ui/                shadcn/ui primitives (button, card, badge, input, …) + JsonLd
  domain/            App-aware components (HeroArticle, ArticleCard, SearchBox, CategoryChips, …)
domain/article/      Entities (Article, Category) + ArticleRepository interface (port)
infrastructure/rss/  RSS adapter: zod schema, mapper, repository (use cache) + factory
lib/                 Framework-agnostic helpers: slug, category, date, search, seo, site, cn
test/                Vitest setup
```

**Data flow (homepage):**
`page.tsx` → `getArticleRepository()` (factory) → `lemondeRssRepository.getArticles()` → `loadArticles()` (`use cache`) → `fetch` RSS → `fast-xml-parser` → `zod` validate (per item) → `mapItemToArticle()` → `Article[]` → rendered by `HeroArticle` / `ArticleCard`.

Swapping the data source (e.g. to a JSON dataset, or a mock in tests) means writing one class behind `ArticleRepository` — no UI changes.

### Data source: Le Monde RSS

Source: `https://www.lemonde.fr/international/rss_full.xml`. Each item provides a title, publish date, short **description** (standfirst), the article URL, and one image (URL + caption + photo credit). Notable constraints the design accounts for:

- **No full article body** (no `content:encoded`) → the detail page shows an honest aggregated brief and links out to the full article on Le Monde. No scraping.
- **No author / no category tag** → the **category is derived from the URL path** (`/international/`, `/economie/`, …) and mapped to a French label; search covers title + description.
- **The feed rotates** (~20 latest items) → `generateStaticParams` prebuilds current slugs; rotated-out slugs resolve to `notFound()` (404).

All external data is validated **per item** with zod, so one malformed entry can't break the page, and network/parse failures degrade to an empty state rather than a crash.

### Rendering & caching (SSG + ISR)

- `loadArticles()` is marked `use cache` with `cacheLife({ stale: 60, revalidate: 600, expire: 3600 })` and `cacheTag('articles')` → the feed is fetched at build, baked into static HTML, and **revalidated every ~10 minutes** (ISR). Tag-based on-demand revalidation (`revalidateTag('articles')`) is ready for a future webhook.
- Article pages are statically prerendered via `generateStaticParams` (SSG).
- Dynamic, per-request data (`searchParams` for search and category filter) is wrapped in `<Suspense>`, so the page renders a **static shell** and streams the dynamic part (Partial Prerendering).

---

## SEO strategy

- **Metadata**: `metadataBase` + default Open Graph/Twitter and a title template in the root layout; each article sets its own `title`, `description`, `canonical`, OG (`type: article`, `publishedTime`, `section`, image) and Twitter card via async `generateMetadata`. The fetch is deduped with `React.cache` so metadata and the page share one request.
- **Structured data (JSON-LD)**: `WebSite` (+ `SearchAction`) and `Organization` on the homepage; `NewsArticle` (with `isBasedOn` → the Le Monde source) and `BreadcrumbList` on article pages. Emitted as `<script type="application/ld+json">`.
- **Canonicalization**: filtered homepage URLs (`/?category=…`) canonicalize to `/`, so query-param variants don't dilute indexing. The search page is `noindex`.
- **Crawl files**: `app/sitemap.ts` (homepage + every article) and `app/robots.ts` (allow all, disallow `/recherche`, point to the sitemap).
- **Semantic HTML & a11y (WCAG AA target)**: one `<h1>` per page, logical heading order, landmarks (`header/nav/main/article/figure/footer`), `lang="fr"`, skip-to-content link, visible focus rings, `aria-current` on the active chip, meaningful `alt` text, and a missing-image placeholder.

## Performance

- `next/image` everywhere with explicit `sizes`; `priority` only on the LCP image (hero / article cover); remote host configured in `next.config.ts`.
- Self-hosted fonts via `next/font` (Inter for body, Playfair Display for headings) to avoid layout shift.
- Server-first: the only client islands are the search box, the "back" button, and the tiny Radix `AspectRatio`.
- Cache Components serve static HTML with streamed dynamic holes; immutable assets get long cache headers automatically.

## Search & category filter — preserving SSR

Both features keep state in the **URL** rather than client memory, so every view is a real server render (shareable, crawlable, no flash):

- **Search**: the header `SearchBox` (collapsible, keyboard-accessible) submits to `/recherche?q=…`; the results page reads `q` server-side inside `<Suspense>` and filters. `nuqs` owns the `q` param and refines in place when already on the results page.
- **Category**: chips are progressive-enhancement `<Link>`s to `/?category=<slug>`; a `<Suspense>`-wrapped Server Component reads the param and renders the filtered grid (active chip computed server-side). Works without JavaScript.

## Robustness

- External data validated at the infrastructure boundary (zod), mapped to the domain entity; bad items skipped, not fatal.
- Feed/network failure → empty state; unknown slug → `notFound()`; route errors → `app/error.tsx`; custom `app/not-found.tsx`.
- Deterministic, offline-tolerant build (a failed feed fetch yields an empty—but successful—build).

## Testing

Run with `npm test` (Vitest + React Testing Library).

- **Unit**: `deriveSlug`, `formatDate`/`toISODate`, `filterArticles` (accent/case-insensitive, AND semantics), and the RSS `mapItemToArticle` (correct mapping + `null` on malformed input / missing image).
- **Integration**: `ArticleCard` renders its content, links to the correct detail URL, and shows the image / placeholder.

---

## Project structure

```
app/
  layout.tsx            Root layout: fonts, metadata defaults, header/footer, skip link
  page.tsx              Homepage (hero + Suspense-wrapped category grid)
  article/[slug]/       Article detail (generateStaticParams, generateMetadata, JSON-LD)
  recherche/            Search results page
  sitemap.ts robots.ts  SEO crawl files
  error.tsx not-found.tsx
components/ui/          shadcn/ui primitives + JsonLd
components/domain/      HeroArticle, ArticleCard, CoverImage, SearchBox, CategoryChips, …
domain/article/         Article entity + ArticleRepository port
infrastructure/rss/     zod schema, mapper, Le Monde repository, factory
lib/                    slug, category, date, search, seo, site, utils
```

## Known limitations / possible improvements

- The feed has no full article body or author, so the detail page is a brief + link-out by design.
- A dynamic `opengraph-image` (via `next/og`) could replace the feed image for richer share cards.
