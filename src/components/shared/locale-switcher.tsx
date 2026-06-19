import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@components/core/dropdown-menu";
import { Button } from "@components/core/button";
import { SUPPORTED_LOCALES, applyLocale } from "@i18n/labels";
import { setCookie } from "@lib/cookie";

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

function LocaleSwitcher() {
  const locale = useLocale();

  const selectLocale = (code: string) => {
    setCookie("locale", code);
    applyLocale(code);
    window.dispatchEvent(new Event("localechange"));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" aria-label="Switch language">
          <span className="text-sm font-medium">{locale.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LOCALES.map((code) => (
          <DropdownMenuItem key={code} onClick={() => selectLocale(code)}>
            {code.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { LocaleSwitcher };
