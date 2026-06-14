import { PaintBrushBroadIcon, BookIcon } from "@phosphor-icons/react";
import type { NavItem } from "../types/navigation";

export const NAV_ITEMS: NavItem[] = [
  { href: "/art", label: "Arte", icon: PaintBrushBroadIcon },
  { href: "/blog", label: "Blog", icon: BookIcon },
  { href: "/wiki", label: "Wiki", icon: BookIcon },
];
