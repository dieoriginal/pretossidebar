"use client";

import { Sidebar } from "@/components/admin-panel/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";

interface AppShellProps {
    children: React.ReactNode;
    /** Page title shown in the mobile top bar */
    title?: string;
    /** Whether to show the sidebar (default: true) */
    showSidebar?: boolean;
    /** Extra className for the content area */
    className?: string;
    /** Whether to constrain content width (default: true) */
    contained?: boolean;
}

/**
 * AppShell — unified layout wrapper for all authenticated pages.
 *
 * Desktop: sidebar (from Sidebar component) + content area with left margin
 * Mobile:  slim top bar with page title + full-width content
 *
 * Replaces the old pattern of:
 *   <div className="pl-0 lg:pl-96">
 *     <Sidebar />
 *     <main>...</main>
 *   </div>
 */
export function AppShell({
    children,
    title,
    showSidebar = true,
    className,
    contained = true,
}: AppShellProps) {
    const sidebar = useStore(useSidebar, (x) => x);
    const isExpanded = sidebar?.getOpenState() ?? true;

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar — handles its own mobile/desktop rendering */}
            {showSidebar && <Sidebar />}

            {/* Content area */}
            <div
                className={cn(
                    "flex-1 flex flex-col min-h-screen w-full transition-[margin] duration-300 ease-in-out",
                    showSidebar && (isExpanded ? "lg:ml-96" : "lg:ml-[90px]"),
                )}
            >
                {/* Mobile top bar — only shown on small screens */}
                <header className="sticky top-0 z-30 flex items-center justify-between h-12 px-4 border-b bg-background/95 backdrop-blur-sm lg:hidden">
                    {/* Left side: hamburger is rendered by Sidebar's Sheet trigger */}
                    <div className="ml-12">
                        {title && (
                            <h1 className="text-sm font-semibold text-foreground truncate">
                                {title}
                            </h1>
                        )}
                    </div>
                    <ModeToggle />
                </header>

                {/* Desktop subtle top bar */}
                <header className="hidden lg:flex items-center justify-end h-10 px-6 border-b bg-background/50">
                    <ModeToggle />
                </header>

                {/* Main content */}
                <main
                    className={cn(
                        "flex-1",
                        contained && "container mx-auto",
                        "px-4 py-6 lg:px-8 lg:py-8",
                        className,
                    )}
                >
                    {children}
                </main>

                {/* Footer */}
                <footer className="border-t py-4 px-6 text-center">
                    <p className="text-xs text-muted-foreground">
                        © PRETOS MUSIC 2025
                    </p>
                </footer>
            </div>
        </div>
    );
}
