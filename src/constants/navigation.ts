import { collections } from "../content.config";
import { formatSegment } from "../lib/collections";
import type { NavItem } from "../types/navigation";

export type { NavItem };

export const NAV_ITEMS: NavItem[] = Object.keys(collections).map((name) => ({
  href: `/${name}`,
  label: formatSegment(name),
}));
