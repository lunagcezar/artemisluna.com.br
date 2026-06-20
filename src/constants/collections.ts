import type { RecentSectionDef } from "../types/recent";

export const RECENT_PER_COLLECTION = 4;

export const RECENT_SECTIONS: RecentSectionDef[] = [
  { collection: "art", display: "art" },
  { collection: "blog", display: "list" },
  { collection: "wiki", display: "list" },
];
