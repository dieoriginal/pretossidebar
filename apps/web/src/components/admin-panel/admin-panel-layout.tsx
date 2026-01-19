"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/admin-panel/footer";
import { Sidebar } from "@/components/admin-panel/sidebar";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";


export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebar = useStore(useSidebar, (x) => x);
  const pathname = usePathname();
  // Remove background for Events pages so the big component has no bg behind it
  const noBg = pathname?.startsWith("/events");
  if (!sidebar) return null;
  const { getOpenState, settings } = sidebar;
  return (
    <>
      <Sidebar />
      <main
        className={cn(
          "min-h-[calc(100vh_-_56px)] transition-[margin-left] ease-in-out duration-300 pb-16",
          noBg ? "bg-transparent dark:bg-transparent" : "bg-zinc-50 dark:bg-zinc-900",
          !settings.disabled && (!getOpenState() ? "lg:ml-[70px]" : "lg:ml-64")
        )}
      >
        
        {children}

     
      </main>
      <footer
        className={cn(
          "transition-[margin-left] ease-in-out duration-300 sticky bottom-0 z-20",
          !settings.disabled && (!getOpenState() ? "lg:ml-[90px]" : "lg:ml-72")
        )}
      >
        <Footer />
      </footer>
    </>
  );
}
