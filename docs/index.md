# Homepage / Recent Entries

The homepage (`src/pages/index.astro`) has two sections:

1. **Page content** — renders locale-aware content from `src/content/page/` (e.g. `home.en.md`, `home.pt.md`, `home.eo.md`), toggled via `data-content-locale`
2. **Recent entries** — a configurable list of the latest entries from selected collections, rendered below the page content

## Configuration

Recent sections are configured in `src/constants/collections.ts`:

```ts
export const RECENT_PER_COLLECTION = 4;

export const RECENT_SECTIONS: RecentSectionDef[] = [
  { collection: "art", display: "art" },
  { collection: "blog", display: "list" },
  { collection: "wiki", display: "list" },
];
```

- `RECENT_PER_COLLECTION` — max entries per section (default: 4)
- `RECENT_SECTIONS` — array of `{ collection, display }` objects
  - `display: "art"` — renders entries as art cards with images in a responsive grid
  - `display: "list"` — renders entries as text items with date, tags, title, description

## Data flow

```
RECENT_SECTIONS ──> fetch each collection ──> sort by date DESC
                    │                          filter out index:true
                    │                          slice to RECENT_PER_COLLECTION
                    v
               recentData[]  ──> template renders each section
```

For `display: "art"`, each entry's first image is resolved via `resolveArtImage()` + `import.meta.glob` and stored in `ArtCardData.resolvedImage`.

## Components

### AstroEntryList (`src/components/core/_astro/AstroEntryList.astro`)

Generic entry list that renders entries as `Item` cards.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `collection` | `string` | Collection name (used for link hrefs) |
| `entries` | `EntryShape[]` | Entry objects with `id`, `data.title`, `data.description?`, `data.date?`, `data.tags?` |
| `translateLabel` | `TranslateLabel` | i18n helper for tag badges |
| `limit?` | `number` | If set, slices entries before rendering |
| `showMoreHref?` | `string` | If set, renders a "More" link at the bottom |

### AstroArtCard (`src/components/features/art/_astro/AstroArtCard.astro`)

Image card used by the `"art"` display mode. Requires a pre-resolved image and `CollectionEntry<"art">`.

## Adding a collection to the homepage

1. Add an entry to `RECENT_SECTIONS` in `src/constants/collections.ts`:

   ```ts
   { collection: "writing", display: "list" }
   ```

2. The collection must have entries in `src/content/<name>/`

3. Add translation labels in `src/i18n/labels.ts`:
   - Collection name key (e.g. `writing: "Writing"` / `"Escritos"` / `"Verkado"`)
   - `latest` key (already present: `"Latest"` / `"Últimos"` / `"Lastaj"`)

### Display modes

| Mode     | Component        | Requirements                                               |
| -------- | ---------------- | ---------------------------------------------------------- |
| `"art"`  | `AstroArtCard`   | Entries must have `images[]` frontmatter field             |
| `"list"` | `AstroEntryList` | Any collection with `title`, `date`, `tags`, `description` |

## Runtime data types (`src/types/recent.d.ts`)

```ts
type RecentDisplay = "art" | "list";
type RecentSectionDef = { collection: string; display: RecentDisplay };
type ArtCardData = {
  entry: CollectionEntry<"art">;
  resolvedImage: string | ImageMetadata;
};
type RecentSectionData = {
  collection: string;
  entries: CollectionEntry<CollectionName>[];
  artCards?: ArtCardData[];
};
type CollectionName = keyof DataEntryMap;
```
