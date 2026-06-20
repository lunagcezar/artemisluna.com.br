import type { ImageMetadata } from "astro";
import type { CollectionEntry, DataEntryMap } from "astro:content";

export type RecentDisplay = "art" | "list";

export type RecentSectionDef = {
  collection: string;
  display: RecentDisplay;
};

export type CollectionName = keyof DataEntryMap;

export type ArtCardData = {
  entry: CollectionEntry<"art">;
  resolvedImage: string | ImageMetadata;
};

export type RecentSectionData = {
  collection: string;
  entries: CollectionEntry<CollectionName>[];
  artCards?: ArtCardData[];
};
