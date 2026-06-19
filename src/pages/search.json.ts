import { getCollection } from "astro:content";
import { stripMarkdown, extractHeadings, getTagLabels } from "@lib/search";
import type { SearchDoc } from "../types/search";

export async function GET() {
  const docs: SearchDoc[] = [];
  const contentNames = ["art", "blog", "wiki"] as const;

  for (const name of contentNames) {
    const entries = await getCollection(name);
    for (const entry of entries) {
      if ("index" in entry.data && entry.data.index) continue;
      const rawTags = Array.isArray(entry.data.tags) ? entry.data.tags : [];
      const tagLabels = getTagLabels(rawTags);
      const body = "body" in entry ? (entry.body ?? "") : "";
      const content = stripMarkdown(body);
      const headings = extractHeadings(body);
      docs.push({
        id: `${name}/${entry.id}`,
        title: entry.data.title,
        description: entry.data.description ?? "",
        tags: [...rawTags, ...tagLabels].join(" "),
        headings,
        content,
        url: `/${name}/${entry.id}/`,
        collection: name,
        lang: (entry.data as { lang?: string }).lang ?? "en",
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
      title: entry.data.title,
      description: entry.data.description ?? "",
      tags: [...rawTags, ...tagLabels].join(" "),
      headings,
      content,
      url,
      collection: "page",
      lang: entry.data.lang ?? "en",
    });
  }

  return new Response(JSON.stringify(docs), {
    headers: { "Content-Type": "application/json" },
  });
}
