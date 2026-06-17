# SEO

## Canonical URLs

Canonical URLs use the `SITE_URL` environment variable. Set it at build time:

```bash
SITE_URL=https://example.com pnpm build
```

The `src/lib/url.ts` helper `getCanonicalUrl(path)` builds the full URL from the site root and the current path. If `SITE_URL` is not set, only the relative path is used.

## Open Graph

`MainLayout.astro` outputs the following meta tags when frontmatter fields are present:

| Tag              | Source                                                                    |
| ---------------- | ------------------------------------------------------------------------- |
| `og:title`       | Entry `title`                                                             |
| `og:description` | Entry `description`                                                       |
| `og:type`        | Always `website`                                                          |
| `og:url`         | Canonical URL                                                             |
| `og:image`       | Entry `image` field (absolute paths only, resolved via `getOgImageUrl()`) |

## Semantic HTML

- `<article>` wraps content on detail pages.
- `<nav aria-label="breadcrumb">` for breadcrumb trails.
- `<h1>`–`<h3>` in correct hierarchy.
- `<time datetime="...">` for dates.
- `<html lang>` set from entry's `lang` frontmatter.

## Client-side locale

The site uses a single-URL pattern — the URL never changes when the user switches locales. Content is swapped client-side via `data-locales` and `data-content-locale` attributes. Search engines only see the default (English) server-rendered version.

## Config reference

```js
// astro.config.mjs
export default defineConfig({
  site: process.env.SITE_URL || "https://default.url",
  // ...
});
```
