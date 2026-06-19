# Special pages (Home / Resume)

Home (`/`) and resume (`/resume/`) are content-driven pages rendered from the `page` collection in `src/content/page/`. Each locale variant is a separate markdown file using the `{name}.{locale}.md` naming convention.

## File naming

```
src/content/page/
├── home.en.md          ← English home page
├── home.pt.md          ← Portuguese home page
├── home.eo.md          ← Esperanto home page
├── resume.en.md        ← English resume
├── resume.pt.md        ← Portuguese resume
└── resume.eo.md        ← Esperanto resume
```

Each file's frontmatter must set `lang` to its locale:

```yaml
---
title: "Home"
description: "Welcome to my portfolio and knowledge base"
lang: en
---
```

## Home page (`src/pages/index.astro`)

The home route fetches all `page` collection entries, then iterates `SUPPORTED_LOCALES` to find the matching locale file:

```astro
---
import MainLayout from "@layouts/MainLayout.astro";
import AstroArticleImageViewer from "@components/shared/_astro/AstroArticleImageViewer.astro";
import { getCollection } from "astro:content";
import { SUPPORTED_LOCALES } from "@i18n/labels";

const pages = await getCollection("page");
---

<MainLayout>
  <div class="grid gap-6">
    {
      SUPPORTED_LOCALES.map((locale) => {
        const page = pages.find((p) => p.data.lang === locale);
        return (
          page && (
            <div data-content-locale={locale}>
              <AstroArticleImageViewer entry={page} />
            </div>
          )
        );
      })
    }
  </div>
</MainLayout>
```

Each locale's content is rendered into a `<div data-content-locale={locale}>`. At server time, all locale variants are present in the HTML. The inline `<script>` in `MainLayout.astro` and the `applyLocale()` function hide/show these divs based on the user's `locale` cookie — only one locale's content is visible at a time.

## Resume page (`src/pages/resume.astro`)

The resume route follows the same pattern but adds locale-aware `<title>` and `<meta name="description">` tags for SEO:

```astro
---
import MainLayout from "@layouts/MainLayout.astro";
import AstroArticleImageViewer from "@components/shared/_astro/AstroArticleImageViewer.astro";
import { getCollection } from "astro:content";
import { SUPPORTED_LOCALES } from "@i18n/labels";

const pages = await getCollection("page");
const resumePages = pages.filter((p) => p.id.startsWith("resume"));

// Build locale-aware title/description maps
const titleLabels: Record<string, string> = {};
const descLabels: Record<string, string> = {};
for (const locale of SUPPORTED_LOCALES) {
  const page = resumePages.find((p) => p.data.lang === locale);
  titleLabels[locale] = page?.data.title ?? "Resume";
  descLabels[locale] = page?.data.description ?? "";
}
// Use English as the SSR default; client-side script swaps them
const defaultTitle = titleLabels["en"] ?? "Resume";
const defaultDesc = descLabels["en"] ?? undefined;
const defaultEntry = resumePages.find((p) => p.data.lang === "en");
const defaultKeywords = defaultEntry?.data.tags;
---

<MainLayout
  title={defaultTitle}
  description={defaultDesc}
  keywords={defaultKeywords}
  titleLabels={JSON.stringify(titleLabels)}
>
  <div class="grid gap-6">
    {
      SUPPORTED_LOCALES.map((locale) => {
        const page = resumePages.find((p) => p.data.lang === locale);
        return (
          page && (
            <div data-content-locale={locale}>
              <AstroArticleImageViewer entry={page} />
            </div>
          )
        );
      })
    }
  </div>
</MainLayout>
```

Key differences from the home page:

- **Filters** to only `resume*` entries via `p.id.startsWith("resume")`
- **Pre-builds `titleLabels`** and `descLabels` — maps each locale to its page's title/description. The English version is used as the SSR default (for search engines). The `titleLabels` JSON is passed to `MainLayout` as a `titleLabels` prop, which the inline script reads to swap `<title>` on locale change.
- **Passes `keywords`** from the English entry's tags for meta keywords.

## Adding a new locale

To add a new language (e.g., Japanese `ja`):

1. Add `"ja"` to `SUPPORTED_LOCALES` in `src/i18n/labels.ts`
2. Create `src/content/page/home.ja.md` and `src/content/page/resume.ja.md` with `lang: ja` in frontmatter
3. Add Japanese translations in `src/i18n/labels.ts` under the `ja` key

Both route files automatically pick up the new locale — no code changes needed.

## Adding a new special page (e.g. `/about/`)

To create a new page type at a custom route (e.g., `/about/`):

1. **Create locale files** in `src/content/page/`:

   ```
   src/content/page/
   ├── about.en.md
   ├── about.pt.md
   └── about.eo.md
   ```

   Each file's `id` is the stem `about` plus `.en`/`.pt`/`.eo` — the `startsWith("about")` filter will find them.

2. **Create a route page** at `src/pages/about.astro` following the resume pattern:

   ```astro
   ---
   import MainLayout from "@layouts/MainLayout.astro";
   import AstroArticleImageViewer from "@components/shared/_astro/AstroArticleImageViewer.astro";
   import { getCollection } from "astro:content";
   import { SUPPORTED_LOCALES } from "@i18n/labels";

   const pages = await getCollection("page");
   const aboutPages = pages.filter((p) => p.id.startsWith("about"));

   const titleLabels: Record<string, string> = {};
   for (const locale of SUPPORTED_LOCALES) {
     const page = aboutPages.find((p) => p.data.lang === locale);
     titleLabels[locale] = page?.data.title ?? "About";
   }
   const defaultTitle = titleLabels["en"] ?? "About";
   const defaultEntry = aboutPages.find((p) => p.data.lang === "en");
   ---

   <MainLayout title={defaultTitle} titleLabels={JSON.stringify(titleLabels)}>
     <div class="grid gap-6">
       {
         SUPPORTED_LOCALES.map((locale) => {
           const page = aboutPages.find((p) => p.data.lang === locale);
           return (
             page && (
               <div data-content-locale={locale}>
                 <AstroArticleImageViewer entry={page} />
               </div>
             )
           );
         })
       }
     </div>
   </MainLayout>
   ```

3. **Add a sidebar node** in `src/lib/collections.ts` inside `buildFullSidebarTree()` — add a hardcoded `SidebarNode` for the new page (similar to `home` and `resume`).

The `id` pattern (`about.en` / `about.pt`) and the `startsWith("about")` filter are the only wiring needed.
