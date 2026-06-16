import {
  getCollection,
  type CollectionEntry,
  type DataEntryMap,
} from "astro:content";
import { collections } from "../content.config";
import type {
  IndexPath,
  DetailPath,
  PaginationPath,
} from "../types/collection";

export async function getIndexAndDetailPaths<C extends keyof DataEntryMap>(
  collection: C,
): Promise<Array<IndexPath<C> | DetailPath<C>>> {
  const entries = await getCollection(collection);
  const directoryPaths = getDirectoryPaths(entries);

  for (const entry of entries) {
    if ((entry.data as any).index === true) {
      directoryPaths.push(entry.id);
    }
  }

  const directorySet = new Set(directoryPaths);

  const detailPaths: DetailPath<C>[] = entries
    .filter((entry) => !directorySet.has(entry.id))
    .map((entry) => ({
      params: { slug: entry.id },
      props: { mode: "detail", entry },
    }));

  const indexPaths: IndexPath<C>[] = [
    {
      params: { slug: undefined },
      props: { mode: "index", slug: undefined, entries },
    },
    ...directoryPaths.map((slug) => ({
      params: { slug },
      props: { mode: "index" as const, slug, entries },
    })),
  ];

  return [...detailPaths, ...indexPaths];
}

export async function getPaginationPaths<C extends keyof DataEntryMap>(
  collection: C,
  pageSize: number,
): Promise<PaginationPath<C>[]> {
  const entries = await getCollection(collection);
  const index = buildDirectoryIndex(entries);
  const paths: PaginationPath<C>[] = [];

  for (const slug of Object.keys(index)) {
    const allEntries = getRecursiveEntries(slug, index);
    const filtered = filterOutIndexEntries(allEntries);
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paramsSlug = slug || undefined;

    for (let page = 2; page <= totalPages; page++) {
      paths.push({
        params: { slug: paramsSlug, page: String(page) },
        props: { slug: paramsSlug, page, entries },
      });
    }
  }

  return paths;
}

export async function getSortedCollection<
  C extends keyof DataEntryMap,
  E extends CollectionEntry<C>,
>(
  collection: C,
  filter?: (entry: CollectionEntry<C>) => entry is E,
): Promise<E[]> {
  return (await getCollection(collection, filter)).sort(
    (a, b) => (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0),
  );
}

export function getDirectoryPaths<T extends { id: string }>(
  entries: T[],
): string[] {
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

export function filterEntriesByPrefix<
  T extends { id: string; data: { date?: Date } },
>(entries: T[], prefix?: string): T[] {
  const sorted = [...entries].sort(
    (a, b) => (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0),
  );

  if (!prefix) return sorted;

  const prefixWithSlash = `${prefix}/`;
  return sorted.filter(
    (entry) => entry.id === prefix || entry.id.startsWith(prefixWithSlash),
  );
}

export function getChildFolders<T extends { id: string }>(
  entries: T[],
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
  pageSize: number,
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

export function findIndexEntry<
  T extends { id: string; data: Record<string, unknown> },
>(entries: T[], slug?: string): T | undefined {
  if (!slug) return undefined;
  return entries.find(
    (entry) => entry.id === slug && entry.data.index === true,
  );
}

export function filterOutIndexEntries<
  T extends { id: string; data: Record<string, unknown> },
>(entries: T[]): T[] {
  return entries.filter((entry) => entry.data.index !== true);
}

export interface SidebarNode {
  name: string;
  href: string;
  children: SidebarNode[];
}

function sortSidebarChildren(node: SidebarNode): void {
  node.children.sort((a, b) => a.name.localeCompare(b.name));
  for (const child of node.children) {
    sortSidebarChildren(child);
  }
}

export function buildCollectionRoot(
  collection: string,
  entries: Array<{ id: string }>,
): SidebarNode {
  const root: SidebarNode = {
    name: collection,
    href: `/${collection}/`,
    children: [],
  };

  const dirMap = new Map<string, SidebarNode>();

  for (const entry of entries) {
    const parts = entry.id.split("/");
    if (parts.length < 2) continue;

    for (let i = 0; i < parts.length - 1; i++) {
      const fullPath = parts.slice(0, i + 1).join("/");

      if (!dirMap.has(fullPath)) {
        const node: SidebarNode = {
          name: parts[i],
          href: `/${collection}/${fullPath}/`,
          children: [],
        };
        dirMap.set(fullPath, node);

        if (i === 0) {
          root.children.push(node);
        } else {
          const parentPath = parts.slice(0, i).join("/");
          const parent = dirMap.get(parentPath);
          if (parent) {
            parent.children.push(node);
          }
        }
      }
    }
  }

  sortSidebarChildren(root);
  return root;
}

export async function buildFullSidebarTree(): Promise<{
  tree: SidebarNode[];
  collectionNames: string[];
}> {
  const collectionNames = Object.keys(collections);

  const tree: SidebarNode[] = [{ name: "home", href: "/", children: [] }];

  for (const name of collectionNames) {
    const entries = await getCollection(name as keyof DataEntryMap);
    tree.push(buildCollectionRoot(name, entries));
  }

  return { tree, collectionNames };
}

export interface DirectoryEntry<T> {
  children: string[];
  entries: T[];
  indexEntry?: T & { data: { index: boolean } };
}

export type DirectoryIndex<T> = Record<string, DirectoryEntry<T>>;

export function buildDirectoryIndex<
  T extends { id: string; data: { date?: Date; index?: boolean } },
>(entries: T[]): DirectoryIndex<T> {
  const sorted = [...entries].sort(
    (a, b) => (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0),
  );

  const index: DirectoryIndex<T> = {
    "": { children: [], entries: [] },
  };

  for (const entry of sorted) {
    const parts = entry.id.split("/");
    const dirPath = parts.slice(0, -1).join("/");

    let path = "";
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const parentPath = path;
      path = path ? `${path}/${part}` : part;

      if (!index[path]) {
        index[path] = { children: [], entries: [] };
        const parent = index[parentPath];
        if (parent && !parent.children.includes(part)) {
          parent.children.push(part);
        }
      }
    }

    if (!index[dirPath]) {
      index[dirPath] = { children: [], entries: [] };
      if (parts.length > 1) {
        const parentPath = parts.slice(0, -2).join("/");
        const part = parts[parts.length - 2];
        const parent = index[parentPath];
        if (parent && !parent.children.includes(part)) {
          parent.children.push(part);
        }
      }
    }

    index[dirPath].entries.push(entry);

    if (entry.data.index) {
      (index[dirPath] as any).indexEntry = entry;
    }
  }

  return index;
}

export function getRecursiveEntries<T>(
  key: string,
  index: DirectoryIndex<T>,
): T[] {
  const entry = index[key];
  if (!entry) return [];

  const result = [...entry.entries];
  for (const child of entry.children) {
    const childKey = key ? `${key}/${child}` : child;
    result.push(...getRecursiveEntries(childKey, index));
  }
  return result;
}
