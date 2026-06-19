export const CONTENT_COLLECTIONS = ["art", "wiki"] as const;
export const ALL_COLLECTIONS = ["art", "wiki", "page"] as const;

export type ContentCollection = (typeof CONTENT_COLLECTIONS)[number];
export type AllCollection = (typeof ALL_COLLECTIONS)[number];

export const COLLECTION_LABEL: Record<string, string> = {
  art: "Art",
  wiki: "Wiki",
  page: "Page",
};
