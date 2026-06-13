import type { CollectionEntry, DataEntryMap } from "astro:content";

export type PaginatedStaticPath<C extends keyof DataEntryMap> = {
  params: { path?: string };
  props:
    | { type: "detail"; entry: CollectionEntry<C> }
    | { type: "listing"; page: number };
};
