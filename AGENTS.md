# Frameworks used

- Astro
- React

# UI Libraries used

- shadcn/ui
- Phosphor icons (always use phosphor instead of lucide)
- Tailwind

# Code quality

- Always use SOLID and DRY;
- Always check for skills already installed to improve the workflow;
- Keep components as simple as possible. Any function that has complexity must belong in the lib/ folder

# Tooling

- Always use pnpm instead of npm
- After implementing features, always run pnpm astro check and, after that, build it (pnpm build).

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

All collections (art, blog, wiki) share the `lang` field: `lang: z.enum(["en", "pt"]).default("en")`. Set `lang: pt` for Portuguese content to enable correct hyphenation via `<html lang>`.

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
- Directory indexes display all descendant entries (recursive). Child-folder links let users navigate deeper into the hierarchy.

## Components

Art-specific components live in `src/components/features/art/_astro/`:

- `AstroArtGallery.astro` — breadcrumbs, child-folder links, masonry grid, pagination. Accepts a `collection` prop so the breadcrumb root URL and label are derived dynamically (e.g. `/art/` / `Art`).
- `AstroArtCard.astro` — mosaic tile built with shadcn `Card`, showing the first image, title, and all taxonomy badges
- `AstroArtDetail.astro` — artwork detail page with metadata and image masonry
- `image-viewer.tsx` (React) — exports `ImageViewer` (thumbnail grid + lightbox) and `ImageLightbox` (shared dialog component). Lives at `src/components/shared/image-viewer.tsx`.
- `article-image-viewer.tsx` (React) — same lightbox as above but scans a DOM container for `<img>` elements and opens the dialog on click. Uses `ImageLightbox` from `image-viewer.tsx` internally. Used inside `AstroArticleImageViewer.astro` for blog/wiki content via `client:load`.
- `AstroArticleImageViewer.astro` — Astro wrapper that renders markdown `Content` inside an ID'd container with `article-content` class, then mounts `ArticleImageViewer`. Used in all collection detail pages (replaces direct `AstroEntryContent` calls).

Shared pagination is handled by `src/components/core/_astro/AstroPagination.astro`, which uses `getPageUrl(baseUrl, page)` from `src/lib/url.ts` to produce `/page/N/` URLs.

SEO URL helpers live in `src/lib/url.ts`:

- `getCanonicalUrl(path)` — builds the canonical URL from `import.meta.env.SITE` + path
- `getOgImageUrl(image)` — resolves frontmatter image paths to absolute URLs for Open Graph
- `getSiteRoot()` — returns the site root from `SITE_URL` env var or empty string

## Blog & Wiki routing

Both follow the same pattern as the art section:

- `src/pages/blog/[...slug].astro` and `src/pages/wiki/[...slug].astro` handle the root index, directory indexes, and detail pages.
- `src/pages/blog/[...slug]/page/[page].astro` and `src/pages/wiki/[...slug]/page/[page].astro` handle pagination with `/page/N/` URLs.
- `src/components/shared/_astro/AstroRecursiveCollectionIndex.astro` renders the list view with breadcrumbs and child-folder links for blog and wiki.

Shared recursive UI pieces live in `src/components/core/_astro/`:

- `AstroRecursiveBreadcrumb.astro` — breadcrumb trail for any directory tree. Accepts `baseUrl` (collection root, e.g. `/wiki/`), `baseLabels` (bilingual `Record<string, string>` for the root item), `slug` (directory path for sub-levels), and `translateLabel` (for segment translation). The first breadcrumb item renders `data-locales` for bilingual switching.
- `AstroEntryMeta.astro` — metadata bar for detail pages showing date (with `CalendarBlankIcon` + bilingual locale formatting via `data-locales`) and tags (with `TagIcon` + bilingual `Badge` list). Hidden entirely when the entry has no tags or no date. Used in all three collection detail pages (art, blog, wiki).
- Detail pages compute `parentSlug` from `entry.id` by removing the last path segment, then pass it to `AstroRecursiveBreadcrumb` so sub-directory levels appear in the breadcrumb trail.

### Directory index (for route file queries)

Route files no longer iterate flat entry lists. Instead they build a `DirectoryIndex` once via `buildDirectoryIndex(entries)`, then query it with O(1) lookups:

