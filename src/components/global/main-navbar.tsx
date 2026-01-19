"use client";

import Link from "next/link";
import { PanelsTopLeft, Music, LayoutGrid, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useRouter } from "next/navigation";
import { useProject } from "@/hooks/use-project";
import { createEmptyProject } from "@/hooks/use-project";
import { saveProjectToIndexedDB } from "@/lib/db";
import { TOTAL_STEPS } from "@/lib/steps";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import FeaturingManager from "@/components/FeaturingManager";

function UserNav() {
  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="#" alt="Avatar" />
                  <AvatarFallback className="bg-transparent">JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Perfil</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Diepretty Mercédes</p>
            <p className="text-xs leading-none text-muted-foreground">johndoe@example.com</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/obraeurudita" className="flex items-center">
              <LayoutGrid className="w-4 h-4 mr-3 text-muted-foreground" /> Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/custosfixos" className="flex items-center">
              <LayoutGrid className="w-4 h-4 mr-3 text-muted-foreground" /> Custos&nbsp;Fixos
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/account" className="flex items-center">
              <User className="w-4 h-4 mr-3 text-muted-foreground" /> Account
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="hover:cursor-pointer">
          <LogOut className="w-4 h-4 mr-3 text-muted-foreground" /> Sign&nbsp;out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MainNavbar() {
  const router = useRouter();
  const setProject = useProject((s) => s.setProject);
  const project = useProject((s) => s.project);
  const hasProject = !!project?.id;

  const createNewSingle = async () => {
    const id = `single-${Date.now()}`;
    const fresh = createEmptyProject(id);
    fresh.id = id;
    fresh.totalSteps = TOTAL_STEPS;
    await saveProjectToIndexedDB(fresh);
    setProject(fresh);
    router.push(`/obraeurudita`);
  };

  return (
    <header className="z-[50] sticky top-0 w-full bg-background/95 border-b backdrop-blur-sm dark:bg-black/[0.6] border-border/40 shadow-sm">
      <div className="container h-14 flex items-center">
        <Link
          href="/"
          className="flex justify-start items-center hover:opacity-85 transition-opacity duration-300 group"
        >
          <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors mr-3">
            <PanelsTopLeft className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            PRETOS MUSIC
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-3">
          <Button 
            onClick={createNewSingle} 
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <Music className="w-4 h-4 mr-2" />
            Novo Single
          </Button>
          {hasProject && (
            <>
              <div className="h-6 w-px bg-border" />
              <FeaturingManager />
            </>
          )}
          <ModeToggle />
          <UserNav />
        </nav>
      </div>
    </header>
  );
}



