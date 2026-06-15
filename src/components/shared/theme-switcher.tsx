import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@components/core/dropdown-menu";
import { cn } from "@lib/utils";
import { setCookie } from "@lib/cookie";
import { t } from "@i18n/labels";

type Theme = "light" | "dark";

function detectTheme(): Theme {
  const match = document.cookie.match(/(?:^|;\s*)theme=([^;]*)/);
  const saved = match?.[1];
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const detected = detectTheme();
    setTheme(detected);
    applyTheme(detected);
  }, []);

  function switchTheme(next: Theme) {
    setCookie("theme", next);
    setTheme(next);
    applyTheme(next);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex cursor-default items-center gap-1 rounded-md px-1.5 py-1 text-sm outline-hidden select-none",
          "focus:bg-accent focus:text-accent-foreground",
        )}
      >
        {theme === "dark" ? (
          <Moon className="size-4" />
        ) : (
          <Sun className="size-4" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className={cn(theme === "light" && "font-bold")}
          onClick={() => switchTheme("light")}
        >
          <Sun className="size-4" />
          {t("light")}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(theme === "dark" && "font-bold")}
          onClick={() => switchTheme("dark")}
        >
          <Moon className="size-4" />
          {t("dark")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
