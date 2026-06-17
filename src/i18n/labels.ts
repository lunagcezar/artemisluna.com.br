export const SUPPORTED_LOCALES = ["en", "pt"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const translations: Record<string, Record<string, string>> = {
  en: {
    light: "Light",
    dark: "Dark",
  },
  pt: {
    home: "Início",
    art: "Arte",
    "art.traditional": "Tradicional",
    "art.digital": "Digital",
    "art.painting": "Pintura",
    "art.drawing": "Desenho",
    "art.gouache": "Guache",
    "art.oil-pastel": "Pastel de óleo",
    "art.digital-painting": "Pintura digital",
    "art.urban-sketching": "Esboço urbano",
    "art.fictional-cityscapes": "Paisagens fictícias",
    "art.ink": "Tinta",
    "art.pencil": "Lápis",
    "art.mixed-media": "Mídia mista",
    "art.other": "Outro",
    "art.ui-design": "Design de UI",
    "art.illustration": "Ilustração",
    "wiki.encryption": "Criptografia",
    "wiki.networking": "Redes",
    "wiki.programming": "Programação",
    light: "Claro",
    dark: "Escuro",
  },
};

function formatSegment(segment: string): string {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export type TranslateLabel = (segment: string) => Record<string, string>;

export function createTranslateLabel(collection: string): TranslateLabel {
  return (segment: string) => {
    const labels: Record<string, string> = {};
    for (const locale of SUPPORTED_LOCALES) {
      const key = `${collection}.${segment}`;
      labels[locale] =
        locale === "en"
          ? formatSegment(segment)
          : (translations[locale]?.[key] ?? formatSegment(segment));
    }
    return labels;
  };
}

export function getCookieLocale(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
  return match?.[1];
}

export function getLocale(fallback: string = "en"): string {
  const saved = getCookieLocale();
  if (saved) return saved;
  if (typeof navigator === "undefined") return fallback;
  const lang = navigator.language.slice(0, 2);
  return lang;
}

export function applyLocale(locale: string): void {
  document.documentElement.lang = locale;
  document.querySelectorAll("[data-locales]").forEach((el) => {
    try {
      const labels = JSON.parse(el.getAttribute("data-locales") ?? "{}");
      if (labels[locale]) el.textContent = labels[locale];
    } catch {
      /* ignore parse errors */
    }
  });
}

export function t(key: string): string {
  return translations[getLocale()]?.[key] ?? translations.en?.[key] ?? key;
}
