import { SUPPORTED_LOCALES } from "../i18n/labels";

export interface CollectionConfig {
  name: string;
  type: "content" | "pages";
}

export const COLLECTION_CONFIGS: CollectionConfig[] = [
  { name: "art", type: "content" },
  { name: "wiki", type: "content" },
  { name: "page", type: "pages" },
];

export function getContentCollections(): string[] {
  return COLLECTION_CONFIGS.filter((c) => c.type === "content").map(
    (c) => c.name,
  );
}

export function getAllCollections(): string[] {
  return COLLECTION_CONFIGS.map((c) => c.name);
}

export function getPagesCollection(): string | undefined {
  return COLLECTION_CONFIGS.find((c) => c.type === "pages")?.name;
}

export function getPageBaseName(entryId: string): string {
  for (const locale of SUPPORTED_LOCALES) {
    if (entryId.endsWith(`.${locale}`)) {
      return entryId.slice(0, -(locale.length + 1));
    }
    if (entryId.endsWith(locale) && entryId.length > locale.length) {
      return entryId.slice(0, -locale.length);
    }
  }
  return entryId;
}

export function getPageUrl(baseName: string): string {
  return baseName === "home" ? "/" : `/${baseName}/`;
}
