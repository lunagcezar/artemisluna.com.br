import { formatSegment } from "@lib/collections";

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

export type LabelPair = {
  en: string;
  pt: string;
};

export type TranslateLabel = (segment: string) => LabelPair;

export function createTranslateLabel(collection: string): TranslateLabel {
  return (segment: string) => ({
    en: formatSegment(segment),
    pt: ptSegmentLabels[`${collection}.${segment}`] ?? formatSegment(segment),
  });
}
