import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@components/core/dropdown-menu";
import { Button } from "@components/core/button";
import { SunIcon, MoonIcon } from "@phosphor-icons/react";
import { setCookie } from "@lib/cookie";
import { translations } from "@i18n/labels";

function useLocale(): string {
  const [locale, setLocale] = React.useState("en");
  React.useEffect(() => {
    function update() {
      const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
      setLocale(match?.[1] ?? "en");
    }
    update();
    window.addEventListener("localechange", update);
    return () => window.removeEventListener("localechange", update);
  }, []);
  return locale;
}

function ThemeSwitcher() {
  const locale = useLocale();

  const t = (key: string) =>
    translations[locale]?.[key] ?? translations.en?.[key] ?? key;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" aria-label="Toggle theme">
          <SunIcon className="size-4 dark:hidden" />
          <MoonIcon className="hidden size-4 dark:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            setCookie("theme", "light");
            document.documentElement.classList.remove("dark");
          }}
        >
          <SunIcon className="size-4" />
          {t("light")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setCookie("theme", "dark");
            document.documentElement.classList.add("dark");
          }}
        >
          <MoonIcon className="size-4" />
          {t("dark")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ThemeSwitcher };
