# Remark Wiki Links plugin

Resolves Foam-style wiki internal links (both `[[wikilinks]]` and markdown link references) across all content collections at build time. The routing table is built from all three content directories (`wiki`, `blog`, `art`), so any markdown file can link to any other page regardless of collection. Registered in `astro.config.mjs` via `markdown.processor` using `unified()` from `@astrojs/markdown-remark`.

## Module-level initialisation

When `src/lib/remark-wiki-links.ts` is first imported, the module immediately:

1. **Scans all content directories** — `loadAllEntries()` (line 27) walks `src/content/wiki/`, `src/content/blog/`, and `src/content/art/` recursively. For each `.md` file it reads frontmatter with `gray-matter` and produces `{ collection, id, title }` tuples. The `id` is the entry path relative to its collection root with the `.md` extension stripped (e.g. `wiki` → `linux/encryption/...`, `blog` → `20230315-turborepo-monorepo`).

2. **Builds three lookup maps** (lines 62–76):
   - `routeByFilename` — filename slug (last path segment) → `/<collection>/<id>/` URL. Both the bare slug and `slug.md` variants are stored so that `resolveRoute()` can match either form.
   - `routeByTitle` — frontmatter `title` (lowercased) → URL. Allows linking by page title as an alternative to slug.
   - `titleByFilename` — filename slug → frontmatter `title`. Used to produce display text for resolved links.

3. **Exposes two resolver functions** (lines 78–92):
   - `resolveRoute(text)` — normalises the input (trim + lowercase), checks `routeByFilename` first, then falls back to `routeByTitle`. If no match is found, it extracts the filename from the last path segment (handles relative paths like `../wiki/linux`) and retries the lookup.
   - `resolveTitle(text)` — same normalisation and fallback logic.

## Plugin function

