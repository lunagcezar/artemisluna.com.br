export const SUPPORTED_LOCALES = ["en", "pt"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const translations: Record<string, Record<string, string>> = {
  en: {
    home: "Home",
    search: "Search",
    resume: "Resume",
    light: "Light",
    dark: "Dark",
    previous: "Previous",
    next: "Next",
    more: "More",
  },
  pt: {
    home: "Início",
    search: "Pesquisar",
    previous: "Anterior",
    next: "Próxima",
    more: "Mais",
    art: "Arte",
    traditional: "Tradicional",
    digital: "Digital",
    "digital-painting": "Pintura digital",
    "urban-sketching": "Esboço urbano",
    "fictional-cityscapes": "Paisagens fictícias",
    "mixed-media": "Mídia mista",
    other: "Outro",
    "ui-design": "Design de UI",
    illustration: "Ilustração",
    painting: "Pintura",
    drawing: "Desenho",
    gouache: "Guache",
    "oil-pastel": "Pastel de óleo",
    ink: "Tinta",
    pencil: "Lápis",
    cityscape: "Paisagem urbana",
    encryption: "Criptografia",
    networking: "Redes",
    programming: "Programação",
    resume: "Currículo",
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

export function createTranslateLabel(): TranslateLabel {
  return (segment: string) => {
    const labels: Record<string, string> = {};
    for (const locale of SUPPORTED_LOCALES) {
      labels[locale] =
        locale === "en"
          ? formatSegment(segment)
          : (translations[locale]?.[segment] ?? formatSegment(segment));
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
  document.querySelectorAll("[data-locale-value]").forEach((el) => {
    el.textContent = locale.toUpperCase();
  });
  document.querySelectorAll("[data-content-locale]").forEach((el) => {
    if (el.getAttribute("data-content-locale") !== locale) {
      el.setAttribute("hidden", "");
    } else {
      el.removeAttribute("hidden");
    }
  });
}

export function t(key: string): string {
  return translations[getLocale()]?.[key] ?? translations.en?.[key] ?? key;
}
