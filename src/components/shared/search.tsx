import * as React from "react";
import lunr from "lunr";
import { Input } from "@components/core/input";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Badge } from "@components/core/badge";
import { cn } from "@lib/utils";
import { searchIndex, getLocale } from "@lib/search";
import type { SearchDoc } from "../../types/search";
import { COLLECTION_LABEL } from "@constants/collection";

function Search() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchDoc[]>([]);
  const [docs, setDocs] = React.useState<SearchDoc[]>([]);
  const [ready, setReady] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetch("/search.json")
      .then((r) => r.json())
      .then((data: SearchDoc[]) => {
        setDocs(data);
        setReady(true);
      });
  }, []);

  const idx = React.useMemo(() => {
    if (!docs.length) return null;
    return lunr(function () {
      this.pipeline.remove(lunr.stopWordFilter);
      this.searchPipeline.remove(lunr.stopWordFilter);

      this.ref("id");
      this.field("title", { boost: 10 });
      this.field("headings", { boost: 8 });
      this.field("description", { boost: 5 });
      this.field("tags", { boost: 3 });
      this.field("content");
      docs.forEach((doc) => this.add(doc));
    });
  }, [docs]);

  React.useEffect(() => {
    if (!query.trim() || !idx) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }
    try {
      const raw = searchIndex(idx, query);
      const locale = getLocale();
      const mapped = raw
        .map((r) => docs.find((d) => d.id === r.ref))
        .filter((d): d is SearchDoc => d !== undefined)
        .filter((d) => d.lang === locale)
        .slice(0, 12);
      setResults(mapped);
      setSelectedIndex(-1);
    } catch {
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [query, idx, docs]);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setQuery("");
      }
    };
    if (query.trim()) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [query]);

  const navigateTo = (doc: SearchDoc) => {
    setQuery("");
    window.location.href = doc.url;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) {
      if (e.key === "Escape") {
        setQuery("");
        inputRef.current?.blur();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          navigateTo(results[selectedIndex]);
        } else {
          navigateTo(results[0]);
        }
        break;
      case "Escape":
        setQuery("");
        inputRef.current?.blur();
        break;
    }
  };

  const showDropdown = query.trim().length > 0;

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <MagnifyingGlassIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={ready ? "Search..." : "Loading index..."}
          disabled={!ready}
          className="h-8 w-full rounded-lg pl-7 text-sm"
          role="combobox"
          aria-expanded={showDropdown}
          aria-activedescendant={
            selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined
          }
        />
      </div>

      {showDropdown && (
        <div
          className="bg-background/80 text-popover-foreground ring-foreground/10 absolute top-full right-0 z-50 mt-1 w-full overflow-hidden rounded-lg p-1 shadow-md ring-1 backdrop-blur-sm"
          role="listbox"
        >
          {results.length === 0 && (
            <p className="text-muted-foreground px-2 py-3 text-center text-xs">
              No results found.
            </p>
          )}
          {results.map((doc, i) => (
            <a
              key={doc.id}
              id={`search-result-${i}`}
              role="option"
              aria-selected={i === selectedIndex}
              href={doc.url}
              onClick={(e) => {
                e.preventDefault();
                navigateTo(doc);
              }}
              onMouseEnter={() => setSelectedIndex(i)}
              className={cn(
                "flex cursor-default items-center gap-1.5 rounded-md px-2 py-1.5 text-sm outline-hidden transition-colors select-none",
                i === selectedIndex && "bg-accent text-accent-foreground",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm leading-tight font-medium">
                    {doc.title}
                  </span>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {COLLECTION_LABEL[doc.collection] ?? doc.collection}
                  </Badge>
                </div>
                {doc.description && (
                  <span className="text-muted-foreground truncate text-xs">
                    {doc.description}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export { Search };
