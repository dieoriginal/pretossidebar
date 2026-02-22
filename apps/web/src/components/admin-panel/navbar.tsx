"use client"

import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/admin-panel/user-nav";
import Metronome from "./estrofes/metronome";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavbarProps {
  title: string;
}

/**
 * Slim navbar — brand/navigation + metronome + theme.
 * Audio player was moved to GlobalAudioPlayer (root layout).
 */
export function Navbar({ title }: NavbarProps) {
  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container mx-auto px-3 sm:px-6">
          <div className="flex h-12 items-center justify-between gap-4">
            {/* Left — Brand & Navigation */}
            <div className="flex items-center gap-3 min-w-0 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0">
                    <Link href="/">
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Voltar aos projetos</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-2 min-w-0">
                <div className="flex flex-col leading-none">
                  <h1 className="text-base font-bold tracking-tight text-foreground">PRETOS</h1>
                  <h2 className="text-[9px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">MUSIC</h2>
                </div>
                {title && (
                  <>
                    <Separator orientation="vertical" className="h-5" />
                    <p className="hidden sm:block text-xs font-medium text-muted-foreground truncate max-w-[180px]">{title}</p>
                  </>
                )}
              </div>
            </div>

            {/* Center — Metronome */}
            <div className="shrink-0">
              <Metronome />
            </div>

            {/* Right — Theme & User */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <ModeToggle />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Tema</TooltipContent>
              </Tooltip>
              <UserNav />
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
