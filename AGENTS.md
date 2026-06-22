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

# Deployment

- This project is a static site deployed to **Cloudflare Workers** via Wrangler.
- `wrangler.jsonc` configures the static assets directory (`./dist`) and 404 handling.
- `workerd` (Cloudflare Workers runtime) is approved for local preview.
- Deploy: `pnpm run deploy` (builds + `wrangler deploy`)
- Preview locally: `pnpm run deploy:preview` (builds + `wrangler dev`)
- The site is fully static (SSG) — no SSR adapter needed.
- After implementing features, always run pnpm astro check and, after that, build it (pnpm build).

# Index page / Recent entries

The homepage (`src/pages/index.astro`) displays a "latest entries" section below the page content, configured via `RECENT_SECTIONS` in `src/constants/collections.ts`:

```ts
export const RECENT_SECTIONS: RecentSectionDef[] = [
  { collection: "art", display: "art" }, // art cards with images
  { collection: "blog", display: "list" }, // text entry list
  { collection: "wiki", display: "list" }, // text entry list
];
```

Each section shows up to `RECENT_PER_COLLECTION` entries (default 4), sorted by date DESC, filtered to exclude `index: true` wiki entries. The display mode controls rendering:

- `"art"` — uses `AstroArtCard` with resolved images in a responsive grid
- `"list"` — uses `AstroEntryList` with date, tags, title, and description

Sections with no entries are hidden. The "More" link at the end of each section points to the collection root (`/art/`, `/wiki/`, `/blog/`).

## AstroEntryList (`src/components/core/_astro/AstroEntryList.astro`)

Reusable list component that renders entries as `Item` cards. Accepts `collection`, `entries`, `translateLabel`, optional `limit` (slices entries), and optional `showMoreHref` (renders a "More" link). Used by both the index page and `AstroRecursiveCollectionIndex`.

## Constants (`src/constants/collections.ts`)

- `RECENT_PER_COLLECTION` — max entries per section (4)
- `RECENT_SECTIONS` — array of `{ collection, display }` defining which collections appear on the homepage and how they render

## Types (`src/types/recent.d.ts`)

- `RecentDisplay` — `"art" | "list"` (grid with art cards vs text list)
- `RecentSectionDef` — `{ collection: string; display: RecentDisplay }`
- `ArtCardData` — pre-resolved art card `{ entry, resolvedImage }`
- `RecentSectionData` — resolved section `{ collection, entries, artCards? }`
- `CollectionName` — `keyof DataEntryMap`

## Adding a collection to the homepage

Add an entry to `RECENT_SECTIONS` in `src/constants/collections.ts`:

```ts
{ collection: "writing", display: "list" }
```

The collection must:

- Have entries in `src/content/<name>/`
- Have translations in `src/i18n/labels.ts` for the collection name and a `latest` key
- Support `["art" | "list"]` — `"list"` works for any collection with standard date/tags/title/description fields; `"art"` requires the art-specific `images` field and `AstroArtCard` component

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

All collections (art, blog, wiki, writing, page) share the `lang` field: `lang: z.enum(["en", "pt", "eo"]).default("en")`. Set `lang: pt` for Portuguese content or `lang: eo` for Esperanto content to enable correct hyphenation via `<html lang>`.

The `writing` collection has an additional `layout` field: `layout: z.enum(["prose", "play"]).default("prose")`. Set `layout: play` for play scripts and screenplays that need monospace formatting with centered scene headings and character names.

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
- `article-image-viewer.tsx` (React) — same lightbox as above but scans a DOM container for `<img>` elements and opens the dialog on click. Uses `ImageLightbox` from `image-viewer.tsx` internally. Used inside `AstroArticleImageViewer.astro` for blog/wiki content via `client:visible`.
- `AstroArticleImageViewer.astro` — Astro wrapper that renders markdown `Content` inside an ID'd container with `article-content` class, then mounts `ArticleImageViewer`. Used in all collection detail pages (replaces direct `AstroEntryContent` calls).

Shared pagination is handled by `src/components/core/_astro/AstroPagination.astro`, which uses `getPageUrl(baseUrl, page)` from `src/lib/url.ts` to produce `/page/N/` URLs.

SEO URL helpers live in `src/lib/url.ts`:

- `getCanonicalUrl(path)` — builds the canonical URL from `import.meta.env.SITE` + path
- `getOgImageUrl(image)` — resolves frontmatter image paths to absolute URLs for Open Graph
- `getSiteRoot()` — returns the site root from `SITE_URL` env var or empty string

