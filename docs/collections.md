# Adding a new content collection

This guide explains how to add a new content collection to the site, following the same patterns as `art`, `blog`, and `wiki`.

## Overview

Adding a new collection requires creating files in these locations:

| Step | File                                           | Purpose                          |
| ---- | ---------------------------------------------- | -------------------------------- |
| 1    | `src/content/<name>/`                          | Markdown content files           |
| 2    | `src/content.config.ts`                        | Collection schema definition     |
| 3    | `src/pages/<name>/[...slug].astro`             | Catch-all route (index + detail) |
| 4    | `src/pages/<name>/[...slug]/page/[page].astro` | Pagination route                 |
| 5    | `src/components/features/<name>/`              | Collection-specific components   |
| 6    | `src/lib/collections.ts`                       | Sidebar tree (automatic)         |
| 7    | `src/i18n/labels.ts`                           | Collection name translation      |

## Step-by-step: adding a `photography` collection

### 1. Create content files

```
src/content/photography/
├── landscapes/
│   └── 20260601-mountain-sunset.md
└── portraits/
    └── 20260501-anna-portrait.md
```

Each markdown file has frontmatter matching the schema you define next.

### 2. Define the collection schema

In `src/content.config.ts`, add a new collection definition:

```ts
const photography = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/photography" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    lang: z.enum(["en", "pt", "eo"]).default("en"),
    tags: z.array(z.string()),
    date: z.coerce.date(),
    image: z.string().optional(),
  }),
});

export const collections = { art, blog, wiki, page, photography };
```

The `lang` field must match the schema's enum. If you want to add a new locale, add it to ALL collections' `lang` enums and to `SUPPORTED_LOCALES` in `@i18n/labels`.

### 3. Create the catch-all route

Create `src/pages/photography/[...slug].astro`:

```astro
---
import type { GetStaticPaths } from "astro";
import MainLayout from "@layouts/MainLayout.astro";
import AstroRecursiveCollectionIndex from "@components/shared/_astro/AstroRecursiveCollectionIndex.astro";
import AstroEntryMeta from "@components/core/_astro/AstroEntryMeta.astro";
import AstroRecursiveBreadcrumb from "@components/core/_astro/AstroRecursiveBreadcrumb.astro";
import AstroArticleImageViewer from "@components/shared/_astro/AstroArticleImageViewer.astro";
import {
  buildDirectoryIndex,
  getRecursiveEntries,
  filterOutIndexEntries,
  getIndexAndDetailPaths,
  getPageTitleLabels,
  paginateEntries,
} from "@lib/collections";
import { DEFAULT_PAGE_SIZE } from "@constants/pagination";
import {
  createTranslateLabel,
  SUPPORTED_LOCALES,
  translations,
} from "@i18n/labels";

export const getStaticPaths = (async () => {
  return await getIndexAndDetailPaths("photography");
}) satisfies GetStaticPaths;

const { mode, entry, slug, entries } = Astro.props;
const translateLabel = createTranslateLabel();

const index = buildDirectoryIndex(entries ?? []);
const dir = index[slug ?? ""];
const indexEntry = dir?.indexEntry;
const allEntries =
  mode === "index"
    ? filterOutIndexEntries(getRecursiveEntries(slug ?? "", index))
    : [];
const childFolders = dir?.children ?? [];
const { pageEntries, totalPages, currentPage } =
  mode === "index"
    ? paginateEntries(allEntries, 1, DEFAULT_PAGE_SIZE)
    : { pageEntries: [], totalPages: 1, currentPage: 1 };
const baseUrl = slug ? `/photography/${slug}/` : "/photography/";
const segments = slug ? slug.split("/") : [];
const parentSlug =
  mode === "detail" ? entry.id.split("/").slice(0, -1).join("/") : slug;
const lastSegment = segments.length > 0 ? segments.at(-1)! : undefined;
const pageTitleLabels = getPageTitleLabels(
  mode,
  lastSegment,
  "Photography",
  translateLabel,
);
const pageTitle = mode === "detail" ? entry.data.title : pageTitleLabels.en;
const titleLabels = mode === "detail" ? undefined : pageTitleLabels.labelsJson;
const baseLabels = Object.fromEntries(
  SUPPORTED_LOCALES.map((l) => [
    l,
    translations[l]?.["photography"] ?? "Photography",
  ]),
);
---

<MainLayout
  title={pageTitle}
  titleLabels={titleLabels}
  description={mode === "detail" ? entry.data.description : undefined}
  keywords={mode === "detail" ? entry.data.tags : undefined}
  lang={mode === "detail" ? entry.data.lang : undefined}
>
  {
    mode === "detail" ? (
      <article class="grid gap-4">
        <div class="grid gap-2">
          <AstroRecursiveBreadcrumb
            baseUrl="/photography/"
            baseLabels={baseLabels}
            slug={parentSlug}
            translateLabel={translateLabel}
            isDetail
          />
          <h1 class="text-3xl font-semibold tracking-tight">
            {entry.data.title}
          </h1>
          <AstroEntryMeta entry={entry} translateLabel={translateLabel} />
        </div>
        <AstroArticleImageViewer entry={entry} />
      </article>
    ) : (
      <AstroRecursiveCollectionIndex
        collection="photography"
        entries={pageEntries}
        slug={slug}
        childFolders={childFolders}
        page={currentPage}
        totalPages={totalPages}
        baseUrl={baseUrl}
        baseLabel="Photography"
        indexEntry={indexEntry}
      />
    )
  }
</MainLayout>
```

