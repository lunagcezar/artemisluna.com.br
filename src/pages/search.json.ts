import { getCollection } from "astro:content";
import { stripMarkdown, extractHeadings, getTagLabels } from "@lib/search";
import type { SearchDoc } from "../types/search";
import { CONTENT_COLLECTIONS } from "../constants/collection";

function normalize(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export async function GET() {
  const docs: SearchDoc[] = [];
  const contentNames = CONTENT_COLLECTIONS;

  for (const name of contentNames) {
    let entries;
    try {
      entries = await getCollection(name);
    } catch {
      continue;
    }
    if (entries.length === 0) continue;
    for (const entry of entries) {
      if ("index" in entry.data && entry.data.index) continue;
      const rawTags = Array.isArray(entry.data.tags) ? entry.data.tags : [];
      const tagLabels = getTagLabels(rawTags);
      const body = "body" in entry ? (entry.body ?? "") : "";
      const content = stripMarkdown(body);
      const headings = extractHeadings(body);
      docs.push({
        id: `${name}/${entry.id}`,
        title: normalize(entry.data.title),
        description: normalize(entry.data.description ?? ""),
        tags: normalize([name, ...rawTags, ...tagLabels].join(" ")),
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

  const pages = await getCollection("page");
  for (const entry of pages) {
    const rawTags = Array.isArray(entry.data.tags) ? entry.data.tags : [];
    const tagLabels = getTagLabels(rawTags);
    const body = "body" in entry ? (entry.body ?? "") : "";
    const content = stripMarkdown(body);
    const headings = extractHeadings(body);
    const isHome = entry.id.startsWith("home");
    const isResume = entry.id.startsWith("resume");
    const url = isHome ? "/" : isResume ? "/resume/" : `/${entry.id}/`;
    docs.push({
      id: `page/${entry.id}`,
      title: normalize(entry.data.title),
      description: normalize(entry.data.description ?? ""),
      tags: normalize(["page", ...rawTags, ...tagLabels].join(" ")),
      headings: normalize(headings),
      content: normalize(content),
      url,
      collection: "page",
      lang: entry.data.lang ?? "en",
      date:
        "date" in entry.data && entry.data.date
          ? entry.data.date.toISOString()
          : "",
    });
  }

  return new Response(JSON.stringify(docs), {
    headers: { "Content-Type": "application/json" },
  });
}
