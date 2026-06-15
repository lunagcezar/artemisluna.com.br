# Wiki system

The wiki is a nested knowledge base built on Astro content collections and a catch-all route pattern.

## Architecture overview

```
src/content/wiki/       ← markdown source files
src/pages/wiki/[...slug].astro        ← catch-all: index + detail
src/pages/wiki/[...slug]/page/[page].astro  ← pagination
src/lib/collections.ts  ← routing, filtering, index detection
src/lib/remark-wiki-links.ts  ← wiki-link resolution
```

## Content structure

Wiki files live under `src/content/wiki/` in a directory tree. Directories _are_ the taxonomy — their names become URL path segments.

```
src/content/wiki/
├── linux.md                  ← index: true — directory index for linux/
├── linux/
│   ├── encryption/
│   │   ├── encrypt-second-drive-when-the-first-is-encrypted-with-tpm.md
│   │   └── ubuntu-24-10-auto-decrypt-secondary-drives-workaround.md
│   └── networking/
│       └── disable-networkmanager-powersave-to-avoid-rtw89-jittery-ping.md
├── programming.md            ← index: true — directory index for programming/
└── programming/
    ├── cmake.md              ← index: true — directory index for cmake/
    └── cmake/
        ├── cmakelists.md
        └── move-external-dll-to-the-build-folder.md
```

### Index files

A markdown file with `index: true` in its frontmatter and the same name as its parent directory (e.g. `linux.md` beside `linux/`) serves as a **directory index page**. Its content is rendered at the top of the directory listing, and it is excluded from the article list and pagination.

```yaml
---
title: Linux
date: 2024-07-31
index: true
---
```

### Content schema

Defined in `src/content.config.ts` (line 65–77). Allowed frontmatter fields:

| Field         | Type                     | Required |
| ------------- | ------------------------ | -------- |
| `title`       | `string`                 | yes      |
| `description` | `string`                 | no       |
| `tags`        | `string[]`               | no       |
| `date`        | `Date` (ISO 8601)        | no       |
| `image`       | `string`                 | no       |
| `author`      | `string`                 | no       |
| `status`      | `"draft" \| "published"` | no       |
| `index`       | `boolean`                | no       |

## Routing

### Catch-all route

`src/pages/wiki/[...slug].astro` is a single catch-all route that handles three modes:

| Mode     | Trigger                           | Behaviour                                                                                  |
| -------- | --------------------------------- | ------------------------------------------------------------------------------------------ |
| `detail` | Any entry that isn't a directory  | Renders the article with title, tags, content                                              |
| `index`  | Root (`/wiki/`) or directory slug | Renders breadcrumbs, child-folders, index entry content (if any), article list, pagination |

### `getStaticPaths` logic

Both `[...slug].astro` and `[page].astro` use helper functions from `src/lib/collections.ts`:

1. **`getIndexAndDetailPaths`** — queries all wiki entries, builds directory paths from their IDs (splitting on `/`), then generates:
   - `detail` paths for entries whose ID does not match any directory path
   - `index` paths for every directory slug (including `undefined` for the root)
   - Index entries (`index: true`) are additionally registered as directory sources so they never generate conflicting detail pages

2. **`getPaginationPaths`** — for each directory slug, calculates how many pages are needed (excluding index entries from the count) and generates page 2+ paths.

### Template resolution

In `[...slug].astro`:

```typescript
const indexEntry = mode === "index" ? findIndexEntry(entries, slug) : undefined;
const filtered =
  mode === "index"
    ? filterOutIndexEntries(filterEntriesByPrefix(entries, slug))
    : [];
const childFolders = mode === "index" ? getChildFolders(entries, slug) : [];
```

- `findIndexEntry` — scans entries for one matching `slug` with `index: true`
- `filterOutIndexEntries` — removes any entry with `index: true` from listings
- `filterEntriesByPrefix` — returns entries whose `id` equals the slug or starts with `slug/`
- `getChildFolders` — returns immediate sub-directory names (e.g. `["encryption", "networking"]` for `linux`)

## Wiki links

The remark plugin in `src/lib/remark-wiki-links.ts` resolves internal cross-references at build time. Two syntaxes are supported:

### Foam wikilinks

```
[[encrypt-second-drive-when-the-first-is-encrypted-with-tpm]]
[[filename|Custom display text]]
```

### Standard markdown link references

```markdown
[slug]: encrypt-second-drive-when-the-first-is-encrypted-with-tpm "Title"

Reference: [slug]
```

### Rendering

All wiki links render with the target page's frontmatter title wrapped in `[...]`:

- `[[encrypt-second-drive-when-the-first-is-encrypted-with-tpm]]` → `<a href="/wiki/linux/encryption/encrypt-second-drive-when-the-first-is-encrypted-with-tpm/">[Encrypt second drive when the first is encrypted with TPM]</a>`
- `[[target|Alias]]` → `<a href="...">[Alias]</a>`
- Unresolved targets → `[target]` as plain text (dead backlink indicator)

See `docs/remark-wiki-links.md` for full implementation details.

## i18n

Wiki directory segments (the folder names that become URL parts) are translated via the i18n system. Labels follow the pattern `wiki.<segment>` in `src/i18n/labels.ts`:

```typescript
pt: {
  "wiki.encryption": "Criptografia",
  "wiki.networking": "Redes",
}
```

The `AstroRecursiveBreadcrumb` and `AstroRecursiveChildFolders` components accept a `translateLabel` function that maps each segment to bilingual `data-locales` attributes. The client-side locale switcher swaps the visible text without a page reload.

## Render pipeline

For a wiki article visiting `/wiki/linux/encryption/`:

```
[Request]
    ↓
[...slug].astro getStaticPaths()
    → getIndexAndDetailPaths("wiki")
    → returns index path for "linux/encryption" with entries filtered by prefix
    ↓
[index mode] AstroRecursiveCollectionIndex
    → AstroRecursiveBreadcrumb    (Wiki > Linux > Encryption)
    → AstroRecursiveChildFolders  (badge links to sub-folders)
    → AstroEntryContent           (if indexEntry exists, renders its markdown)
    → Article list                (sorted by date, paginated)
    → AstroPagination             (page 2+ links)
```
