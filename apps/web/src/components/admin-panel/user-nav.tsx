"use client";

import Link from "next/link";
import { LayoutGrid, LogOut, User, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/hooks/use-sidebar";

export function UserNav() {
  const sidebar = useSidebar();
  const { settings, setSettings } = sidebar || { settings: { disabled: false, isHoverOpen: true }, setSettings: () => {} };

  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative h-8 w-8 rounded-full"
              >
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

      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Diepretty Mercédes</p>
            <p className="text-xs leading-none text-muted-foreground">
              johndoe@example.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/obraeurudita" className="flex items-center">
              <LayoutGrid className="w-4 h-4 mr-3 text-muted-foreground" />
              Dashboard
            </Link>
          </DropdownMenuItem>
            <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/custosfixos" className="flex items-center">
              <LayoutGrid className="w-4 h-4 mr-3 text-muted-foreground" />
              Custos Fixos
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/account" className="flex items-center">
              <User className="w-4 h-4 mr-3 text-muted-foreground" />
              Account
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span>Configurações</span>
        </DropdownMenuLabel>
        <div className="px-2 py-1.5 space-y-3">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="disable-sidebar" className="text-sm font-normal cursor-pointer">
              Desativar Sidebar
            </Label>
            <Switch
              id="disable-sidebar"
              checked={settings.disabled}
              onCheckedChange={(x) => setSettings({ disabled: x })}
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="is-hover-open" className="text-sm font-normal cursor-pointer">
              Abertura Sutil
            </Label>
            <Switch
              id="is-hover-open"
              checked={true}
              disabled={true}
              className="opacity-50"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Abertura Sutil está sempre ativada
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="hover:cursor-pointer" onClick={() => {}}>
          <LogOut className="w-4 h-4 mr-3 text-muted-foreground" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
