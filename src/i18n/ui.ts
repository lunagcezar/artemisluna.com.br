export const ui = {
  en: { light: "Light", dark: "Dark" },
  pt: { light: "Claro", dark: "Escuro" },
} as const;

export type Locale = keyof typeof ui;

export function getLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
  const saved = match?.[1] as Locale | undefined;
  if (saved === "en" || saved === "pt") return saved;
  return navigator.language.startsWith("pt") ? "pt" : "en";
}

export function t(key: keyof (typeof ui)["en"]): string {
  return ui[getLocale()][key];
}
