# Paris Match — Architecture & Principles (Authoritative Assistant Context)

This is the **canonical context** for the Paris Match technical test. Treat everything here as
binding constraints and default choices on **every** prompt unless the user explicitly overrides it.
The goal of the project: a small, production-quality media site (homepage + article detail) built
with Next.js, oriented on **code quality, architecture, SEO, performance, robustness, and sUX/UI**.

---

## 0. Non-negotiable workflow rules

- **Read before you write.** This Next.js version (16.2.7) has breaking changes vs. older training
  data. Before writing/altering any Next.js feature, consult the bundled docs in
  `node_modules/next/dist/docs/` (App Router: `01-app/`). Heed deprecation notices. See `AGENTS.md`.
- **Move step by step.** Implement in small, reviewable increments. Start each task with a short
  plan (what changes, why, how to verify). Don't scaffold the whole app in one shot.
- **Stay inside the locked decisions** (Section 2). If a task seems to require breaking one, stop and
  flag it with 2–3 alternatives + a recommendation rather than silently diverging.
- **Every change must keep the build green:** `tsc` (strict), ESLint, and tests must pass.

## 1. Priority order when decisions conflict

1. **Functional correctness**.
2. **SEO & Accessibility** (semantic HTML, structured data, meta tags, WCAG AA).
3. **Performance** (Lighthouse ≥ 90 target; brief requires ≥ 85 Performance & SEO).
4. **Robustness** (graceful failure, validated inputs, no crash on bad/missing data).
5. **Code quality & maintainability** (readability, modularity, tests).

## 2. Locked technical decisions

| Area              | Decision                                                                                                                                                                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework         | **Next.js 16.2.7, App Router**, React 19.2.4, Server Components by default                                                                                                                                                                                                                                                      |
| Language          | **TypeScript strict** (already enabled). No `any` without justification.                                                                                                                                                                                                                                                        |
| Styling           | **Tailwind CSS v4** (CSS-first config via `@theme` in `app/globals.css`; there is **no** `tailwind.config.js`) **+ shadcn/ui** for accessible primitives                                                                                                                                                                        |
| Rendering         | **SSG + ISR via Cache Components** (see §4). Article + homepage are statically prerendered and revalidated on a schedule / on-demand.                                                                                                                                                                                           |
| Data source       | **Repository interface** with a committed **JSON dataset** as the default implementation (stable, fully controllable, ideal for SSG). A **Le Monde RSS adapter** is a pluggable alternative behind the same interface. UI/domain never import a concrete source directly. _(Confirm with user before building the data layer.)_ |
| Testing           | **Vitest + React Testing Library** (unit + integration), **Playwright** (e2e bonus)                                                                                                                                                                                                                                             |
| Package manager   | npm (a `package-lock.json` is committed)                                                                                                                                                                                                                                                                                        |
| Deployment target | Node / Vercel                                                                                                                                                                                                                                                                                                                   |

## 3. Clean Architecture & folder structure

Dependencies point **inward**: Presentation → Domain → Data. Inner layers never import outer ones;
the Domain defines interfaces that the Data layer implements (dependency inversion).

```
app/                 Presentation: routes, layouts, metadata, route handlers (server-first)
  (routes)/          page.tsx, layout.tsx, loading.tsx, error.tsx, not-found.tsx
  sitemap.ts         SEO file conventions
  robots.ts
components/
  ui/                Dumb, reusable primitives (incl. shadcn/ui components)
  domain/            Composed, app-aware presentational components (ArticleCard, Hero, …)
features/            Larger vertical slices (article/, search/) → components/ + hooks/
domain/              Entities (Article), use-cases, and repository INTERFACES (ports)
infrastructure/      Repository IMPLEMENTATIONS (adapters): json/, rss/. Parsing + mapping live here.
lib/                 Framework-agnostic helpers: formatters, fetch wrappers, seo builders, cn()
types/               Shared types/domain models (if not colocated in domain/)
hooks/               Reusable React hooks
public/              Static assets only
test/                Test setup, fixtures, e2e specs (or e2e/ for Playwright)
```

Rules:

- A component does **one** thing; props are explicit and side-effect free.
- Use the **container/presenter** split for data-heavy features (container fetches, presenter renders).
- External I/O (RSS, fs, HTTP) is **only** allowed in `infrastructure/`, reached through a domain
  interface. Validate/normalize external data at this boundary (see §8, Robustness).
