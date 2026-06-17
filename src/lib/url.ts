export function getActiveSegment(pathname: string): string {
  const segments = pathname.replace(/^\/+|\/+$/g, "").split("/");
  return segments[0] ?? "";
}

export function getChildUrl(baseUrl: string, child: string): string {
  return `${baseUrl}${child}/`;
}

export function getPageUrl(baseUrl: string, page: number): string {
  if (page === 1) return baseUrl;
  return `${baseUrl}page/${page}/`;
}

export function getSiteRoot(): string {
  return import.meta.env.SITE
    ? (import.meta.env.SITE as string).replace(/\/+$/, "")
    : "";
}

export function getCanonicalUrl(currentPath: string): string {
  const root = getSiteRoot();
  return root ? `${root}${currentPath}` : currentPath;
}

export function getOgImageUrl(image: string | undefined): string | undefined {
  if (!image) return undefined;
  const root = getSiteRoot();
  if (image.startsWith("http")) return image;
  if (image.startsWith("/") && root) return `${root}${image}`;
  return undefined;
}
