# Navigation system

The site uses a tree-based sidebar navigation built at build time from content collections.

## Architecture

```
src/pages/             ← catch-all routes consume DirectoryIndex
src/components/
  shared/_astro/
    AstroSidebar.astro      ← desktop sticky tree sidebar
    AstroNavbar.astro       ← mobile collapsible tree drawer
    AstroSidebarBranch.astro  ← recursive tree node renderer
src/lib/
  collections.ts  ← DirectoryIndex + Sidebar tree builders
  sidebar.ts      ← shared branch helpers (labels, active state)
```

## DirectoryIndex (route file queries)

All 6 route files (`[...slug].astro` and `[...slug]/page/[page].astro` for art, blog, wiki) build a `DirectoryIndex` once from the collection entries they receive via `Astro.props`, then query it instead of calling separate passes:

```ts
const index = buildDirectoryIndex(entries);
const dir = index[slug ?? ""];
const allEntries = getRecursiveEntries(slug ?? "", index);
const childFolders = dir?.children ?? [];
const indexEntry = dir?.indexEntry;
```

**DirectoryIndex** is a `Record<string, DirectoryEntry>`, keyed by directory path (`""` for root). Each entry stores:

- `children` — immediate subfolder names
- `entries` — entries directly in this directory (pre-sorted by date desc)
- `indexEntry` — optional `index: true` entry for the directory

Directory indexes display all descendant entries (recursive), sorted globally by date descending. Child-folder links let users navigate deeper into the hierarchy. Entries whose `id` matches a directory path (e.g. `programming/cmake` when `programming/cmake/cmakelists` exists) are stored as that directory's `indexEntry` rather than appearing in the parent's `entries`.

### What replaced what

| Old (flat iteration)                   | New (index lookup)                       |
| -------------------------------------- | ---------------------------------------- |
| `filterEntriesByPrefix(entries, slug)` | `getRecursiveEntries(slug ?? "", index)` |
| `getChildFolders(entries, slug)`       | `dir?.children ?? []`                    |
| `findIndexEntry(entries, slug)`        | `dir?.indexEntry`                        |

## Sidebar tree

The sidebar shows a folder tree for all collections, auto-discovered from `content.config.ts`:

```
Home (/)
Art (/art/)
├── Digital (/art/digital/)
│   └── Painting (/art/digital/painting/)
└── Traditional (/art/traditional/)
    ├── Drawing (/art/traditional/drawing/)
    │   ├── Urban-sketching
    │   └── Fictional-cityscapes
    └── Painting (/art/traditional/painting/)
        ├── Gouache
        └── Oil-pastel
Blog (/blog/)
Wiki (/wiki/)
├── Linux (/wiki/linux/)
│   ├── Encryption
│   └── Networking
└── Programming (/wiki/programming/)
    └── Cmake
```

### Build

`buildFullSidebarTree()` in `src/lib/collections.ts` reads collection names from `content.config.ts`, calls `getCollection()` for each, and builds a `SidebarNode` tree via `buildCollectionRoot()`.

`buildCollectionRoot(collection, entries)` extracts directory segments from entry IDs and assembles them into a recursive `SidebarNode` tree.

### Rendering

`AstroSidebarBranch.astro` is a recursive component (using `Astro.self`) that renders a single tree node. It receives helper functions as props:

- `getLabels(node)` — returns bilingual labels (`{ en, pt }`) for `data-locales` embedding
- `isActive(node)` — whether the node matches `currentPath`
- `hasActiveDescendant(node)` — whether any descendant is active (controls expand/collapse)

Ancestor expansion is automatic: nodes whose descendants are active always show their children. No client-side JS is needed.

### Responsive

- **Desktop** (`lg:` and up): `AstroSidebar` is a sticky sidebar (`sticky top-0 h-screen overflow-y-auto`) beside the main content
- **Mobile** (below `lg:`): `AstroNavbar` is a fixed top bar with a hamburger toggle that opens a drawer containing the same tree

## Shared helpers (`src/lib/sidebar.ts`)

`createSidebarHelpers(currentPath, collectionNames)` returns three functions used by both sidebar and navbar:

| Function                        | Purpose                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------ |
| `getNodeLabels(node)`           | Resolves bilingual labels from `createTranslateLabel(collection)` and the translations map |
| `nodeIsActive(node)`            | True if `currentPath` starts with `node.href` (exact match for home)                       |
| `nodeHasActiveDescendant(node)` | True if the node or any of its descendants is active                                       |
