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

- `AstroArtGallery.astro` — breadcrumbs, child-folder links, masonry grid, pagination. Accepts a `collection` prop so the breadcrumb root URL and label are derived dynamically (e.g. `/art/` / `Art`).
- `AstroArtCard.astro` — mosaic tile built with shadcn `Card`, showing the first image, title, and all taxonomy badges
- `AstroArtDetail.astro` — artwork detail page with metadata and image masonry

Shared pagination is handled by `src/components/core/_astro/AstroPagination.astro`, which uses `getPageUrl(baseUrl, page)` from `src/lib/url.ts` to produce `/page/N/` URLs.

## Blog & Wiki routing

Both follow the same pattern as the art section:

- `src/pages/blog/[...slug].astro` and `src/pages/wiki/[...slug].astro` handle the root index, directory indexes, and detail pages.
- `src/pages/blog/[...slug]/page/[page].astro` and `src/pages/wiki/[...slug]/page/[page].astro` handle pagination with `/page/N/` URLs.
- `src/components/shared/_astro/AstroRecursiveCollectionIndex.astro` renders the list view with breadcrumbs and child-folder links for blog and wiki.

Shared recursive UI pieces live in `src/components/core/_astro/`:

- `AstroRecursiveBreadcrumb.astro` — breadcrumb trail for any directory tree. Expects `baseUrl` to be the collection root (e.g. `/wiki/`) so the first breadcrumb item always points home; intermediate links are built relative to that root.
- `AstroRecursiveChildFolders.astro` — badge links to immediate child folders

Shared helpers are in `src/lib/collections.ts`:

- `getDirectoryPaths` — generates all directory index slugs from entry ids
- `filterEntriesByPrefix` — recursive filtering for directory indexes
- `getChildFolders` — immediate child folders for navigation links
- `paginateEntries` — pagination slicing
- `formatSegment` — turns URL segments into readable titles
- `getIndexAndDetailPaths` — builds `getStaticPaths` for `[...slug].astro` routes; entries whose `id` matches a directory path skip detail path generation (they become directory indexes only)
- `getPaginationPaths` — builds `getStaticPaths` for `[...slug]/page/[page].astro` routes
- `findIndexEntry` — finds the entry serving as a directory's index page (matches `id === slug` and has `index: true`)
- `filterOutIndexEntries` — removes entries with `index: true` from a listing

Art-only helpers are in `src/lib/art.ts`:

- `resolveArtImage` — resolves root-relative image paths via `import.meta.glob`

## Behavior

- `ART_PAGE_SIZE` is defined in `src/lib/art.ts`.
- Images are resolved at build time with `import.meta.glob`, so assets are hashed and emitted to `/_astro/`.
- The gallery uses a CSS-column masonry layout (`columns-1 sm:columns-2 lg:columns-3`) with `break-inside-avoid`.
- Child-folder links are rendered as badge links under each index heading.
- Cards display badges for `type`, `category`, `medium`, `series`, and every `tag`.

## Remark Wiki Links plugin

Wiki internal links (both Foam-style `[[wikilinks]]` and markdown link references) are resolved at build time by the custom remark plugin in `src/lib/remark-wiki-links.ts`.

### Configuration

The plugin is registered in `astro.config.mjs` via the `markdown.processor` key using `unified()` from `@astrojs/markdown-remark`. During build it scans `src/content/wiki/` to build a routing table of all wiki pages, then processes every `.md` file in that directory.

### Writing wiki links

Link to other wiki articles with:

- **Foam wikilinks**: `[[filename]]` / `[[filename|alias]]`
- **Standard markdown links**: `[text](/wiki/path/to/page/)`

Both resolve to the target page's canonical URL and render the link text as `[Page Title]` (bracketed title from target frontmatter). If the page doesn't exist in the wiki, the text still shows `[target]` to visually mark it as an unresolved backlink.

### How it works

The plugin performs three AST transformations:

1. **Definition URL rewriting** — rewrites `[slug]: raw-path "Title"` definitions to point to the proper `/wiki/<id>/` route.
2. **Link reference conversion** — converts Foam-generated `[slug]` link references into `<a>` tags with `[Title]` display text.
3. **Raw wikilink syntax** — catches any `[[target]]` / `[[target|alias]]` patterns that weren't pre-processed by Foam.

See `docs/remark-wiki-links.md` for full implementation details.

## Wiki metadata convention

- Folder structure is the source of categorization; do not add a `category` field to wiki frontmatter.
- Allowed fields: `title`, `description`, `tags`, `date`, `image`, `author`, `status`.
- Always provide a `description` for SEO. It is rendered in page meta tags and should summarize the article in one sentence.
- Use `tags` for cross-cutting topics; they are rendered as badges on detail pages and included in the page keywords meta tag.
- Wiki supports `index: true` index pages. Place a markdown file with the same name as a folder (e.g. `linux.md` next to `linux/`) and set `index: true` in its frontmatter. The plugin will treat it as a directory index — its content is rendered at the top of the directory listing, and it is filtered out from the article listing and pagination.

# For agents

- When implementing relevant modifications in this project, please update the AGENTS.md file with documentation
