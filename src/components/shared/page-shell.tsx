import { SidebarProvider } from "@components/core/sidebar";
import { TooltipProvider } from "@components/core/tooltip";
import { AppSidebar } from "@components/shared/app-sidebar";
import { useState } from "react";

export function PageShell({
  currentPath,
  children,
}: {
  currentPath?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <TooltipProvider>
      <SidebarProvider open={open} onOpenChange={setOpen}>
        <AppSidebar currentPath={currentPath} />
        <main>{children}</main>
      </SidebarProvider>
    </TooltipProvider>
  );
}
