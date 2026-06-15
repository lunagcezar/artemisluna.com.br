import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { visit } from "unist-util-visit";
import type {
  Root,
  Text,
  Link,
  Definition,
  LinkReference,
  PhrasingContent,
} from "mdast";

const WIKI_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../content/wiki",
);

interface WikiEntry {
  id: string;
  title: string;
}

function loadWikiEntries(): WikiEntry[] {
  const entries: WikiEntry[] = [];

  function walk(dir: string, prefix: string): void {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const relativePath = prefix ? `${prefix}/${item.name}` : item.name;
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        walk(fullPath, relativePath);
        continue;
      }

      if (!item.isFile() || !item.name.endsWith(".md")) continue;

      const content = fs.readFileSync(fullPath, "utf-8");
      const { data } = matter(content);

      entries.push({
        id: relativePath.replace(/\.md$/, ""),
        title: String(data.title ?? ""),
      });
    }
  }

  walk(WIKI_DIR, "");
  return entries;
}

const entries = loadWikiEntries();

const routeByFilename = new Map<string, string>();
const routeByTitle = new Map<string, string>();
const titleByFilename = new Map<string, string>();

for (const entry of entries) {
  const route = `/wiki/${entry.id}/`;
  const filename = entry.id.split("/").pop()?.toLowerCase() ?? "";

  routeByFilename.set(filename, route);
  routeByFilename.set(`${filename}.md`, route);
  routeByTitle.set(entry.title.toLowerCase(), route);
  titleByFilename.set(filename, entry.title);
  titleByFilename.set(`${filename}.md`, entry.title);
}

function resolveRoute(text: string): string | undefined {
  const key = text.trim().toLowerCase();
  return routeByFilename.get(key) ?? routeByTitle.get(key);
}

function resolveTitle(text: string): string | undefined {
  const key = text.trim().toLowerCase();
  return titleByFilename.get(key);
}

/**
 * Resolves Foam-style wiki links in `src/content/wiki/` files.
 *
 * Handles:
 * - Link-reference definitions: `[slug]: slug "Title"` → `[slug]: /wiki/path/slug/ "Title"`
 * - Link references: `[slug]` → `<a href="/wiki/path/slug/">[Title]</a>`
 * - Wikilink syntax: `[[slug]]` / `[[slug|alias]]` → standard markdown links
 */
export default function remarkWikiLinks() {
  return function (
    tree: Root,
    file: { history: string[]; path?: string; dirname?: string },
  ) {
    const rawPath = file.history?.[0] ?? file.path ?? file.dirname ?? "";
    const filePath = path.normalize(rawPath).replace(/\\/g, "/");
    if (!filePath.includes("/src/content/wiki/")) return;

    // 1. Rewrite definition URLs that match a wiki filename.
    visit(tree, "definition", (node: Definition) => {
      const route = resolveRoute(node.url);
      if (route) node.url = route;
    });

    // 2. Convert linkReference nodes to direct links.
    visit(tree, "linkReference", (node: LinkReference, index, parent) => {
      if (!parent || typeof index !== "number") return;

      const route = resolveRoute(node.label ?? node.identifier);
      if (!route) return;

      const linkNode = node as unknown as Link;
      linkNode.type = "link";
      linkNode.url = route;

      const title = resolveTitle(node.label ?? node.identifier);
      linkNode.children = [
        {
          type: "text",
          value: `[${title ?? node.label ?? node.identifier}]`,
        },
      ];

      delete (linkNode as unknown as Partial<LinkReference>).identifier;
      delete (linkNode as unknown as Partial<LinkReference>).referenceType;

      // Remove the outer brackets Foam leaves around wikilinks (`[[...]]`).
      const previous = parent.children[index - 1];
      const next = parent.children[index + 1];

      if (previous?.type === "text" && previous.value.endsWith("[")) {
        previous.value = previous.value.slice(0, -1);
      }
      if (next?.type === "text" && next.value.startsWith("]")) {
        next.value = next.value.slice(1);
      }
    });

    // 3. Convert `[[target]]` / `[[target|alias]]` wikilink syntax.
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent || typeof index !== "number") return;

      const matches = [
        ...node.value.matchAll(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g),
      ];
      if (matches.length === 0) return;

      const replacements: PhrasingContent[] = [];
      let position = 0;

      for (const match of matches) {
        const [fullMatch, target, alias] = match;
        const start = match.index ?? 0;

        if (start > position) {
          replacements.push({
            type: "text",
            value: node.value.slice(position, start),
          });
        }

        const route = resolveRoute(target);

        if (route) {
          const label = alias?.trim() ?? resolveTitle(target) ?? target.trim();
          replacements.push({
            type: "link",
            url: route,
            children: [{ type: "text", value: `[${label}]` }],
          });
        } else {
          const label = alias?.trim() ?? target.trim();
          replacements.push({ type: "text", value: `[${label}]` });
        }

        position = start + fullMatch.length;
      }

      if (position < node.value.length) {
        replacements.push({
          type: "text",
          value: node.value.slice(position),
        });
      }

      parent.children.splice(index, 1, ...replacements);
      return index + replacements.length;
    });
  };
}
