"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getMerchantMenuList } from "@/lib/merchant-menu-list";
import {
    ChevronLeft,
    LogOut,
    Store,
    Menu as MenuIcon,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function MerchantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const pathname = usePathname();
    const menuList = getMerchantMenuList(pathname);

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen border-r bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out",
                    isSidebarOpen ? "w-64" : "w-16"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo Section */}
                    <div className="flex h-16 items-center justify-between px-4 border-b">
                        {isSidebarOpen && (
                            <div className="flex items-center gap-2 font-bold text-xl">
                                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white">
                                    <Store className="h-5 w-5" />
                                </div>
                                <span>Merchant</span>
                            </div>
                        )}
                        {!isSidebarOpen && (
                            <div className="mx-auto h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white">
                                <Store className="h-5 w-5" />
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden lg:flex"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <ChevronLeft className={cn("h-4 w-4 transition-transform", !isSidebarOpen && "rotate-180")} />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <ScrollArea className="flex-1 px-3 py-4">
                        <TooltipProvider delayDuration={0}>
                            <div className="space-y-4">
                                {menuList.map((group, index) => (
                                    <div key={index} className="space-y-1">
                                        {isSidebarOpen ? (
                                            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                                {group.groupLabel}
                                            </p>
                                        ) : (
                                            <div className="h-px bg-border my-4 mx-2" />
                                        )}
                                        {group.menus.map((menu, i) => (
                                            <div key={i}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link href={menu.href}>
                                                            <Button
                                                                variant={menu.active ? "secondary" : "ghost"}
                                                                className={cn(
                                                                    "w-full justify-start overflow-hidden transition-all",
                                                                    isSidebarOpen ? "h-10 px-3" : "h-10 w-10 p-0 justify-center mx-auto"
                                                                )}
                                                            >
                                                                {React.createElement(menu.icon, {
                                                                    className: cn("h-5 w-5", isSidebarOpen && "mr-3")
                                                                })}
                                                                {isSidebarOpen && <span>{menu.label}</span>}
                                                            </Button>
                                                        </Link>
                                                    </TooltipTrigger>
                                                    {!isSidebarOpen && (
                                                        <TooltipContent side="right">
                                                            {menu.label}
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </TooltipProvider>
                    </ScrollArea>

                    {/* Footer Section */}
                    <div className="p-3 border-t">
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10",
                                isSidebarOpen ? "px-3" : "justify-center p-0"
                            )}
                        >
                            <LogOut className={cn("h-5 w-5", isSidebarOpen && "mr-3")} />
                            {isSidebarOpen && <span>Log Out</span>}
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={cn(
                    "flex-1 transition-all duration-300",
                    isSidebarOpen ? "lg:ml-64" : "lg:ml-16"
                )}
            >
                <div className="h-full flex flex-col">
                    {children}
                </div>
            </main>
        </div>
    );
}
