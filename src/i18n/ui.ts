import { getLocale } from "./labels";

export const ui = {
  en: { light: "Light", dark: "Dark" },
  pt: { light: "Claro", dark: "Escuro" },
} as const;

export function t(key: keyof (typeof ui)["en"]): string {
  return ui[getLocale()][key];
}
