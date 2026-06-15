import type { CollectionEntry, DataEntryMap } from "astro:content";

export type PaginatedStaticPath<C extends keyof DataEntryMap> = {
  params: { path?: string };
  props:
    | { type: "detail"; entry: CollectionEntry<C> }
    | { type: "listing"; page: number };
};

export type IndexPath<C extends keyof DataEntryMap> = {
  params: { slug: string | undefined };
  props: {
    mode: "index";
    slug: string | undefined;
    entries: CollectionEntry<C>[];
    entry?: CollectionEntry<C>;
  };
};

export type DetailPath<C extends keyof DataEntryMap> = {
  params: { slug: string };
  props: {
    mode: "detail";
    entry: CollectionEntry<C>;
  };
};

export type PaginationPath<C extends keyof DataEntryMap> = {
  params: { slug: string | undefined; page: string };
  props: {
    slug: string | undefined;
    page: number;
    entries: CollectionEntry<C>[];
  };
};
