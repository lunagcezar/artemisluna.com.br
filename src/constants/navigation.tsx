import { PaintBrushBroadIcon, BookIcon } from "@phosphor-icons/react";
import type { NavItem } from "../types/navigation";

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/art",
    label: "Arte",
    icon: <PaintBrushBroadIcon weight="duotone" />,
  },
  { href: "/blog", label: "Blog", icon: <BookIcon weight="duotone" /> },
  { href: "/wiki", label: "Wiki", icon: <BookIcon weight="duotone" /> },
];
