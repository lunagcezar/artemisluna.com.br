import type { ImageMetadata } from "astro";

export type ArtImageModules = Record<string, { default: ImageMetadata }>;

export function resolveArtImage(
  src: string,
  imageModules: ArtImageModules,
): string | ImageMetadata {
  if (!src.startsWith("/src/assets/art/")) return src;

  const mod = imageModules[src];
  return mod ? mod.default : src;
}