- Keep the `'use client'` boundary as small and as low in the tree as possible.

## 4. Next.js 16 patterns & gotchas (READ — differs from older Next)

- **`fetch` is NOT cached by default.** A bare `fetch` blocks render and re-runs every request. To
  cache, opt in with the `use cache` directive; for fresh-per-request data, wrap the component in
  `<Suspense>` and stream.
- **Cache Components is our rendering model.** Enable `cacheComponents: true` in `next.config.ts`.
  This turns on Partial Prerendering (static shell + streamed dynamic holes). It is how we deliver
  **SSG + ISR** here:
  - **SSG / static shell:** prerender content that doesn't depend on runtime data; for dynamic
    routes provide `generateStaticParams()` so article pages are built statically.
  - **ISR / revalidation:** mark data/UI functions with `use cache`, then set lifetime with
    `cacheLife('hours' | 'days' | {stale,revalidate,expire})` and label with `cacheTag('articles')`.
    Refresh on-demand from Server Actions/Route Handlers via `revalidateTag` (stale-while-revalidate)
    or `updateTag` (immediate, read-your-writes). Prefer tag-based over `revalidatePath`.
  - If a piece truly must be per-request (cookies/headers/searchParams), wrap it in `<Suspense>`; an
    "Uncached data accessed outside of `<Suspense>`" build error means you forgot to cache or stream.
- **`params` and `searchParams` are async** — typed as `Promise<…>` and must be `await`ed in pages,
  layouts, `generateMetadata`, and `generateStaticParams` consumers.
- **Data fetching:** fetch in Server Components (async). Parallelize independent calls with
  `Promise.all`; use `Promise.allSettled` when partial failure must be tolerated. Dedupe a fetch
  shared between `generateMetadata` and the page with **`React.cache`** (request-scoped memoization).
- **Route handlers** (`app/api/.../route.ts`) only for server-side proxying, secrets, or on-demand
  revalidation endpoints — not for data the page can fetch directly.
- **Client data** (search/filter UX): prefer URL state (`searchParams`) + Server Components; reach
  for client-side state only for genuinely interactive widgets.
- Always run `next build` after non-trivial changes to confirm prerendering succeeded.

## 5. SEO implementation (heavily weighted)

- **Metadata:** set per route via the static `metadata` object or async `generateMetadata`. Every
  content page must define `title`, `description`, `alternates.canonical`, `robots`, and full
  **Open Graph + Twitter card** tags. Configure `metadataBase` once in the root layout.
- **Structured data (JSON-LD):** inject via a `<script type="application/ld+json">` built from typed
  helpers in `lib/`. Use `NewsArticle`/`Article` on detail pages, `WebSite` + `SearchAction` and
  `Organization` on the homepage, and `BreadcrumbList` where relevant. Validate against schema.org.
- **Headings:** exactly one `<h1>` per page; logical, sequential heading order. Use semantic
  landmarks (`<header> <nav> <main> <article> <footer>`).
- **Accessibility (WCAG AA min):** meaningful `alt` text, visible focus states, keyboard operability,
  color contrast ≥ 4.5:1, labels for inputs, ARIA only when semantics are insufficient, and a
  skip-to-content link.
- **Crawl files:** generate `app/sitemap.ts` and `app/robots.ts`. Provide OG images via
  `opengraph-image.(tsx|jpg)` (dynamic via `ImageResponse` from `next/og` when data-driven).

## 6. Performance

- **Targets:** Lighthouse ≥ 90 (brief floor is 85) for Performance & SEO; minimize CLS/LCP/INP.
- **Images:** always `next/image` with explicit `sizes`, correct `width/height` (or `fill`),
  `priority` only on the LCP/hero image, and modern formats (AVIF/WebP). Configure remote image
  hosts in `next.config.ts` if using external URLs.
- **Fonts:** `next/font` (already used) to self-host and avoid layout shift; subset to needed glyphs.
- **JS:** keep Server Components server-side; `dynamic()` import heavy/below-the-fold client widgets;
  no render-blocking third-party scripts (use `next/script` with proper strategy).
- **Caching:** lean on Cache Components (§4) for HTML; immutable assets get long cache headers
  automatically. Don't refetch the same data in metadata and page — memoize with `React.cache`.

