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
