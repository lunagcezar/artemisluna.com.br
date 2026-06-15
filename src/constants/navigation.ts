import { collections } from "../content.config";
import { formatSegment } from "../lib/collections";

export type { NavItem } from "../types/navigation";

export const NAV_ITEMS: NavItem[] = Object.keys(collections).map((name) => ({
  href: `/${name}`,
  label: formatSegment(name),
}));
