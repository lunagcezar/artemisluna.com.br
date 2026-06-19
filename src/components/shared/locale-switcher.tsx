import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@components/core/dropdown-menu";
import { SUPPORTED_LOCALES, applyLocale } from "@i18n/labels";
import { setCookie } from "@lib/cookie";
import { Button } from "@components/core/button";

function LocaleSwitcher() {
  const [locale, setLocale] = React.useState<string | null>(null);

  React.useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
    setLocale(match?.[1] ?? "en");
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" aria-label="Switch language">
          {locale ? (
            <span className="text-sm font-medium">{locale.toUpperCase()}</span>
          ) : (
            <span className="bg-muted inline-block h-4 w-8 animate-pulse rounded" />
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
