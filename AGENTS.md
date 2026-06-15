# Frameworks used

- Astro
- React

# UI Libraries used

- shadcn/ui
- Phosphor icons

# Code quality

- Always use SOLID and DRY;
- Always check for skills already installed to improve the workflow;

# Tooling

- Always use pnpm instead of npm

# Components

- The UI components must be organized in three folders, like an atomic design:
  - core: Primitive components, like an input field, button, etc;
  - features: combination of primitive components reserved for one page only and with a folder reserved for it, like /components/features/art/\_astro;
  - shared: combination of primitive components reserved for more than one page, like a navbar;
- Astro components **must** be in \_astro subfolders inside of core, features or shared;
- React components uses snake-case.tsx and Astro components uses AstroTitleCase.astro, with Astro as prefix to avoid naming conflicts;

# Art

The art portfolio is built around Astro content collections and a directory-tree routing model.

## Collection schema (`src/content.config.ts`)

Art entries use the following taxonomy fields:

- `type`: `"digital" | "traditional"`
- `category`: `"drawing" | "illustration" | "mixed-media" | "other" | "painting" | "ui-design"`
- `medium`: fixed enum including `gouache`, `oil-pastel`, `digital-painting`, `ink`, `pencil`, etc.
- `series`: optional string for sub-folders like `urban-sketching` or `fictional-cityscapes`
- `tags`: free-form array of strings
- `images`: array of `{ src, alt, caption? }` for process shots

## Content organization

- Markdown files live under `src/content/art/` in a folder tree that follows the taxonomy (e.g. `digital/painting/...`, `traditional/drawing/...`).
- Category folders use singular names matching the schema (`painting`, `drawing`).
- File names use an ISO date prefix plus a slug, e.g. `20250416-lagoa-das-almecegas.md`.
- Image `src` values in frontmatter are root-relative, e.g. `/src/assets/art/traditional/drawings/...`.

## Routing

- `src/pages/art/[...slug].astro` is a single catch-all route that renders:
  - root index (`/art/`)
  - directory indexes (`/art/traditional/`, `/art/traditional/painting/gouache/`, etc.)
  - detail pages (`/art/traditional/drawing/urban-sketching/20250416-lagoa-das-almecegas/`)
- `src/pages/art/[...slug]/page/[page].astro` handles pagination for any directory depth (`/art/traditional/page/2/`).
- Directory indexes display entries recursively (all entries whose content `id` starts with that prefix).

## Components

Art-specific components live in `src/components/features/art/_astro/`:

- `AstroArtGallery.astro` — breadcrumbs, child-folder links, masonry grid, pagination
- `AstroArtCard.astro` — mosaic tile built with shadcn `Card`, showing the first image, title, and all taxonomy badges
- `AstroArtDetail.astro` — artwork detail page with metadata and image masonry

Shared pagination is handled by `src/components/core/_astro/AstroPagination.astro`, which uses `getPageUrl(baseUrl, page)` from `src/lib/url.ts` to produce `/page/N/` URLs.

## Blog & Wiki routing

Both follow the same pattern as the art section:

- `src/pages/blog/[...slug].astro` and `src/pages/wiki/[...slug].astro` handle the root index and detail pages.
- `src/pages/blog/[...slug]/page/[page].astro` and `src/pages/wiki/[...slug]/page/[page].astro` handle pagination with `/page/N/` URLs.

Shared helpers are in `src/lib/art.ts`:

- `getDirectoryPaths` — generates all directory index slugs from entry ids
- `filterEntriesByPrefix` — recursive filtering for directory indexes
- `getChildFolders` — immediate child folders for navigation links
- `paginateEntries` — pagination slicing
- `resolveArtImage` — resolves root-relative image paths via `import.meta.glob`

## Behavior

- `ART_PAGE_SIZE` is defined in `src/lib/art.ts`.
- Images are resolved at build time with `import.meta.glob`, so assets are hashed and emitted to `/_astro/`.
- The gallery uses a CSS-column masonry layout (`columns-1 sm:columns-2 lg:columns-3`) with `break-inside-avoid`.
- Child-folder links are rendered as badge links under each index heading.
- Cards display badges for `type`, `category`, `medium`, `series`, and every `tag`.
