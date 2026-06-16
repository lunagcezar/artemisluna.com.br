# Artemis Luna

Personal portfolio and knowledge base built with [Astro](https://astro.build), using content collections for art, blog, and wiki content.

## Content organization

Content lives under `src/content/` in three collections — `art`, `blog`, and `wiki`. Directories _are_ the taxonomy: their names become URL path segments and are used for filtering and breadcrumbs.

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

### Blog

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

### Linking between wiki articles

You can link to other wiki articles using two syntaxes:

- **Foam wikilinks**: `[[encrypt-second-drive-when-the-first-is-encrypted-with-tpm]]`
- **Custom display text**: `[[target|Display text]]`

Links render with the target page's title wrapped in brackets (`[Article Title]`). If the target doesn't exist yet, the text still shows `[target]` as a visual indicator of an unresolved backlink.

You can also use standard markdown links: `[text](/wiki/linux/encryption/some-topic/)`.

### Directory index pages

A file like `linux.md` placed next to a `linux/` folder with `index: true` in its frontmatter becomes that directory's landing page. Its content renders at the top of the directory listing, and it is hidden from the article list and pagination.

## Navigation

The site uses a tree-based sidebar representing the full content hierarchy. No manual nav configuration is needed — the tree is built at build time from the actual folder structure.

### Sidebar tree (desktop)

On screens wide enough (`lg:` breakpoint and up), a sticky sidebar sits to the left of the main content:

```
Luna G. Cezar
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
├── Blog (/blog/)
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

### Architecture

The system has two key data structures:

- **DirectoryIndex** — a flat `Record<string, DirectoryEntry>` built once from all entries. Each key is a directory path (`""` for root). Lookups are O(1): `children` (subfolder names), `entries` (articles in this directory), `indexEntry` (optional index page). The recursive listing function `getRecursiveEntries` walks the tree and returns all descendant entries globally sorted by date.
- **SidebarNode** — a recursive tree of `{ name, href, children }` used by the sidebar and mobile drawer. Built by `buildFullSidebarTree()` which scans all collections from `content.config.ts`.

Both are rebuilt automatically when content is added, moved, or removed — no manual navigation updates required.

## Naming conventions

- **Folders**: `kebab-case` only (e.g. `oil-pastel`, `urban-sketching`, `fictional-cityscapes`).
- **Files**: `YYYYMMDD-slug-in-kebab-case.md` for art/blog; `kebab-case-title.md` for wiki.
- **Tags**: `kebab-case` strings (e.g. `"oil-pastel"`, `"urban-sketching"`).
- **Image src paths**: root-relative and placed under `src/assets/`.

These folder and tag values in kebab-case are used as URL segments. They also serve as translation keys in the i18n system — see the next section.

## Adding translations

All UI strings, taxonomy labels, and segment names are centralized in `src/i18n/labels.ts` in a single `translations` object.

### Adding a new translation for an existing locale (e.g. English)

```ts
export const translations = {
  en: {
    light: "Light",
    dark: "Dark",
    // no need to add art/wiki segments — English falls back to formatSegment()
  },
  pt: {
    /* ... */
  },
};
```

### Adding a new locale (e.g. Esperanto)

1. Add the code to `SUPPORTED_LOCALES`:

   ```ts
   export const SUPPORTED_LOCALES = ["en", "pt", "eo"] as const;
   ```

2. Add translations under the new key:

   ```ts
   eo: {
     art: "Arto",
     "art.gouache": "Guŝo",
     "art.traditional": "Tradicia",
     light: "Lumo",
     dark: "Malhela",
   },
   ```

   Keys use dot notation: `collection.segment`. If a key has no translation, `formatSegment()` is used for segments (English) or the raw key for UI strings.

3. Add the locale option to `src/i18n/labels.ts` `SUPPORTED_LOCALES` — the switcher (`src/components/shared/_astro/AstroLocaleSwitcher.astro`) auto-generates its options from this array.

### Translating segments / tags

Segment keys follow the pattern `<collection>.<kebab-segment>`:

```ts
pt: {
  "art.traditional": "Tradicional",
  "art.oil-pastel": "Pastel de óleo",
  "art.urban-sketching": "Esboço urbano",
  "wiki.encryption": "Criptografia",
  "wiki.networking": "Redes",
}
```

The `createTranslateLabel(collection)` helper returns a function that generates the full label map for all locales. Every consumer renders via `data-locales='{"en":"Oil Pastel","pt":"Pastel de óleo"}'` which is swapped client-side based on the user's locale cookie.

### Translating UI strings

```ts
pt: {
  light: "Claro",
  dark: "Escuro",
}
```

Use `t("light")` in any component (imported from `@i18n/labels`). For static HTML that needs to react to locale changes, embed `data-locales='{"en":"Light","pt":"Claro"}'` on the element — the inline script and `applyLocale()` will swap the text content.

## Commands

| Command                | Action                               |
| ---------------------- | ------------------------------------ |
| `pnpm dev`             | Start dev server at `localhost:4321` |
| `pnpm build`           | Build to `dist/`                     |
| `pnpm preview`         | Preview build locally                |
| `pnpm astro check`     | Type-check all files                 |
| `pnpm astro -- --help` | Astro CLI help                       |