### 4. Create the pagination route

Create `src/pages/photography/[...slug]/page/[page].astro`:

```astro
---
import type { GetStaticPaths } from "astro";
import MainLayout from "@layouts/MainLayout.astro";
import AstroRecursiveCollectionIndex from "@components/shared/_astro/AstroRecursiveCollectionIndex.astro";
import {
  buildDirectoryIndex,
  getRecursiveEntries,
  getPaginationPaths,
  filterOutIndexEntries,
  paginateEntries,
} from "@lib/collections";
import { DEFAULT_PAGE_SIZE } from "@constants/pagination";

export const getStaticPaths = (async () => {
  return await getPaginationPaths("photography", DEFAULT_PAGE_SIZE);
}) satisfies GetStaticPaths;

const { slug, page, entries } = Astro.props;

const index = buildDirectoryIndex(entries);
const dir = index[slug ?? ""];
const allEntries = filterOutIndexEntries(
  getRecursiveEntries(slug ?? "", index),
);
const { pageEntries, totalPages, currentPage } = paginateEntries(
  allEntries,
  page,
  DEFAULT_PAGE_SIZE,
);
const baseUrl = slug ? `/photography/${slug}/` : "/photography/";
const childFolders = dir?.children ?? [];
---

<MainLayout>
  <AstroRecursiveCollectionIndex
    collection="photography"
    entries={pageEntries}
    slug={slug}
    childFolders={childFolders}
    page={currentPage}
    totalPages={totalPages}
    baseUrl={baseUrl}
    baseLabel="Photography"
  />
</MainLayout>
```

### 5. Add translation for the collection name

In `src/i18n/labels.ts`, add the collection name:

```ts
pt: {
  // ...
  photography: "Fotografia",
},
eo: {
  // ...
  photography: "Fotografio",
},
```

### 6. Result

- Markdown files in `src/content/photography/` are served at `/photography/`
- Directory indexes are generated automatically from folder structure
- Breadcrumbs, pagination, child-folder links all work automatically
- The collection appears in the sidebar tree with the translated name
- All entries are indexed in the search
- Wiki links (`[[slug]]`) resolve correctly across all collections

## What happens automatically

Once the schema and routes are in place, these features pick up the new collection without extra code:

| Feature               | How it works                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Sidebar tree**      | `buildFullSidebarTree()` reads `collections` from `content.config.ts` — the new collection appears automatically |
| **Directory indexes** | `buildDirectoryIndex()` groups entries by directory path — nested folders become navigable indexes               |
| **Pagination**        | `getPaginationPaths()` generates `/page/N/` routes for directories with many entries                             |
| **Breadcrumbs**       | `AstroRecursiveBreadcrumb` uses URL segments — no config needed                                                  |
| **Search**            | `search.json.ts` iterates all collections — new entries are indexed automatically                                |
| **Wiki links**        | `remark-wiki-links.ts` scans all collection directories at build time                                            |
| **Bilingual labels**  | `createTranslateLabel` resolves bare keys — add `photography` to each locale's translations                      |

## Schema field conventions

| Field         | Type       | Required                | Notes                                         |
| ------------- | ---------- | ----------------------- | --------------------------------------------- |
| `title`       | `string`   | yes                     | Displayed in listings, page title, search     |
| `description` | `string`   | no                      | Meta description, search snippet              |
| `lang`        | `enum`     | no (defaults to `"en"`) | Must match the enum in ALL collection schemas |
| `tags`        | `string[]` | varies                  | Rendered as badges, indexed in search         |
| `date`        | `Date`     | varies                  | Used for sorting and display                  |
| `image`       | `string`   | no                      | Hero/thumbnail image path                     |
| `author`      | `string`   | no                      | Meta author tag                               |
| `index`       | `boolean`  | no (wiki only)          | Marks a file as a directory index page        |

## Sharing components

The `blog` and `wiki` collections share:

- `AstroRecursiveCollectionIndex` — renders the list view with breadcrumbs
- `AstroEntryMeta` — metadata bar (date + tags)
- `AstroRecursiveBreadcrumb` — breadcrumb navigation
- `AstroArticleImageViewer` — renders markdown content + image lightbox

New collections that follow the same pattern (directory-tree content with detail + index views) can reuse these components directly, as shown in the route template above.
