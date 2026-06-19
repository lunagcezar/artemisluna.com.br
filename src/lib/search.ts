import lunr from "lunr";
import { translations, SUPPORTED_LOCALES } from "@i18n/labels";

export function formatSegment(segment: string): string {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^>+\s*/gm, "")
    .replace(/^[-*_]{3,}\s*$/gm, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{2,}/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractHeadings(md: string): string {
  return md
    .split("\n")
    .filter((line) => /^#{1,2}\s/.test(line))
    .map((line) => line.replace(/^#+\s*/, "").trim())
    .join(" ");
}

export function getTagLabels(tags: string[]): string[] {
  return tags.flatMap((tag) =>
    SUPPORTED_LOCALES.map((locale) =>
      locale === "en"
        ? formatSegment(tag)
        : (translations[locale]?.[tag] ?? ""),
    ).filter(Boolean),
  );
}

export function getLocale(): string {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
  return match?.[1] ?? "en";
}

export function searchIndex(idx: lunr.Index, raw: string): lunr.Index.Result[] {
  const terms = raw.trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  const restricted = ["title", "headings", "description"];

  const inRestricted = (r: lunr.Index.Result) =>
    terms.every((t) => {
      const meta = r.matchData.metadata as Record<
        string,
        Record<string, unknown>
      >;
      const info = meta[t];
      if (!info) return false;
      return restricted.some((f) => info[f]);
    });

  try {
    const required = terms.map((t) => `+${t}`).join(" ");
    const rawResults = idx.search(required);
    const filtered = rawResults.filter(inRestricted);
    if (filtered.length > 0) return filtered;
  } catch {
    return [];
  }

  try {
    return idx.search(
      terms.map((t) => `${t}^3`).join(" ") +
        " " +
        terms.map((t) => `${t}*`).join(" ") +
        " " +
        terms.map((t) => `${t}~1`).join(" "),
    );
  } catch {
    return [];
  }
}