## Wiki routing

Wiki follows the same pattern as the art section:

- `src/pages/wiki/[...slug].astro` handles the root index, directory indexes, and detail pages.
- `src/pages/wiki/[...slug]/page/[page].astro` handles pagination with `/page/N/` URLs.
- `src/components/shared/_astro/AstroRecursiveCollectionIndex.astro` renders the list view with breadcrumbs and child-folder links.
- `src/components/shared/_astro/AstroCollectionDetail.astro` renders detail pages with breadcrumbs, metadata, and markdown content.

## Writing routing

Writing follows the same pattern as wiki, with an additional layout option for play scripts:

- `src/pages/writing/[...slug].astro` handles the root index, directory indexes, and detail pages.
- `src/pages/writing/[...slug]/page/[page].astro` handles pagination with `/page/N/` URLs.
- `src/components/features/writing/_astro/AstroWritingDetail.astro` renders detail pages with support for both prose and play layouts.

### Play script layout

When a writing entry has `layout: play` in its frontmatter, the content is rendered with:

- Monospace font throughout
- Centered scene headings (lines starting with `INT.` or `EXT.`)
- Centered character names (all-caps lines)
- Centered stage directions (lines in parentheses)
- Centered act/section headings (bold text)

The CSS class `.play-script` in `global.css` handles the formatting.

See `docs/writing-plays.md` for detailed formatting conventions and examples.

Shared recursive UI pieces live in `src/components/core/_astro/`:

- `AstroRecursiveBreadcrumb.astro` — breadcrumb trail for any directory tree. Accepts `baseUrl` (collection root, e.g. `/wiki/`), `baseLabels` (bilingual `Record<string, string>` for the root item), `slug` (directory path for sub-levels), and `translateLabel` (for segment translation). The first breadcrumb item renders `data-locales` for bilingual switching.
- `AstroEntryMeta.astro` — metadata bar for detail pages showing date (with `CalendarBlankIcon` + bilingual locale formatting via `data-locales`) and tags (with `TagIcon` + bilingual `AstroTagBadges`). Hidden entirely when the entry has no tags or no date. Used in all three collection detail pages (art, blog, wiki).
- `AstroTagBadges.astro` — shared component that renders an array of tags as shadcn `Badge` elements with `data-locales` for i18n. Accepts `tags`, `translateLabel`, optional `variant` and `className`. Used by `AstroEntryMeta`, `AstroRecursiveCollectionIndex`, and `AstroArtCard`.
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
- Cards display badges for every `tag`, with bilingual labels via a `translateLabel` prop.

## Image viewer (`image-viewer.tsx`)

The React lightbox used on art detail pages. Lives at `src/components/shared/image-viewer.tsx`.

- Renders a clickable thumbnail grid; clicking opens a full-screen `Dialog` overlay.
- Arrow buttons (or ← → keys) cycle between process shots; hidden while zoomed.
- **Zoom**: click the image to toggle 2x zoom centered on the click point.
- **Pan**: while zoomed, moving the mouse pans the image naturally (no click-drag needed). On mobile, single-finger drag pans the zoomed image.
- **Animation**: zoom in/out has a 200ms CSS transition; mouse panning is instantaneous.
- **Close**: click outside the image (on the backdrop) or press Escape.
- Zoom/pan logic is extracted to `src/hooks/use-image-zoom.ts`. The `computeTranslate` pure function maps mouse position to image translation based on the excess of the scaled image beyond the viewport dimensions.
- **Touch**: pinch-to-zoom (2 fingers) and single-finger pan (1 finger) when zoomed. A `didPanRef` in `ImageLightbox` prevents the `onClick` zoom-toggle from firing after a pan gesture. `touchAction: none` is applied when zoomed to prevent page scroll interference.

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

- Mounted via `AstroArticleImageViewer.astro` with `client:idle`.
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

# Search

