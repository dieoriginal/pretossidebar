"use client";
import { Menu } from "@/components/admin-panel/menu";
import { SidebarToggle } from "@/components/admin-panel/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getSidebarItems } from "@/lib/processes-config";
import { AddProcessDialog } from "@/components/process-manager/AddProcessDialog";

// Use static import to avoid dev chunk loading timeouts

export function Sidebar() {
  const sidebar = useStore(useSidebar, (x) => x);
  const pathname = usePathname();
  const [refreshKey, setRefreshKey] = useState(0);

  // Listen for custom process changes
  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also listen to custom event for same-tab updates
    window.addEventListener('processAdded', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('processAdded', handleStorageChange);
    };
  }, []);

  const items = useMemo(() => getSidebarItems(), [refreshKey]);

  if (!sidebar) return null;
  const { isOpen, toggleOpen, getOpenState, setIsHover, settings } = sidebar;

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300 bg-background border-r",
        !getOpenState() ? "w-[90px]" : "w-96",
        settings.disabled && "hidden"
      )}
    >
      <SidebarToggle isOpen={isOpen} setIsOpen={toggleOpen} />
      <div
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800"
      >
        <TooltipProvider>
          <nav className="mt-2 space-y-4" role="navigation" aria-label="Admin sidebar">
            {items.map(({ label, href, section, icon: Icon }) => {
              const active = pathname?.startsWith(href);
              const content = (
                <Link
                  href={href}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 transition-all",
                    active ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-muted border border-transparent",
                    !getOpenState() ? "justify-center" : ""
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}/>
                  <div className={cn(
                    "flex flex-col",
                    !getOpenState() ? "hidden" : ""
                  )}>
                    <span className="text-sm font-medium leading-tight">{label}</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-60">{section}</span>
                  </div>
                </Link>
              );
              return (
                <div key={href}>
                  {getOpenState() ? (
                    content
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {content}
                      </TooltipTrigger>
                      <TooltipContent side="right">{label}</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              );
            })}
          </nav>
        </TooltipProvider>

        {/* Add New Process Button */}
        <div className={cn(
          "mt-auto pt-4 border-t",
          !getOpenState() && "flex justify-center"
        )}>
          <AddProcessDialog />
        </div>

        {/* <Menu isOpen={getOpenState()} /> */}
        
      </div>
    </aside>
  );
}