## 7. UX/UI

- **Design tokens** live in `app/globals.css` under `@theme` (Tailwind v4) — colors, spacing, type
  scale, radius. shadcn/ui consumes CSS variables; keep light/dark in sync.
- **Visual hierarchy:** hero/highlighted article is unmistakably dominant; clear scale of
  headline → subhead → body → caption. Generous whitespace, readable measure (~60–75ch).
- **Responsive, mobile-first;** ≥ 44px touch targets; usable at 320px width.
- **States:** every interactive element has hover/focus/active/disabled + loading/empty/error states.
- **Accessibility UX:** visible focus rings, skip link, reduced-motion respect, semantic forms.
- Be creative but keep it **lightweight and usable** — no heavy animations or layout jank.

## 8. Robustness

- **Validate external data at the boundary** (infrastructure layer). Parse RSS/JSON defensively;
  prefer a schema validator (e.g. Zod) and map to the domain `Article` entity. Never trust feed shape.
- **Degrade gracefully:** missing image → placeholder; missing description → derived excerpt; empty
  list → friendly empty state; failed fetch → cached/fallback data or a route-level `error.tsx`.
- **Error boundaries:** provide `error.tsx` (route segment) and `not-found.tsx`; use `notFound()` for
  unknown article slugs (returns 404, not a crash).
- **No unhandled promise rejections**; tolerate partial failures with `Promise.allSettled` where one
  source failing shouldn't blank the page.
- **Deterministic builds:** the default JSON data source must make SSG reproducible offline/in CI.

## 9. Coding conventions

- TypeScript strict; explicit return types on exported functions; domain types in `domain/`/`types/`.
- Naming: components `PascalCase`, hooks `useX`, files match their default export. No abbreviations
  that hurt readability.
- Pure functions in `lib/` are framework-agnostic and unit-testable.
- Use the `@/*` path alias (configured in `tsconfig.json`). Keep imports ordered/grouped.
- Comments explain **why**, not what. Add docstrings to exported domain/use-case functions.
- ESLint (`eslint-config-next` flat config) and `tsc` are the source of truth; fix, don't suppress.

## 10. Testing (PDF requires ≥1 unit + ≥1 integration; e2e is bonus)

- **Vitest + RTL** for: pure logic in `lib/`/`domain/` (unit) and rendered components/data-mapping
  (integration), using fixtures from `test/`. Mock the repository, not `fetch` internals.
- **Playwright** for the bonus e2e: homepage → article navigation, search/filter, SEO `<head>`/JSON-LD
  presence.
- Tests are meaningful (assert behavior/output), not coverage theater. Co-locate unit tests or keep
  in `test/`; e2e in `e2e/` or `tests/e2e/`.
- Test commands belong in `package.json` (`test`, `test:e2e`) and should run in CI.

## 11. How the assistant should respond (deliverable conventions)

- Begin non-trivial tasks with a **short plan**: what will change, why, verification steps.
- Show **file paths** and concrete diffs/full files for edits; name the commands to run.
- For real tradeoffs, present **2–3 options + a recommendation** with rationale (don't bikeshed
  settled decisions in §2).
- Keep the README current with: project overview, technical/architectural choices, and SEO strategy
  (a required deliverable).
- Final deliverables: working app in a private GitHub repo, automated tests, README, and a **PR to
  `main`** for review.

## 12. Per-change acceptance checklist

- [ ] `tsc` passes (strict) and ESLint is clean.
- [ ] `next build` prerenders successfully (no uncached-data errors); SSG/ISR behaves as intended.
- [ ] Unit/integration tests for changed logic exist and pass.
- [ ] Content pages: correct `title`/meta, canonical, OG/Twitter, and JSON-LD present and valid.
- [ ] A11y smoke check: heading order, keyboard nav, focus visible, alt text, contrast.
- [ ] Perf: LCP image optimized with `next/image`; no new render-blocking scripts.
- [ ] Robustness: handles missing/malformed data and the unhappy path.

## 13. Reference commands

```bash
npm run dev      # local dev
npm run build    # production build — verify prerendering/SSG
npm run start    # serve production build
npm run lint     # eslint
# (to be added) npm test / npm run test:e2e
```

---

_End of canonical context. Update this file when an architectural decision changes; it overrides
stale assumptions from training data._
