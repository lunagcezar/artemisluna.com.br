import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";

export const ART_PAGE_SIZE = 4;

export type ArtImageModules = Record<string, { default: ImageMetadata }>;

export function getDirectoryPaths(entries: CollectionEntry<"art">[]): string[] {
  const paths = new Set<string>();

  for (const entry of entries) {
    const parts = entry.id.split("/");
    parts.pop();

    let prefix = "";
    for (const part of parts) {
      prefix = prefix ? `${prefix}/${part}` : part;
      paths.add(prefix);
    }
  }

  return Array.from(paths).sort();
}

export function filterEntriesByPrefix(
  entries: CollectionEntry<"art">[],
  prefix?: string,
): CollectionEntry<"art">[] {
  const sorted = [...entries].sort(
    (a, b) => (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0),
  );

  if (!prefix) return sorted;

  const prefixWithSlash = `${prefix}/`;
  return sorted.filter(
    (entry) => entry.id === prefix || entry.id.startsWith(prefixWithSlash),
  );
}

export function getChildFolders(
  entries: CollectionEntry<"art">[],
  prefix?: string,
): string[] {
  const prefixWithSlash = prefix ? `${prefix}/` : "";
  const children = new Set<string>();

  for (const entry of entries) {
    if (!entry.id.startsWith(prefixWithSlash)) continue;

    const remaining = entry.id.slice(prefixWithSlash.length);
    const slashIndex = remaining.indexOf("/");
    if (slashIndex === -1) continue;

    children.add(remaining.slice(0, slashIndex));
  }

  return Array.from(children).sort();
}

export function paginateEntries<T>(
  entries: T[],
  page: number,
  pageSize = ART_PAGE_SIZE,
): {
  pageEntries: T[];
  totalPages: number;
  currentPage: number;
} {
  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const pageEntries = entries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return { pageEntries, totalPages, currentPage };
}

export function formatSegment(segment: string): string {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function resolveArtImage(
  src: string,
  imageModules: ArtImageModules,
): string | ImageMetadata {
  if (!src.startsWith("/src/assets/art/")) return src;

  const mod = imageModules[src];
  return mod ? mod.default : src;
}
