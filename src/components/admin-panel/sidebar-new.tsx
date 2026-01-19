"use client";

import { useMemo, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar as useShadcnSidebar,
} from "@/components/ui/sidebar";
import { getSidebarItemsGrouped } from "@/lib/processes-config";
import { AddProcessDialog } from "@/components/process-manager/AddProcessDialog";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

function AppSidebarContent() {
  const pathname = usePathname();
  const [refreshKey, setRefreshKey] = useState(0);
  const { state } = useShadcnSidebar();
  const isCollapsed = state === "collapsed";

  // Listen for custom process changes
  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('processAdded', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('processAdded', handleStorageChange);
    };
  }, []);

  const groupedItems = useMemo(() => getSidebarItemsGrouped(), [refreshKey]);

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          {!isCollapsed && (
            <h2 className="text-lg font-semibold">PRETOS MUSIC</h2>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {Object.entries(groupedItems).map(([groupName, groupItems]) => (
          <SidebarGroup key={groupName}>
            {!isCollapsed && (
              <SidebarGroupLabel className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {groupName}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {groupItems.map(({ label, href, section, icon: Icon }) => {
                  const active = pathname?.startsWith(href);
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link href={href}>
                          <Icon className="h-4 w-4" />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-medium leading-tight truncate">{label}</span>
                            {!isCollapsed && (
                              <span className="text-[10px] uppercase tracking-wider opacity-60 truncate">{section}</span>
                            )}
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t px-3 py-2">
        <AddProcessDialog />
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppSidebar() {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;
  const { settings } = sidebar;
  if (settings.disabled) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebarContent />
    </SidebarProvider>
  );
}