The site uses client-side full-text search powered by [Lunr.js](https://lunrjs.com), indexing all collections (art, blog, wiki, page).

- **Search index** — `src/pages/search.json.ts` generates a static `search.json` at build time, containing every entry's `title`, `description`, `tags`, `headings` (h1/h2 text extracted from markdown), and `content` (markdown stripped to plain text). Home/resume routes are mapped to `/` and `/resume/` instead of `/home.en/`.
- **Cross-locale indexing** — `getTagLabels()` from `src/lib/search.ts` appends translated tag labels (from `@i18n/labels`) to the `tags` field, so Portuguese queries like "pastel de óleo" find English-tagged docs. Additionally, `getCollectionLabels()` appends translated collection names (e.g., `"Arte"`, `"Vikio"`) so searching for `Arte` or `Arto` finds art entries.
- **Diacritic normalization** — All indexed text is normalized via `str.normalize("NFD")` to strip diacritics. Searching for `c` matches `ç`, `e` matches `é`/`ê`, etc.
- **Locale-aware badges** — Result badges (Art, Wiki, Page) use `translations[locale]?.[collection]` to display in the user's current language, updating reactively via the `localechange` event.
- **No locale filter** — Search results are not filtered by the entry's `lang` field, so switching to PT/EO mode still shows English content.
- **Search component** — `src/components/shared/search.tsx` (React) with `client:load`. The input is embedded in `AstroNavbar.astro`. Results appear in a dropdown below the input.
- **Dropdown click handling** — The document-level `mousedown` handler that clears the query on outside-click must exclude Radix's dropdown portal (`[data-radix-popper-content-wrapper]`), otherwise clicking a result clears the query before `onSelect` fires.
- **Relevance strategy** — `searchIndex()` in `src/lib/search.ts` uses required prefix wildcards (`+term1* +term2*`), so every typed term must appear as a word prefix across all fields. Adding words narrows results (AND logic). Single-word queries also fall back to boosted exact and fuzzy matching. Results are sorted by Lunr score (relevance) first, then by date descending for entries with similar scores.
- **Lunr stop words and stemmer removed** — `lunr.stopWordFilter` and `lunr.stemmer` are removed from both pipelines, ensuring common words (about, me, the) and partial prefixes (everythi → everything) work correctly.
- **Shared types** in `src/types/search.ts` (`SearchDoc`). Search utilities in `src/lib/search.ts`.

## Wiki metadata convention

- Folder structure is the source of categorization; do not add a `category` field to wiki frontmatter.
- Allowed fields: `title`, `description`, `tags`, `date`, `image`, `author`, `status`.
- Always provide a `description` for SEO. It is rendered in page meta tags and should summarize the article in one sentence.
- Use `tags` for cross-cutting topics; they are rendered as badges on detail pages and included in the page keywords meta tag.
- Wiki supports `index: true` index pages. Place a markdown file with the same name as a folder (e.g. `linux.md` next to `linux/`) and set `index: true` in its frontmatter. The plugin will treat it as a directory index — its content is rendered at the top of the directory listing, and it is filtered out from the article listing and pagination.
- All collections support `lang: pt` to set Portuguese hyphenation (defaults to `en`). Passed through routes to `<html lang>`.

# i18n

Client-side locale detection for UI strings. No server routing or content restructuring. The system is designed to be **locale-agnostic** — every UI string, segment label, breadcrumb item, and date formatter iterates over `SUPPORTED_LOCALES` to produce labels for all configured locales. Adding a new locale to `SUPPORTED_LOCALES` automatically extends all i18n features.

- **Translation map** — `src/i18n/labels.ts` exports a unified `translations` object keyed by locale (`en`, `pt`), covering collection names, taxonomy segments, and UI strings. Also exports `getCookieLocale()`, `getLocale()`, `t(key)`, `createTranslateLabel()`, and `applyLocale(locale)`. Add new strings under the appropriate locale key. UI-level keys include `home`, `resume`, `light`, `dark`.
- **Locale-agnostic rendering** — Labels are embedded as `data-locales` JSON attributes on server-rendered HTML, containing entries for every locale in `SUPPORTED_LOCALES`. An inline `<script>` in `MainLayout.astro` and the locale switcher's `applyLocale()` swap textContent based on the locale cookie.
- **Persistence** — `src/lib/cookie.ts` provides `getCookie`/`setCookie` helpers. The `locale` and `theme` cookies are set on user interaction and checked on page load.
- **Locale Switcher** — `src/components/shared/locale-switcher.tsx` (React component using shadcn `DropdownMenu`), mounted as an Astro island with `client:visible`. Reads cookie, calls `applyLocale()`. Shows shimmer animation before locale is resolved.
- **Segment / tag translations** — `createTranslateLabel(collection?)` returns a `TranslateLabel = (segment) => Record<string, string>` function that produces labels for every locale in `SUPPORTED_LOCALES`. The `collection` parameter is accepted for backwards compatibility but all translations use bare keys (no `collection.segment` prefix). Passed down through parent components (`AstroRecursiveCollectionIndex`, `AstroArtGallery`) to child components (`AstroRecursiveBreadcrumb`, `AstroArtCard`). See `docs/i18n.md` for the translation key pattern.
- **Directory index titles** — the `<h1>` on index pages (e.g. `/wiki/encryption/`) uses `translateLabel(lastSegment)` with `data-locales`, so the page heading switches language with the UI locale. The `<title>` meta tag also reflects the translated segment name.
- **Breadcrumb root translation** — the first breadcrumb item uses `baseLabels` (`Record<string, string>`) instead of a plain string, so collection names (Art, Blog, Wiki) switch with the UI locale.
- **Locale-aware dates** — `AstroEntryMeta` uses `formatDateForLocales()` from `src/lib/date.ts`, which formats the date for every locale in `SUPPORTED_LOCALES` via `data-locales` on `<time>`, switching with the locale cookie.
- **Lang attribute** — `applyLocale()` sets `document.documentElement.lang`. Inline script in `MainLayout.astro` does the same on page load from the locale cookie.
- See `docs/i18n.md` for the full pattern reference.

# Theme / Dark Mode

- Dark mode uses the `.dark` CSS class on `<html>` (Tailwind v4 class-based variant: `@custom-variant dark (&:is(.dark *));`).
- CSS variables for `.dark` are defined in `src/styles/global.css`.
- **Theme Switcher** — `src/components/shared/theme-switcher.tsx` (React component using shadcn `DropdownMenu`) with `client:visible`. Sun/Moon icons controlled by CSS (`dark:hidden`/`hidden dark:block`) based on the `.dark` class from the inline `<head>` script. Shows shimmer animation before hydration.
- An inline `<script>` in `MainLayout.astro` runs before any component JS, applying the saved locale and theme immediately to prevent flash.

# SEO

- **Canonical URLs** — `MainLayout.astro` emits `<link rel="canonical">` using `getCanonicalUrl(path)` from `src/lib/url.ts`, which reads `import.meta.env.SITE` (configurable via `SITE_URL` env var). Falls back to relative path if no site URL is configured.
- **Sitemap** — `@astrojs/sitemap` integration generates `sitemap-index.xml` at build time. Configured in `astro.config.mjs`.
- **Robots.txt** — `public/robots.txt` allows all crawlers and points to the sitemap.
- **Open Graph** — `og:title`, `og:description`, `og:type`, `og:url`, `og:image`, and `article:published_time` (for articles) are rendered in `<head>`.
- **Twitter Cards** — `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image` mirror Open Graph tags.
- **JSON-LD Structured Data** — `MainLayout.astro` emits `<script type="application/ld+json">` with schema.org `Article` or `WebSite` type, including headline, description, url, datePublished (for articles), author, image, and publisher.
- **Semantic HTML** — `<article>`, `<nav>`, `<h1>`–`<h3>`, `<time>` with `datetime`, breadcrumb `<nav aria-label="breadcrumb">`.
- **`lang` attribute** — Set from entry's `lang` field for correct hyphenation and language hints.
- **Client-side locale** — Single-URL pattern (no `/pt/` prefix). Content is swapped client-side via `data-locales` and `data-content-locale`. Search engines see the default (English) server-rendered version.

## Performance

- **Resource hints** — `<link rel="preconnect">` for Google Fonts in `MainLayout.astro` to reduce font loading latency.
- **Font display** — `font-display: swap` applied to web fonts in `global.css` to prevent FOIT.
- **Lazy hydration** — Some React islands use `client:visible` instead of `client:load` where appropriate (LocaleSwitcher, ThemeSwitcher) to defer hydration until components enter viewport.
- **Tailwind v4 classes** — Use canonical Tailwind v4 classes: `bg-linear-to-r` instead of `bg-gradient-to-r`, `not-focus-visible:` instead of `[&:not(:focus-visible)]:`.

# Foam templates

Foam templates live in `.foam/templates/` and are used by the Foam VSCode extension to scaffold new content with proper frontmatter:

| File               | Collection | When to use                               |
| ------------------ | ---------- | ----------------------------------------- |
| `art-entry.md`     | `art`      | New artwork post (digital or traditional) |
| `blog-post.md`     | `blog`     | New blog article                          |
| `wiki-article.md`  | `wiki`     | New wiki article                          |
| `writing-entry.md` | `writing`  | New writing piece (prose or play script)  |

Run **Foam: Create New Template** in VSCode to use them. Fill in the placeholders (`title`, `description`, `tags`, etc.) after creation.

# Obsidian vault

The project root is an **Obsidian vault** for writing content. Images reference absolute paths from the project root (e.g. `/src/assets/art/...`) so the vault must be rooted at the project root for previews to resolve.

## Setup on a new machine

1. Open Obsidian → **Open folder as vault** → select project root
2. Install **Templater** via Settings → Community plugins → Browse → search "Templater" → Install → Enable
3. Configure Templater: Settings → **Templater** → set **Template folder location** to `_templates`
4. Enable **Trigger Templater on new file creation**
5. Add **Folder Templates** mapping each collection:
   - `src/content/art` → `_templates/art-entry.md`
   - `src/content/blog` → `_templates/blog-post.md`
   - `src/content/wiki` → `_templates/wiki-article.md`
   - `src/content/writing` → `_templates/writing-entry.md`
6. Configure **Excluded files** in Settings → Files & Links to hide code folders (copy from another machine's `.obsidian/app.json` or use the patterns in README.md)

> `.obsidian/` is git-ignored and managed by Syncthing. On a machine with Syncthing, the vault config (plugins, theme, excluded files) syncs automatically. On a machine without Syncthing, follow the steps above.

## What's visible in the file explorer

Only content-related folders appear — everything else is hidden via `userIgnoreFilters` in `.obsidian/app.json`:

| Visible                    | Hidden                                            |
| -------------------------- | ------------------------------------------------- |
| `src/content/` (markdown)  | `src/components/`, `src/lib/`, `src/pages/`, etc. |
| `src/assets/art/` (images) | `node_modules/`, `dist/`, `.astro/`, etc.         |
| `_templates/`              | All root config files (package.json, etc.)        |

## Templates (`_templates/`)

Obsidian templates (via **Templater** plugin) for scaffolding new content:

| Template           | Collection |
| ------------------ | ---------- |
| `art-entry.md`     | art        |
| `blog-post.md`     | blog       |
| `wiki-article.md`  | wiki       |
| `writing-entry.md` | writing    |

Usage: navigate to the target folder in Obsidian → `Ctrl+P` → **Templater: Insert template** → pick the template. Fill in frontmatter fields after creation. Templater also auto-applies templates when creating files inside collection folders (`src/content/art/` → `art-entry.md`, etc.).

## Syncthing

`.stignore` uses rooted negated patterns (`!/path/**`) so Syncthing only scans `src/content/`, `src/assets/`, and `.obsidian/` — everything else is excluded by `*` and managed by git. Only `.obsidian/workspace.json` / `workspace-mobile.json` (per-machine layout) are excluded before the inclusion patterns to prevent conflicts between devices. Plugin binaries and caches are synced so Obsidian works out of the box on every device.

# For agents

- When implementing relevant modifications in this project, please update the AGENTS.md file with documentation
- If a complex feature was being implemented, add a documentation file in the docs/ folder.
- If in doubt, check the documentation files in the docs/ folder.
- Collection configuration is centralized in `src/config/collections.ts` — defines collection types (`content` or `pages`), sidebar visibility, and helper functions.
- Locale values are centralized in `@i18n/labels` via `SUPPORTED_LOCALES` — use the type `Locale` instead of hardcoding `"en" | "pt" | "eo"`.

## Adding a New Collection

1. **Schema**: Add to `src/content.config.ts` with appropriate fields
2. **Config**: Add to `COLLECTION_CONFIGS` in `src/config/collections.ts`:
   - `type: "content"` for directory-tree collections (like wiki)
   - `type: "pages"` for single-page collections (like page)
3. **i18n**: Add labels for the collection name in `src/i18n/labels.ts` (all locales)
4. **Routes**: Create `src/pages/<name>/[...slug].astro` and pagination file
   - Copy from `src/pages/wiki/` as template for content collections
   - Replace "wiki" with collection name throughout
5. **Content**: Create `src/content/<name>/` directory

For gallery-style collections (like art with frontmatter images), create custom components similar to `AstroArtGallery` and `AstroArtDetail` in `src/components/features/<name>/_astro/`.
