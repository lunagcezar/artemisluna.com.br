export function getActiveSegment(pathname: string): string {
  const segments = pathname.replace(/^\/+|\/+$/g, "").split("/");
  return segments[0] ?? "";
}
