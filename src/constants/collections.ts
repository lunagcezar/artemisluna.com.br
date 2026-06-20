import type { RecentSectionDef } from "../types/recent";
import { getContentCollections } from "../config/collections";

export const RECENT_PER_COLLECTION = 4;

const allContent = getContentCollections();

export const RECENT_SECTIONS: RecentSectionDef[] = allContent
  .toSorted((a) => (a === "art" ? -1 : 1))
  .map((collection) => ({
    collection,
    display: collection === "art" ? ("art" as const) : ("list" as const),
  }));
