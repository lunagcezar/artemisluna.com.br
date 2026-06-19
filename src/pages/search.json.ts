import { getCollection, type DataEntryMap } from "astro:content";
import { stripMarkdown, extractHeadings, getTagLabels } from "@lib/search";
import type { SearchDoc } from "../types/search";
import { translations, SUPPORTED_LOCALES } from "@i18n/labels";
import {
  getContentCollections,
  getPagesCollection,
  getPageBaseName,
  getPageUrl,
} from "@config/collections";

function normalize(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getCollectionLabels(name: string): string[] {
  return SUPPORTED_LOCALES.map(
    (locale) => translations[locale]?.[name] ?? "",
  ).filter(Boolean);
}

export async function GET() {
  const docs: SearchDoc[] = [];
  const contentNames = getContentCollections();

  for (const name of contentNames) {
    let entries;
    try {
      entries = await getCollection(name as keyof DataEntryMap);
    } catch {
      continue;
    }
    if (entries.length === 0) continue;
    for (const entry of entries) {
      if ("index" in entry.data && entry.data.index) continue;
      const rawTags = Array.isArray(entry.data.tags) ? entry.data.tags : [];
      const tagLabels = getTagLabels(rawTags);
      const collectionLabels = getCollectionLabels(name);
      const body = "body" in entry ? (entry.body ?? "") : "";
      const content = stripMarkdown(body);
      const headings = extractHeadings(body);
      docs.push({
        id: `${name}/${entry.id}`,
        title: normalize(entry.data.title),
        description: normalize(entry.data.description ?? ""),
        tags: normalize(
          [name, ...collectionLabels, ...rawTags, ...tagLabels].join(" "),
        ),
        headings: normalize(headings),
        content: normalize(content),
        url: `/${name}/${entry.id}/`,
        collection: name,
        lang: (entry.data as { lang?: string }).lang ?? "en",
        date:
          "date" in entry.data && entry.data.date
            ? entry.data.date.toISOString()
            : "",
      });
    }
  }

  const pagesCollection = getPagesCollection();
  if (pagesCollection) {
    const pages = await getCollection(pagesCollection as keyof DataEntryMap);
    for (const entry of pages) {
      const rawTags = Array.isArray(entry.data.tags) ? entry.data.tags : [];
      const tagLabels = getTagLabels(rawTags);
      const collectionLabels = getCollectionLabels(pagesCollection);
      const body = "body" in entry ? (entry.body ?? "") : "";
      const content = stripMarkdown(body);
      const headings = extractHeadings(body);
      const baseName = getPageBaseName(entry.id);
      docs.push({
        id: `${pagesCollection}/${entry.id}`,
        title: normalize(entry.data.title),
        description: normalize(entry.data.description ?? ""),
        tags: normalize(
          [pagesCollection, ...collectionLabels, ...rawTags, ...tagLabels].join(
            " ",
          ),
        ),
        headings: normalize(headings),
        content: normalize(content),
        url: getPageUrl(baseName),
        collection: pagesCollection,
        lang: entry.data.lang ?? "en",
        date:
          "date" in entry.data && entry.data.date
            ? entry.data.date.toISOString()
            : "",
      });
    }
  }

  return new Response(JSON.stringify(docs), {
    headers: { "Content-Type": "application/json" },
  });
}
