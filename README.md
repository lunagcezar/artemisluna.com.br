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

3. Add the locale option to `src/components/shared/locale-switcher.tsx`.

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

Use `t("light")` in React components (imported from `@i18n/labels`).

## Commands

| Command                | Action                               |
| ---------------------- | ------------------------------------ |
| `pnpm dev`             | Start dev server at `localhost:4321` |
| `pnpm build`           | Build to `dist/`                     |
| `pnpm preview`         | Preview build locally                |
| `pnpm astro check`     | Type-check all files                 |
| `pnpm astro -- --help` | Astro CLI help                       |
