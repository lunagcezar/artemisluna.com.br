# Artemis Luna

Personal portfolio and knowledge base built with [Astro](https://astro.build), using content collections for art, wiki, and page content.

## Content organization

Content lives under `src/content/` in four collections — `art`, `wiki`, `page`, and (optionally) `blog`. Directories _are_ the taxonomy: their names become URL path segments and are used for filtering and breadcrumbs.

### Art

```
src/content/art/
├── digital/
│   └── painting/
│       └── 20260511-example.md
└── traditional/
    ├── drawing/
    │   ├── fictional-cityscapes/
    │   │   ├── 20241103-fictional-cityscape-001-line.md
    │   │   └── 20241106-fictional-cityscape-001-color.md
    │   └── urban-sketching/
    │       └── 20250416-lagoa-das-almecegas.md
    └── painting/
        ├── gouache/
        │   └── 20260602-example.md
        └── oil-pastel/
            └── 20200101-desert-sunset.md
```

Directory structure rules:

- **Top-level folder**: one of `traditional` / `digital` (the `type` field — the schema validates these values).
- **Second-level folder**: matches `category` (`drawing`, `painting`, `illustration`, `mixed-media`, `ui-design`, `other`).
- **Third-level folder** (optional): maps to `medium` (`gouache`, `oil-pastel`, `digital-painting`, `ink`, `pencil`, etc.) or a `series` name like `fictional-cityscapes`.
- **Filenames**: `YYYYMMDD-slug-in-kebab-case.md`.

Frontmatter:

```yaml
---
title: "Piece Title"
description: "Short description for meta tags."
tags: ["medium", "technique", "subject"]
date: 2026-06-02
author: Your Name
images:
  - src: "/src/assets/art/traditional/paintings/gouache/20260602-example.png"
    alt: "Descriptive alt text"
    caption: "Optional caption"
---
```

Image `src` paths are root-relative and must live under `src/assets/art/`.

### Blog (optional)

Blog entries are currently disabled. To enable, uncomment the `blog` collection in `src/content.config.ts` and follow the guide in `docs/collections.md`. Blog entries are flat (no sub-folders):

```
src/content/blog/
└── 20260511-my-post.md
```

Blog entries are flat (no sub-folders). Frontmatter:

```yaml
---
title: "Post Title"
description: "Meta description."
category: "tech"
tags: ["astro", "css"]
date: 2026-05-11
author: Your Name
image: "/src/assets/blog/hero.jpg"
---
```

### Wiki

```
src/content/wiki/
├── linux.md                  ← index page for linux/
├── linux/
│   └── networking/
│       └── some-topic.md
├── programming.md            ← index page for programming/
└── programming/
    ├── cmake.md              ← index page for cmake/
    └── cmake/
        └── some-other-topic.md
```

Wiki uses a nested directory tree. Index pages are markdown files with `index: true` in frontmatter and the same name as their parent directory (e.g. `linux.md` for `linux/`). Plain files without subdirectories are normal articles.

Frontmatter:

```yaml
---
title: Article Title
description: "Meta description."
date: 2024-07-31
author: Your Name
tags:
  - linux
  - encryption
status: published
index: true # only for directory index pages
---
```

Allowed fields: `title`, `description`, `tags`, `date`, `image`, `author`, `status`, `index`.

### Cross-linking between pages

You can link to any page across any collection using two syntaxes:

- **Foam wikilinks**: `[[primeiro-post]]` links to `/blog/primeiro-post/`, `[[encrypt-second-drive-...]]` links to the wiki article
- **Custom display text**: `[[target|Display text]]`

Links render with the target page's title wrapped in brackets (`[Article Title]`). If the target doesn't exist in any collection, the text still shows `[target]` as a visual indicator of an unresolved backlink.

You can also use standard markdown links: `[text](/wiki/linux/encryption/some-topic/)` or `[text](/blog/20230315-turborepo-monorepo/)`.

The remark plugin scans `src/content/` across all collections to build a unified routing table. A `[[slug]]` in any markdown file resolves to the correct `/<collection>/<id>/` URL regardless of which collection it lives in.

### Directory index pages

A file like `linux.md` placed next to a `linux/` folder with `index: true` in its frontmatter becomes that directory's landing page. Its content renders at the top of the directory listing, and it is hidden from the article list and pagination.

## Navigation

The site uses a tree-based sidebar representing the full content hierarchy. No manual nav configuration is needed — the tree is built at build time from the actual folder structure.

### Sidebar tree (desktop)

On screens wide enough (`lg:` breakpoint and up), a sticky sidebar sits to the left of the main content:

```
Luna G. Cezar         [Search...]
[🌐] [🌙]          ← locale + theme switchers
|
├── Home (/)
├── ▼ Art (/art/)
│   ├── Digital (/art/digital/)
│   │   └── Painting (/art/digital/painting/)
│   └── Traditional (/art/traditional/)
│       ├── Drawing (/art/traditional/drawing/)
│       │   ├── Urban-sketching
│       │   └── Fictional-cityscapes
│       └── Painting (/art/traditional/painting/)
│           ├── Gouache
│           └── Oil-pastel
├── Blog (/blog/)  ← commented out in content.config.ts; add posts + uncomment to enable
└── ▼ Wiki (/wiki/)
    ├── Linux (/wiki/linux/)
    │   ├── Encryption
    │   └── Networking
    └── Programming (/wiki/programming/)
        └── Cmake
```

- The currently active page is highlighted.
- Ancestors of the active page auto-expand (children visible).
- No client-side JS — expansion is determined at build time from the URL.
- The tree scrolls independently if it overflows the viewport.

### Mobile drawer

Below `lg:`, the sidebar is replaced by a fixed top bar with a hamburger button. Tapping it opens a slide-down drawer containing the same tree. Locale/theme switchers are in the top bar.

### Directory indexes

Each directory in a collection (e.g. `/art/traditional/painting/`, `/wiki/programming/`) renders:

1. **Index page content** — if a markdown file with `index: true` exists (e.g. `programming.md` next to `programming/`), its content renders at the top of the page.
2. **Child folder links** — immediate subdirectories show as navigation badges.
3. **Article listing** — all descendant entries appear, sorted by date descending (newest first). Entries span multiple subdirectories — e.g. `/art/traditional/` lists both drawing and painting entries together.
4. **Pagination** — when there are more entries than `DEFAULT_PAGE_SIZE` (defined in `src/constants/pagination.ts`), page links appear at the bottom.

### Adding a new content collection

New collections (e.g., re-adding `blog` or adding a `photography` section) require creating a content directory, a schema entry in `src/content.config.ts`, a config entry in `src/config/collections.ts`, catch-all and pagination route files, and translations. See `docs/collections.md` for the complete walkthrough.

To re-enable the blog section:

1. Uncomment the `blog` definition in `src/content.config.ts`
2. Add `{ name: "blog", type: "content" }` to `COLLECTION_CONFIGS` in `src/config/collections.ts`
3. Restore the route files from `docs/collections.md` template

### Special pages

Static pages (home, resume) live in `src/content/page/` as markdown files named `{name}.{locale}.md` (e.g., `home.en.md`, `home.pt.md`, `home.eo.md`). Each file's frontmatter sets `lang` to its locale. The page route (`/` for home, `/resume/` for resume) iterates `SUPPORTED_LOCALES` and renders each matching file, showing/hiding them client-side via `data-content-locale`. Adding a new locale means creating the corresponding page file (e.g., `resume.eo.md`). New page types can be added by creating a route file (e.g., `src/pages/about.astro`) and locale files (`about.en.md`, etc.). See `docs/special-pages.md` for the full breakdown.

These pages are included in the auto-generated sidebar tree in `buildFullSidebarTree()`, which reads the `page` collection and derives page names from filenames (e.g., `home.en.md` → `home` → `/`).

### Architecture

The system has two key data structures:

- **DirectoryIndex** — a flat `Record<string, DirectoryEntry>` built once from all entries. Each key is a directory path (`""` for root). Lookups are O(1): `children` (subfolder names), `entries` (articles in this directory), `indexEntry` (optional index page). The recursive listing function `getRecursiveEntries` walks the tree and returns all descendant entries globally sorted by date.
- **SidebarNode** — a recursive tree of `{ name, href, children }` used by the sidebar and mobile drawer. Built by `buildFullSidebarTree()` which scans all collections from `content.config.ts` and derives page nodes from the `page` collection.

Both are rebuilt automatically when content is added, moved, or removed — no manual navigation updates required.

## Homepage / Recent entries

The homepage (`src/pages/index.astro`) renders the page content (from `src/content/page/`) followed by a "latest entries" section for each collection configured in `RECENT_SECTIONS` (`src/constants/collections.ts`):

```ts
export const RECENT_SECTIONS: RecentSectionDef[] = [
  { collection: "art", display: "art" }, // image card grid
  { collection: "blog", display: "list" }, // text entry list
  { collection: "wiki", display: "list" }, // text entry list
];
```

Each section shows up to `RECENT_PER_COLLECTION` entries (default 4), sorted by date descending. The display mode controls rendering:

- `"art"` — uses `AstroArtCard` with resolved images in a responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` layout
- `"list"` — uses `AstroEntryList` with date, tags, title, and description in styled `Item` cards

Sections with no entries are hidden. Each section has a "More" link pointing to its collection root (`/art/`, `/wiki/`, `/blog/`). The `latest` translation key controls the parenthetical label (e.g., `Art (Latest)`, `Arte (Últimos)`).

Adding a new collection to the homepage requires:

1. Adding an entry to `RECENT_SECTIONS` in `src/constants/collections.ts`
2. Ensuring the collection has content in `src/content/<name>/` and translations in `src/i18n/labels.ts`

## Naming conventions

- **Folders**: `kebab-case` only (e.g. `oil-pastel`, `urban-sketching`, `fictional-cityscapes`).
- **Files**: `YYYYMMDD-slug-in-kebab-case.md` for art/blog; `kebab-case-title.md` for wiki.
- **Tags**: `kebab-case` strings (e.g. `"oil-pastel"`, `"urban-sketching"`).
- **Image src paths**: root-relative and placed under `src/assets/`.

These folder and tag values in kebab-case are used as URL segments. They also serve as translation keys in the i18n system — see the next section.

### Collection configuration

Collection metadata is centralized in `src/config/collections.ts`:

```ts
export interface CollectionConfig {
  name: string;
  type: "content" | "pages";
}

export const COLLECTION_CONFIGS: CollectionConfig[] = [
  { name: "art", type: "content" },
  { name: "wiki", type: "content" },
  { name: "page", type: "pages" },
];
```

- `type: "content"` — collections with directory-tree routing (index + detail pages, pagination)
- `type: "pages"` — collections with single-page routing (home, resume)
- Add a new collection config when creating a new section
- Import from `@config/collections` instead of hardcoding collection names

## Adding translations

All UI strings, taxonomy labels, and segment names are centralized in `src/i18n/labels.ts` in a single `translations` object. The system is **locale-agnostic** — every consumer iterates over `SUPPORTED_LOCALES` to produce labels for all configured locales. Adding a new locale to `SUPPORTED_LOCALES` automatically extends every i18n feature.

### Adding a new locale (e.g. Esperanto)

1. Add the code to `SUPPORTED_LOCALES`:

   ```ts
   export const SUPPORTED_LOCALES = ["en", "pt", "eo"] as const;
   ```

2. Add translations under the new key:

   ```
   // Inside the translations object, add an "eo" key:
   eo: {
     art: "Arto",
     gouache: "Guŝo",
     traditional: "Tradicia",
     light: "Lumo",
     dark: "Malhela",
   },
   ```

   Keys are bare strings (no `collection.segment` prefix).

3. Add the locale mapping to `src/lib/date.ts` `LOCALE_MAP` if the locale uses a different `Intl.DateTimeFormat` string (e.g. `eo` → `"eo"`):

   ```ts
   const LOCALE_MAP: Record<string, string> = {
     en: "en-US",
     pt: "pt-BR",
     eo: "eo",
   };
   ```

4. The locale switcher auto-generates its options from `SUPPORTED_LOCALES` — no manual UI changes needed.

### Translating segments / tags

Keys use the bare kebab-case segment name (no collection prefix):

```
pt: {
  traditional: "Tradicional",
  "oil-pastel": "Pastel de óleo",
  "urban-sketching": "Esboço urbano",
  encryption: "Criptografia",
  networking: "Redes",
}
```

The `createTranslateLabel()` helper returns a function that generates the full label map for all locales. Every consumer renders via `data-locales='{"en":"Oil Pastel","pt":"Pastel de óleo"}'` which is swapped client-side based on the user's locale cookie.

Directory index pages (e.g. `/wiki/encryption/`) use the same mechanism for their `<h1>` title — the URL segment is passed through `translateLabel()` and rendered with `data-locales`, so the heading switches language with the UI locale. The `<title>` meta tag also reflects the translated segment name.

### Translating UI strings

```
pt: {
  light: "Claro",
  dark: "Escuro",
}
```

Use `t("light")` in any component (imported from `@i18n/labels`). For static HTML that needs to react to locale changes, embed `data-locales='{"en":"Light","pt":"Claro"}'` on the element — the inline script and `applyLocale()` will swap the text content.

## Search

The site has a built-in search bar in the navbar powered by [Lunr.js](https://lunrjs.com). All content (art, wiki, and the home/resume pages) is indexed at build time into a static `search.json` file. The `blog` collection is indexed when it has entries.

- **How it works**: `src/pages/search.json.ts` generates the index during `astro build`. All text fields are normalized to strip diacritics (c → ç) and translated labels are appended to tags. On the client, the `Search` React component fetches `search.json` and builds a Lunr index.
- **What's indexed**: title (boosted), headings (h1/h2 from markdown, boosted), description, tags (including translated labels for cross-locale queries), collection names in all locales, and body content.
- **Relevance**: Uses required prefix wildcards (`+term1* +term2*`) so every typed term must appear as a word prefix across all fields. Adding words narrows results (AND logic). Single-word queries also fall back to boosted exact and fuzzy matching. Results are sorted by relevance first, then by date descending for entries with similar scores.
- **Cross-language**: Tag translations and collection name translations are indexed alongside the English text. Searching in any locale finds results from all languages. Result badges (Art / Wiki / Page) adapt to the current locale.

## Deployment

Set the `SITE_URL` environment variable at build time for correct canonical URLs and Open Graph image paths:

```bash
SITE_URL=https://example.com pnpm build
```

The config in `astro.config.mjs` reads `SITE_URL` from `node:process` and falls back to the default URL when unset.

## SEO

- **Canonical URLs** — set via `SITE_URL` env var (`getCanonicalUrl()` in `src/lib/url.ts`), emitted as `<link rel="canonical">` on every page.
- **Sitemap** — `@astrojs/sitemap` integration generates `sitemap-index.xml` at build time. Configured in `astro.config.mjs`.
- **Robots.txt** — `public/robots.txt` allows all crawlers and points to the sitemap.
- **Open Graph** — `og:title`, `og:description`, `og:type`, `og:url`, `og:image`, and `article:published_time` (for articles) are rendered in `<head>`.
- **Twitter Cards** — `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image` mirror Open Graph tags.
- **JSON-LD Structured Data** — `MainLayout.astro` emits `<script type="application/ld+json">` with schema.org `Article` or `WebSite` type, including headline, description, url, datePublished (for articles), author, image, and publisher.
- **Keywords** — `tags` frontmatter rendered as `<meta name="keywords">`.
- **Semantic HTML** — `<article>`, `<nav>`, `<h1>`–`<h3>`, `<time datetime>`, breadcrumb with `aria-label`.
- **`lang` attribute** — set from entry's `lang` frontmatter for correct hyphenation and language hints.
- **Single-URL client-side locale switching** — no `/pt/` URL prefix, search engines see the English version server-rendered.

## Commands

| Command                                   | Action                               |
| ----------------------------------------- | ------------------------------------ |
| `pnpm dev`                                | Start dev server at `localhost:4321` |
| `SITE_URL=https://example.com pnpm build` | Build with custom canonical URL      |
| `pnpm build`                              | Build to `dist/` (uses default URL)  |
| `pnpm preview`                            | Preview build locally                |
| `pnpm astro check`                        | Type-check all files                 |
| `pnpm astro -- --help`                    | Astro CLI help                       |

## Foam templates

The project includes [Foam](https://foambubble.github.io/foam) templates in `.foam/templates/` for scaffolding new content with correct frontmatter:

| Template          | Run **Foam: Create New Template** and pick: | Creates                                                         |
| ----------------- | ------------------------------------------- | --------------------------------------------------------------- |
| `art-entry.md`    | **Art Entry**                               | `src/content/art/$DATE-$SLUG.md` (move to correct subdirectory) |
| `blog-post.md`    | **Blog Post**                               | `src/content/blog/$DATE-$SLUG.md`                               |
| `wiki-article.md` | **Wiki Article**                            | `src/content/wiki/$SLUG.md`                                     |

After creation, fill in the frontmatter fields (`tags`, etc.) and write the content. Art entries should be moved to the appropriate subdirectory under `src/content/art/` (e.g. `digital/painting/`).

## Obsidian vault

The project root is an [Obsidian](https://obsidian.md) vault for writing content. Images reference absolute paths from the project root (e.g. `/src/assets/art/...`) so the vault must be rooted at the project root for previews to resolve.

> **`.obsidian/` is git-ignored** — vault config (plugins, theme, excluded files) is **not** in git. On machines with Syncthing, it syncs automatically. On machines without Syncthing, follow the manual setup below.

### First-time setup (manual, no Syncthing)

1. Open Obsidian → **Open folder as vault** → select project root
2. Go to Settings → **Community plugins** → turn off Restricted Mode → **Browse**
3. Search and install **Templater** → **Enable**
4. In Templater settings, set **Template folder location** to `_templates`
5. Enable **Trigger Templater on new file creation**
6. In **Folder Templates**, add each collection:

   | Folder                | Template                      |
   | --------------------- | ----------------------------- |
   | `src/content/art`     | `_templates/art-entry.md`     |
   | `src/content/blog`    | `_templates/blog-post.md`     |
   | `src/content/wiki`    | `_templates/wiki-article.md`  |
   | `src/content/writing` | `_templates/writing-entry.md` |

7. In Settings → **Files & Links** → **Excluded files**, add patterns to hide code folders:

   ```
   node_modules, dist, .astro, .wrangler, public,
   .vscode, .husky, .foam, .git,
   src/components, src/config, src/constants, src/hooks,
   src/i18n, src/layouts, src/lib, src/pages, src/styles,
   src/types, src/content.config.ts,
   src/assets/documents, src/assets/photos,
   .gitignore, .prettierrc, .stignore, AGENTS.md,
   astro.config.mjs, components.json, docs, eslint.config.ts,
   package.json, pnpm-lock.yaml, pnpm-workspace.yaml,
   README.md, tsconfig.json, wrangler.jsonc
   ```

### Writing content

Navigate to the target folder (e.g. `src/content/art/digital/painting/`), create a new note, then use `Ctrl+P` → **Templater: Insert template** → pick the workflow:

| Template           | Use for              |
| ------------------ | -------------------- |
| `art-entry.md`     | Artwork with images  |
| `blog-post.md`     | Blog article         |
| `wiki-article.md`  | Wiki documentation   |
| `writing-entry.md` | Prose or play script |

Templater also auto-applies templates when creating files directly inside collection folders.

### Syncthing

Syncthing only scans `src/content/`, `src/assets/`, and `.obsidian/`. Per-machine workspace layout (`workspace.json`) is excluded to avoid conflicts. Plugin binaries and caches are synced so Obsidian works immediately on every device.

### Line endings

A `.gitattributes` file (with `* text=auto`) ensures consistent line endings — LF in the repo, native per OS on checkout. This prevents Obsidian on Windows from producing false git diffs.

**Important:** `core.autocrlf` must be `false` (or unset) for `.gitattributes` to work correctly. If you cloned this repo with default Git for Windows settings, run:

```bash
git config core.autocrlf false
git add --renormalize .
```

Then commit the resulting changes. Without this, git may still show content files as modified after Obsidian saves them.
