import * as React from "react";
import lunr from "lunr";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@components/core/dropdown-menu";
import { Input } from "@components/core/input";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Badge } from "@components/core/badge";
import { Kbd } from "@components/core/kbd";
import { cn } from "@lib/utils";
import type { SearchDoc } from "../../types/search";
import { COLLECTION_LABEL } from "@constants/collection";
import { translations } from "@i18n/labels";
import { searchIndex } from "@lib/search";

function Search() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchDoc[]>([]);
  const [docs, setDocs] = React.useState<SearchDoc[]>([]);
  const [ready, setReady] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [locale, setLocale] = React.useState("en");
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

  React.useEffect(() => {
    function update() {
      const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
      setLocale(match?.[1] ?? "en");
    }
    update();
    window.addEventListener("localechange", update);
    return () => window.removeEventListener("localechange", update);
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const idx = React.useMemo(() => {
    if (!docs.length) return null;

    return lunr(function () {
      this.pipeline.remove(lunr.stopWordFilter);
      this.pipeline.remove(lunr.stemmer);
      this.searchPipeline.remove(lunr.stopWordFilter);
      this.searchPipeline.remove(lunr.stemmer);

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
      const mapped = raw
        .map((r) => ({ doc: docs.find((d) => d.id === r.ref), score: r.score }))
        .filter(
          (d): d is { doc: SearchDoc; score: number } => d.doc !== undefined,
        )
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if (!a.doc.date && !b.doc.date) return 0;
          if (!a.doc.date) return 1;
          if (!b.doc.date) return -1;
          return b.doc.date.localeCompare(a.doc.date);
        })
        .slice(0, 12)
        .map((s) => s.doc);
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

  const showDropdown = query.trim().length > 0 && (results.length > 0 || ready);
  const placeholder = translations[locale]?.search ?? "Search";

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

  return (
    <div ref={rootRef} className="relative max-sm:max-w-28">
      <DropdownMenu open={showDropdown} onOpenChange={() => {}}>
        <DropdownMenuTrigger asChild>
          <div className="relative cursor-text">
            <MagnifyingGlassIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation();
                handleKeyDown(e);
              }}
              placeholder={ready ? placeholder : "Loading index..."}
              className="h-8 w-full rounded-lg pr-8 pl-7 text-sm max-sm:placeholder:text-transparent"
              role="combobox"
              aria-expanded={showDropdown}
              aria-activedescendant={
                selectedIndex >= 0
                  ? `search-result-${selectedIndex}`
                  : undefined
              }
            />
            {!query && ready && (
              <Kbd className="absolute top-1/2 right-2 -translate-y-1/2 max-sm:hidden">
                <span className="text-[10px]">⌘K</span>
              </Kbd>
            )}
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={4}
          className="max-h-80 overflow-y-auto"
          onCloseAutoFocus={(e) => e.preventDefault()}
          onPointerDownOutside={() => setQuery("")}
          onEscapeKeyDown={() => setQuery("")}
          {...({ onOpenAutoFocus: (e: Event) => e.preventDefault() } as Record<
            string,
            (e: Event) => void
          >)}
        >
          {results.length === 0 && (
            <div className="text-muted-foreground px-2 py-3 text-center text-xs">
              No results found.
            </div>
          )}
          {results.map((doc, i) => (
            <DropdownMenuItem
              key={doc.id}
              id={`search-result-${i}`}
              onSelect={() => navigateTo(doc)}
              onMouseEnter={() => setSelectedIndex(i)}
              className={cn(
                "grid max-w-[calc(100vw-2rem)] cursor-pointer sm:max-w-md",
                i === selectedIndex && "bg-accent text-accent-foreground",
              )}
            >
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm leading-tight font-medium">
                    {doc.title}
                  </span>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {translations[locale]?.[doc.collection] ?? doc.collection}
                  </Badge>
                </div>
                {doc.description && (
                  <span className="text-muted-foreground block truncate text-xs">
                    {doc.description}
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export { Search };
