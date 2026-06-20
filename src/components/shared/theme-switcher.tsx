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

function ThemeSwitcher() {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setReady(true);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" aria-label="Toggle theme">
          {ready ? (
            <>
              <SunIcon className="size-4 dark:hidden" />
              <MoonIcon className="hidden size-4 dark:block" />
            </>
          ) : (
            <span className="bg-muted flex h-6 w-8 animate-pulse rounded-lg" />
          )}
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
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setCookie("theme", "dark");
            document.documentElement.classList.add("dark");
          }}
        >
          <MoonIcon className="size-4" />
          Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ThemeSwitcher };