`remarkWikiLinks()` (line 94) is a [unified/remark plugin](https://github.com/remarkjs/remark) factory. It returns a transformer that runs on every markdown file processed by Astro's content pipeline. There is no early-return guard — all collections (blog, wiki, art) can use cross-linking syntax.

---

## Section 1 — Definition URL rewriting (lines 98–102)

**What it handles:** Link-reference definitions produced by the Foam VSCode extension, e.g.:

```markdown
[encrypt-second-drive-when-the-first-is-encrypted-with-tpm]: encrypt-second-drive-when-the-first-is-encrypted-with-tpm "Encrypt second drive when the first is encrypted with TPM"
```

**Transformation:** Visits every `definition` node in the AST. If `node.url` matches a known wiki page (resolved via `resolveRoute`), it rewrites the URL from the raw filename slug to the canonical `/wiki/<id>/` path.

This is necessary because the raw URL would otherwise point to a non-existent relative path from the current file's location.

**Before:**

```
node.url = "encrypt-second-drive-when-the-first-is-encrypted-with-tpm"
```

**After:**

```
node.url = "/wiki/linux/encryption/encrypt-second-drive-when-the-first-is-encrypted-with-tpm/"
```

---

## Section 2 — Link reference conversion (lines 104–136)

**What it handles:** The common Foam output case. When you write `[[target]]` in VSCode, the Foam extension converts it to standard markdown link-reference syntax:

```markdown
[target]: target "Title"

...
[target]
```

The remark parser sees `[[target]]` as three sibling nodes:

```
Text:        "["
LinkReference: { identifier: "target", children: [Text: "target"] }
Text:        "]"
```

**Transformation:**

1. **Route resolution** — if `resolveRoute(identifier)` returns undefined, the handler skips (the page doesn't exist yet, or the target isn't in the wiki).

2. **Type mutation** — the node is recast from `LinkReference` → `Link`. The `identifier` and `referenceType` properties are deleted so downstream rehype processors treat it as a plain anchor tag.

3. **Link text** — `linkNode.children` is replaced with a single text node containing `[${title}]`:
   - If `resolveTitle()` finds a frontmatter title, it uses it (e.g. `[Encrypt second drive when the first is encrypted with TPM]`).
   - Falls back to the identifier/slug (e.g. `[encrypt-second-drive-when-the-first-is-encrypted-with-tpm]`).

4. **Bracket stripping** — the surrounding `[` and `]` text nodes (leftovers from Foam's syntax conversion) are trimmed by removing the last `[` from the previous sibling and the first `]` from the next sibling. Since brackets are now part of our link text, removing the outer ones avoids double brackets.

**Edge case:** If the previous text node is just `[`, it becomes empty after slicing. This is harmless — empty text nodes are dropped during serialisation.

---

## Section 3 — Raw `[[wikilink]]` syntax (lines 138–187)

**What it handles:** Any `[[target]]` or `[[target|alias]]` patterns that Foam didn't pre-process. This catches manually-written wikilinks or files that haven't been touched by Foam yet.

**Transformation:**

1. **Regex matching** — visits every `text` node and collects all matches of `/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g`. The first capture group is the `target`, the optional second is the `alias`.

2. **Splitting** — the text node is split into a sequence of `PhrasingContent` items (text + link alternation). Text before the first match, between matches, and after the last match is preserved as-is.

3. **Resolved links** — when `resolveRoute(target)` finds a wiki page:
   - If an `alias` is provided (`[[target|alias]]`), the link text is `[alias]`.
   - Otherwise, the frontmatter `title` is used via `resolveTitle(target)`.
   - Final fallback is the raw `target`.  
     All resolved links are wrapped in `[...]`.

4. **Unresolved links** — when the target doesn't match any wiki page, the text is still rendered as `[target]` (or `[alias]`) to visually mark it as a dead backlink.

**Why both section 2 and 3?** Foam converts `[[target]]` to `[target]` + a definition, so section 2 handles the standard markdown AST. But if Foam hasn't processed a file (e.g. new content written outside VSCode, or the Foam extension isn't loaded), section 3 catches the raw `[[...]]` syntax directly.

---

## The rendering chain for `[[target]]`

Taking the example from the codebase:

```markdown
If you are upgrading Ubuntu from version 24.04 to 24.10 and used the
[[encrypt-second-drive-when-the-first-is-encrypted-with-tpm]] guide...
```

**1. Remark parser** — sees `[[encrypt-second-drive-when-the-first-is-encrypted-with-tpm]]` and, because the file also contains a matching definition on its last line (`[encrypt-second-drive...]: encrypt-second-drive... "Encrypt second drive..."`), produces:

```
paragraph: [
  text: "If you are upgrading... and used the ",
  text: "[",
  linkReference: { identifier: "encrypt-second-drive-when-the-first-is-encrypted-with-tpm" },
  text: "]",
  text: " guide, you'll probably notice..."
]
```

**2. Section 2 runs** — finds the `linkReference`, looks up the route and title, mutates it to a `link`, sets `children` to `[{ text: "[Encrypt second drive when the first is encrypted with TPM]" }]`, strips the surrounding `[`/`]`.

**Resulting AST:**

```
paragraph: [
  text: "If you are upgrading... and used the ",
  link: { url: "/wiki/linux/encryption/encrypt-second-drive-when-the-first-is-encrypted-with-tpm/",
          children: [{ text: "[Encrypt second drive when the first is encrypted with TPM]" }] },
  text: " guide, you'll probably notice..."
]
```

**3. Rehype/HTML output:**

```html
<p>
  If you are upgrading... and used the
  <a
    href="/wiki/linux/encryption/encrypt-second-drive-when-the-first-is-encrypted-with-tpm/"
  >
    [Encrypt second drive when the first is encrypted with TPM]
  </a>
  guide, you'll probably notice...
</p>
```

## Configuration reference

```js
// astro.config.mjs
import { unified } from "@astrojs/markdown-remark";
import remarkWikiLinks from "./src/lib/remark-wiki-links.ts";

export default defineConfig({
  markdown: {
    processor: unified({
      remarkPlugins: [remarkWikiLinks],
    }),
  },
});
```

The `processor` key is the Astro v6 API for providing a custom markdown processor. The `unified()` function from `@astrojs/markdown-remark` creates a processor object that Astro's content pipeline uses to render markdown.

## Dependencies

| Package                    | Purpose                                         |
| -------------------------- | ----------------------------------------------- |
| `unist-util-visit`         | Walk the mdast syntax tree and match node types |
| `gray-matter`              | Parse YAML frontmatter from `.md` files         |
| `mdast` (types)            | TypeScript types for the markdown AST           |
| `@astrojs/markdown-remark` | Provides the `unified()` helper for Astro v6    |
