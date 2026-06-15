export const SUPPORTED_LOCALES = ["en", "pt"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const ptLabels: Record<string, string> = {
  art: "Arte",
};

export const ptSegmentLabels: Record<string, string> = {
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
      labels[locale] =
        locale === "en"
          ? formatSegment(segment)
          : (ptSegmentLabels[`${collection}.${segment}`] ??
            formatSegment(segment));
    }
    return labels;
  };
}

export function getLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
  const saved = match?.[1] as Locale | undefined;
  if (saved === "en" || saved === "pt") return saved;
  return navigator.language.startsWith("pt") ? "pt" : "en";
}

export function applyLocale(locale: Locale): void {
  document.querySelectorAll("[data-locales]").forEach((el) => {
    try {
      const labels = JSON.parse(el.getAttribute("data-locales") ?? "{}");
      if (labels[locale]) el.textContent = labels[locale];
    } catch {
      /* ignore parse errors */
    }
  });
}
