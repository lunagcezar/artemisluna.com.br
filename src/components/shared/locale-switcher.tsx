import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@components/core/dropdown-menu";
import { cn } from "@lib/utils";
import { getCookie, setCookie } from "@lib/cookie";

type Locale = "en" | "pt";

function detectLocale(): Locale {
  const saved = getCookie("locale");
  if (saved === "en" || saved === "pt") return saved;
  return navigator.language.startsWith("pt") ? "pt" : "en";
}

function applyLocale(locale: Locale): void {
  const attr = locale === "pt" ? "data-pt" : "data-en";
  document.querySelectorAll(`[${attr}]`).forEach((el) => {
    el.textContent = el.getAttribute(attr);
  });
}

export default function LocaleSwitcher() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const detected = detectLocale();
    setLocale(detected);
    applyLocale(detected);
  }, []);

  function switchLocale(next: Locale) {
    setCookie("locale", next);
    setLocale(next);
    applyLocale(next);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex cursor-default items-center gap-1 rounded-md px-1.5 py-1 text-sm outline-hidden select-none",
          "focus:bg-accent focus:text-accent-foreground",
        )}
      >
        {locale.toUpperCase()}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className={cn(locale === "en" && "font-bold")}
          onClick={() => switchLocale("en")}
        >
          EN
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(locale === "pt" && "font-bold")}
          onClick={() => switchLocale("pt")}
        >
          PT
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
