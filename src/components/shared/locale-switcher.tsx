import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@components/core/dropdown-menu";
import { SUPPORTED_LOCALES, applyLocale, getLocale } from "@i18n/labels";
import { setCookie } from "@lib/cookie";
import { Button } from "@components/core/button";

function LocaleSwitcher() {
  const [locale, setLocale] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLocale(getLocale("en"));
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" aria-label="Switch language">
          {locale ? (
            <span className="text-sm font-medium">{locale.toUpperCase()}</span>
          ) : (
            <span className="bg-muted flex h-6 w-8 animate-pulse rounded-lg" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LOCALES.map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => {
              setCookie("locale", code);
              applyLocale(code);
              window.dispatchEvent(new Event("localechange"));
              setLocale(code);
            }}
          >
            {code.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { LocaleSwitcher };