- `DirectoryEntry<T>` — per-directory data: `children` (subfolder names), `entries` (direct entries, pre-sorted by date desc), `indexEntry` (optional index page)
- `DirectoryIndex<T>` — `Record<string, DirectoryEntry<T>>`, keyed by directory path (`""` for root)
- `buildDirectoryIndex(entries)` — single-pass index builder; sorts once, groups entries by directory, registers child folders, detects index entries
- `getRecursiveEntries(key, index)` — tree-walks to collect all entries in a directory and its descendants, globally sorted by date descending

Route files replace 3 old function calls with direct index lookups:

| Before                                 | After                                    |
| -------------------------------------- | ---------------------------------------- |
| `filterEntriesByPrefix(entries, slug)` | `getRecursiveEntries(slug ?? "", index)` |
| `getChildFolders(entries, slug)`       | `dir?.children ?? []`                    |
| `findIndexEntry(entries, slug)`        | `dir?.indexEntry`                        |

### Sidebar tree (navigation components)

- `SidebarNode` — recursive tree node: `name`, `href`, `children`
- `buildCollectionRoot(collection, entries)` — builds the directory tree for one collection from entry IDs
- `buildFullSidebarTree()` — async; scans all collections via `content.config.ts`, returns the full tree (with `home` and `resume` root nodes) and collection names

Sidebar and navbar components use `src/lib/sidebar.ts`:

- `createSidebarHelpers(currentPath, collectionNames)` — factory returning `getNodeLabels`, `nodeIsActive`, `nodeHasActiveDescendant`; handles bilingual labels via `createTranslateLabel` and the translations map, iterates `SUPPORTED_LOCALES` for all label generation. Highlights the active page via `currentPath.startsWith(node.href)`, and auto-expands ancestor branches via `nodeHasActiveDescendant`

Art-only helpers are in `src/lib/art.ts`:

- `resolveArtImage` — resolves root-relative image paths via `import.meta.glob`

## Behavior

- `ART_PAGE_SIZE` is defined in `src/lib/art.ts`.
- Images are resolved at build time with `import.meta.glob`, so assets are hashed and emitted to `/_astro/`.
- The gallery uses a CSS-column masonry layout (`columns-1 sm:columns-2 lg:columns-3`) with `break-inside-avoid`.
- Child-folder links are rendered as badge links under each index heading.
- Cards display badges for `type`, `category`, `medium`, `series`, and every `tag`, with bilingual labels via a `translateLabel` prop.

## Image viewer (`image-viewer.tsx`)

The React lightbox used on art detail pages. Lives at `src/components/shared/image-viewer.tsx`.

- Renders a clickable thumbnail grid; clicking opens a full-screen `Dialog` overlay.
- Arrow buttons (or ← → keys) cycle between process shots; hidden while zoomed.
- **Zoom**: click the image to toggle 2x zoom centered on the click point.
- **Pan**: while zoomed, moving the mouse pans the image naturally (no click-drag needed).
- **Animation**: zoom in/out has a 200ms CSS transition; mouse panning is instantaneous.
- **Close**: click outside the image (on the backdrop) or press Escape.
- Zoom/pan logic is extracted to `src/hooks/use-image-zoom.ts`. The `computeTranslate` pure function maps mouse position to image translation based on the excess of the scaled image beyond the viewport dimensions.

## Article content typography (`src/styles/global.css`)

Markdown-rendered content inside `.article-content` gets proper typography:

- **Headings**: `h2` is `text-xl font-semibold`, `h3` is `text-lg font-semibold`, with spacing.
- **Paragraphs**: justified `text-align`, `hyphens: auto`, line-height 1.75, bottom margin.
- **Lists**: disc/decimal with 1.5rem padding-left.
- **Links**: primary color underline.
- **Blockquotes**: left border, italic, muted text.
- **Images**: max-width 100%, rounded, `cursor: zoom-in`.
- **Tables**: bordered cells, header background, full width.
- **Inline code**: `--font-monospace` (Cascadia Code Variable), muted background.
- **Content language**: `lang` in frontmatter (`en` default, `pt` for Portuguese) sets `<html lang>` for correct hyphenation.

