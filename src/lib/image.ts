export function getImageModules(basePath: string) {
  const string = basePath + "/**/*.{jpg,jpeg,png,webp,gif}";

  return import.meta.glob<{ default: ImageMetadata }>(string, { eager: true });
}
