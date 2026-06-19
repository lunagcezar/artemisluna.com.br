# Navigation system

The site uses a tree-based sidebar navigation built at build time from content collections. No manual nav configuration is needed — the tree is automatically generated from the folder structure.

## Architecture

```
src/pages/             ← catch-all routes consume DirectoryIndex
src/components/
  shared/_astro/
    AstroSidebar.astro           ← desktop sticky tree sidebar
    AstroNavbar.astro            ← mobile collapsible tree drawer + search input
    AstroSiteBranch.astro        ← recursive tree node renderer
  shared/
    search.tsx                   ← React Lunr search (client:load island)
    locale-switcher.tsx          ← React shadcn DropdownMenu (client:visible)
    theme-switcher.tsx           ← React shadcn DropdownMenu (client:visible)
src/lib/
  collections.ts  ← DirectoryIndex + Sidebar tree builders
  sidebar.ts      ← shared branch helpers (labels, active state)
  search.ts       ← searchIndex, getLocale, stripMarkdown, extractHeadings
src/types/
  search.ts       ← SearchDoc type
```

## Sidebar tree generation

### 1. Root entry point — `buildFullSidebarTree()`

`AstroSidebar.astro` and `AstroNavbar.astro` both call `buildFullSidebarTree()` from `src/lib/collections.ts`. This function:

```ts
export async function buildFullSidebarTree(): Promise<{
  tree: SidebarNode[];
  collectionNames: string[];
}> {
  const contentCollections = getContentCollections();
  const pagesCollection = getPagesCollection();

  const tree: SidebarNode[] = [];

  // Read page collection dynamically — derive page names from filenames
  if (pagesCollection) {
    const pages = await getCollection(pagesCollection as keyof DataEntryMap);
    const uniqueNames = [
      ...new Set(pages.map((p) => getPageBaseName(p.id))),
    ].sort();
    for (const name of uniqueNames) {
      tree.push({
        name,
        href: getPageUrl(name),
        children: [],
      });
    }
  }

  // For each content collection, build a tree from its entry IDs
  for (const name of contentCollections) {
    const entries = await getCollection(name as keyof DataEntryMap);
    if (entries.length === 0) continue;
    tree.push(buildCollectionRoot(name, entries));
  }

  return { tree, collectionNames: contentCollections };
}
```

1. Reads content collection names from `COLLECTION_CONFIGS` (art, wiki)
2. Reads the `page` collection and derives unique page names from filenames (e.g., `home.en.md` → `home` → `/`)
3. For each content collection, calls `buildCollectionRoot()` to generate the folder tree

### 2. Per-collection tree — `buildCollectionRoot(name, entries)`

This function takes a collection name and all its entries, then extracts directory segments from each entry's `id` to build a recursive tree:

```ts
export function buildCollectionRoot(
  collection: string,
  entries: Array<{ id: string }>,
): SidebarNode {
  const root: SidebarNode = {
    name: collection, // e.g. "wiki"
    href: `/${collection}/`, // e.g. "/wiki/"
    children: [],
  };

  // For each entry like "linux/encryption/some-topic.md", extract path segments
  for (const entry of entries) {
    const parts = entry.id.split("/"); // ["linux", "encryption", "some-topic.md"]
    if (parts.length < 2) continue;

    // Walk the directory path: "linux", "linux/encryption"
    for (let i = 0; i < parts.length - 1; i++) {
      const fullPath = parts.slice(0, i + 1).join("/");
      // Create node or reuse existing one
      if (!dirMap.has(fullPath)) {
        const node = {
          name: parts[i], // e.g. "linux"
          href: `/${collection}/${fullPath}/`, // e.g. "/wiki/linux/"
          children: [],
        };
        dirMap.set(fullPath, node);
        // Attach to root or parent node
        if (i === 0) {
          root.children.push(node);
        } else {
          const parentPath = parts.slice(0, i).join("/");
          dirMap.get(parentPath)?.children.push(node);
        }
      }
    }
  }
  // Sort children alphabetically
  sortSidebarChildren(root);
  return root;
}
```

Example: for a wiki entry `linux/encryption/some-topic.md`, the function:

- Creates node `linux` → `/wiki/linux/`
- Creates node `encryption` → `/wiki/linux/encryption/`
- Attaches `encryption` as child of `linux`

### 3. Rendering — recursive `AstroSiteBranch.astro`

`AstroSiteBranch` uses `Astro.self` for recursion. Each node receives:

```ts
- getLabels(node)   → bilingual labels for data-locales
- isActive(node)    → true if currentPath starts with node.href
- hasActiveDescendant(node) → auto-expands ancestor branches
```

Active page detection is done at build time via `currentPath.startsWith(node.href)`. No client-side JS is needed — ancestor branches of the active page are always pre-expanded in the SSR HTML.

### 4. Bilingual labels

`createSidebarHelpers()` in `src/lib/sidebar.ts` provides the label resolution for each node:

- Root nodes (`/`, `/resume/`): look up `home` and `resume` from translations
- Collection root nodes (`/art/`, `/blog/`, `/wiki/`): look up the collection name as a bare key in translations
- Subdirectory nodes: use `createTranslateLabel()` which falls through to `formatSegment()` if no translation exists

## DirectoryIndex (route file queries)

Route files (`[...slug].astro` and `[...slug]/page/[page].astro` for art, blog, wiki) build a `DirectoryIndex` once from the entries, then query it instead of iterating flat lists:

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

`getRecursiveEntries` walks the tree and returns all descendant entries globally sorted by date descending. Directory indexes display all descendant entries. Entries whose `id` matches a directory path (e.g. `programming/cmake` when `programming/cmake/cmakelists` exists) are stored as that directory's `indexEntry` rather than appearing in the parent's `entries`.

## Responsive

- **Desktop** (`lg:` and up): `AstroSidebar` is a sticky sidebar (`sticky top-0 h-screen overflow-y-auto`) beside the main content
- **Mobile** (below `lg:`): `AstroNavbar` is a fixed top bar with a hamburger toggle that opens a drawer containing the same tree. The drawer closes when a link is clicked, the viewport reaches `lg+`, or the user clicks outside the navbar. A search input is always visible in the top bar.

## Dropdown menus

Locale and theme switchers use shadcn `DropdownMenu` (Radix UI) via React components mounted as Astro islands:

| Component        | File                                        | Description                                                                                                                |
| ---------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `ThemeSwitcher`  | `src/components/shared/theme-switcher.tsx`  | shadcn `DropdownMenu` with Light/Dark options, reads/writes `theme` cookie, toggles `.dark` class                          |
| `LocaleSwitcher` | `src/components/shared/locale-switcher.tsx` | shadcn `DropdownMenu` with locale options from `SUPPORTED_LOCALES`, calls `applyLocale()`, dispatches `localechange` event |

Both are rendered via `client:visible` directly in `AstroNavbar.astro`.

## Shared helpers (`src/lib/sidebar.ts`)

`createSidebarHelpers(currentPath, collectionNames)` returns three functions used by both sidebar and navbar:

| Function                        | Purpose                                                                          |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `getNodeLabels(node)`           | Resolves bilingual labels from `createTranslateLabel()` and the translations map |
| `nodeIsActive(node)`            | True if `currentPath` starts with `node.href` (exact match for home)             |
| `nodeHasActiveDescendant(node)` | True if the node or any of its descendants is active                             |
