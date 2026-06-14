import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@components/core/sidebar";
import { getActiveSegment } from "@lib/url";
import { BookIcon, PaintBrushBroadIcon } from "@phosphor-icons/react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    href: "/art",
    label: "Arte",
    icon: <PaintBrushBroadIcon weight="duotone" />,
  },
  { href: "/blog", label: "Blog", icon: <BookIcon weight="duotone" /> },
  { href: "/wiki", label: "Wiki", icon: <BookIcon weight="duotone" /> },
];

export function AppSidebar({ currentPath = "" }: { currentPath?: string }) {
  const activeSegment = getActiveSegment(currentPath);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="font-bold">Luna G. Cezar</SidebarHeader>
      <SidebarContent>
        {navItems.map((item) => {
          const isActive = item.href.replace("/", "") === activeSegment;
          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                isActive={isActive}
                asChild
                tooltip={item.label}
              >
                <a href={item.href} className="w-full">
                  {item.icon && <>{item.icon}</>}
                  {item.label}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}