## Code blocks (Shiki terminal decoration)

Code blocks rendered by Shiki (Astro's syntax highlighter) get a terminal-style decoration in `.article-content`:

- **Scroll model**: `overflow-x: auto` lives on `<code>` (not `<pre>`), so the terminal titlebar stays fixed while code scrolls.
- **Titlebar**: a dark 2rem bar at the top with macOS-style dots (red `#ff5f57`, yellow `#febc2e`, green `#28c840`) via `::before`/`::after` pseudo-elements.
- **Line numbers**: each `.line` span gets a numbered `::before` with a separator border; non-selectable.
- **Wrapping**: `white-space: pre` prevents wrapping; `width: 0` on `<code>` forces overflow for scroll triggering.
- **Font**: Cascadia Code Variable via `--font-monospace`.

## Article image viewer (`article-image-viewer.tsx`)

Same lightbox as above but scans a DOM container for `<img>` elements. Used in blog/wiki pages where images are embedded in markdown rather than listed in frontmatter. Lives at `src/components/shared/article-image-viewer.tsx`.

- Mounted via `AstroArticleImageViewer.astro` with `client:load`.
- On mount, queries `document.getElementById(containerId)` and indexes all `<img>` elements.
- Clicking any image opens the dialog with arrow navigation and zoom/pan.

## Remark Wiki Links plugin

Wiki internal links (both Foam-style `[[wikilinks]]` and markdown link references) are resolved at build time by the custom remark plugin in `src/lib/remark-wiki-links.ts`.

### Configuration

The plugin is registered in `astro.config.mjs` via the `markdown.processor` key using `unified()` from `@astrojs/markdown-remark`. During build it scans `src/content/wiki/`, `src/content/blog/`, and `src/content/art/` to build a routing table of all pages, then processes every `.md` file across all collections (blog, wiki, art).

### Writing wiki links

Link to other wiki articles with:

- **Foam wikilinks**: `[[filename]]` / `[[filename|alias]]`
- **Standard markdown links**: `[text](/wiki/path/to/page/)`

Both resolve to the target page's canonical URL and render the link text as `[Page Title]` (bracketed title from target frontmatter). If the page doesn't exist in the wiki, the text still shows `[target]` to visually mark it as an unresolved backlink.

### How it works

The plugin performs three AST transformations:

1. **Definition URL rewriting** — rewrites `[slug]: raw-path "Title"` definitions to point to the proper `/<collection>/<id>/` route.
2. **Link reference conversion** — converts Foam-generated `[slug]` link references into `<a>` tags with `[Title]` display text.
3. **Raw wikilink syntax** — catches any `[[target]]` / `[[target|alias]]` patterns that weren't pre-processed by Foam.

See `docs/remark-wiki-links.md` for full implementation details.

## Wiki metadata convention

- Folder structure is the source of categorization; do not add a `category` field to wiki frontmatter.
- Allowed fields: `title`, `description`, `tags`, `date`, `image`, `author`, `status`.
- Always provide a `description` for SEO. It is rendered in page meta tags and should summarize the article in one sentence.
- Use `tags` for cross-cutting topics; they are rendered as badges on detail pages and included in the page keywords meta tag.
- Wiki supports `index: true` index pages. Place a markdown file with the same name as a folder (e.g. `linux.md` next to `linux/`) and set `index: true` in its frontmatter. The plugin will treat it as a directory index — its content is rendered at the top of the directory listing, and it is filtered out from the article listing and pagination.
- All collections support `lang: pt` to set Portuguese hyphenation (defaults to `en`). Passed through routes to `<html lang>`.

# i18n

Client-side locale detection for UI strings. No server routing or content restructuring. The system is designed to be **locale-agnostic** — every UI string, segment label, breadcrumb item, and date formatter iterates over `SUPPORTED_LOCALES` to produce labels for all configured locales. Adding a new locale to `SUPPORTED_LOCALES` automatically extends all i18n features.

- **Translation map** — `src/i18n/labels.ts` exports a unified `translations` object keyed by locale (`en`, `pt`), covering collection names, taxonomy segments, and UI strings. Also exports `getCookieLocale()`, `getLocale()`, `t(key)`, `createTranslateLabel(collection)`, and `applyLocale(locale)`. Add new strings under the appropriate locale key. UI-level keys include `home`, `resume`, `light`, `dark`.
- **Locale-agnostic rendering** — Labels are embedded as `data-locales` JSON attributes on server-rendered HTML, containing entries for every locale in `SUPPORTED_LOCALES`. An inline `<script>` in `MainLayout.astro` and the locale switcher's `applyLocale()` swap textContent based on the locale cookie.
- **Persistence** — `src/lib/cookie.ts` provides `getCookie`/`setCookie` helpers. The `locale` and `theme` cookies are set on user interaction and checked on page load.
- **Locale Switcher** — `src/components/shared/_astro/AstroLocaleSwitcher.astro` (Astro component with vanilla JS dropdown). Reads cookie, swaps `[data-locales]` and `[data-locale-value]` text, persists choice. Options are auto-generated from `SUPPORTED_LOCALES` in `@i18n/labels`.
- **Segment / tag translations** — `createTranslateLabel(collection)` returns a `TranslateLabel = (segment) => Record<string, string>` function that produces labels for every locale in `SUPPORTED_LOCALES`. Passed down through parent components (`AstroRecursiveCollectionIndex`, `AstroArtGallery`) to child components (`AstroRecursiveBreadcrumb`, `AstroArtCard`). Translations are in `translations[locale]["collection.segment"]`.
- **Directory index titles** — the `<h1>` on index pages (e.g. `/wiki/encryption/`) uses `translateLabel(lastSegment)` with `data-locales`, so the page heading switches language with the UI locale. The `<title>` meta tag also reflects the translated segment name.
- **Breadcrumb root translation** — the first breadcrumb item uses `baseLabels` (`Record<string, string>`) instead of a plain string, so collection names (Art, Blog, Wiki) switch with the UI locale.
- **Locale-aware dates** — `AstroEntryMeta` uses `formatDateForLocales()` from `src/lib/date.ts`, which formats the date for every locale in `SUPPORTED_LOCALES` via `data-locales` on `<time>`, switching with the locale cookie.
- **Lang attribute** — `applyLocale()` sets `document.documentElement.lang`. Inline script in `MainLayout.astro` does the same on page load from the locale cookie.
- See `docs/i18n.md` for the full pattern reference.

# Theme / Dark Mode

- Dark mode uses the `.dark` CSS class on `<html>` (Tailwind v4 class-based variant: `@custom-variant dark (&:is(.dark *));`).
- CSS variables for `.dark` are defined in `src/styles/global.css`.
- **Theme Switcher** — `src/components/shared/_astro/AstroThemeSwitcher.astro` (Astro component with vanilla JS dropdown). Both Sun/Moon icons are always rendered; CSS `dark:hidden`/`hidden dark:block` controls visibility based on the `.dark` class (set by the inline `<head>` script). Reads `theme` cookie (falls back to `prefers-color-scheme`), toggles `.dark` class, persists choice.
- An inline `<script>` in `MainLayout.astro` runs before any component JS, applying the saved locale and theme immediately to prevent flash.

# SEO

- **Canonical URLs** — `MainLayout.astro` emits `<link rel="canonical">` using `getCanonicalUrl(path)` from `src/lib/url.ts`, which reads `import.meta.env.SITE` (configurable via `SITE_URL` env var). Falls back to relative path if no site URL is configured.
- **Open Graph** — `og:title`, `og:description`, `og:type`, `og:url`, and `og:image` (from frontmatter `image` field, resolved via `getOgImageUrl()`) are rendered in `<head>`.
- **Semantic HTML** — `<article>`, `<nav>`, `<h1>`–`<h3>`, `<time>` with `datetime`, breadcrumb `<nav aria-label="breadcrumb">`.
- **`lang` attribute** — Set from entry's `lang` field for correct hyphenation and language hints.
- **Client-side locale** — Single-URL pattern (no `/pt/` prefix). Content is swapped client-side via `data-locales` and `data-content-locale`. Search engines see the default (English) server-rendered version.

# For agents

- When implementing relevant modifications in this project, please update the AGENTS.md file with documentation
- If a complex feature was being implemented, add a documentation file in the docs/ folder.
- If in doubt, check the documentation files in the docs/ folder.
