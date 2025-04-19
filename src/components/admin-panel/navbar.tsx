"use client"

import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/admin-panel/user-nav";
import { SheetMenu } from "@/components/admin-panel/sheet-menu";
import Player from "../madzadev/player";
import ControlRoomSidebar from "../control-room-sider";
import Metronome from "./estrofes/metronome";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 h-[89px] w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="mx-4 sm:mx-8 flex items-center justify-between">
        <div id="borda-esquerda" className="border border-transparent h-[59px] w-[141px] rounded-lg">
          <div id="borda-titulo" className="border border-transparent h-[39px] w-[121px] rounded-lg ml-18 mt-2.5">
            <div className="items-center ml-8">
              <h1 className="font-extrabold font-arial text-3xl tracking-tighter -m-1 italic">PRETOS
                <h1 className="text-lg -mt-4 italic tracking-widest">MUSIC</h1>
              </h1>
            </div>
          </div>    
        </div>

        <div className="flex items-center flex-1 justify-center">
          <div id="borda-principal" className="border border-black dark:border-white h-[89px] w-full max-w-[1556px] rounded-lg flex">
            <div id="borda-lateral" className="border border-black dark:border-white h-[89px] w-[2962px] rounded-lg" />

            
            
            <div id="borda-central" className="border border-black dark:border-white h-[89px] flex-1 rounded-lg">
              <div id="borda-interna" className="border border-black dark:border-white h-[42px] w-[355px] rounded-lg mx-auto mt-4 flex">
                <div id="borda-sub-1" className="border border-black dark:border-white h-[42px] w-[118px] rounded-lg flex">
                  <div id="borda-sub-palavra-1" className="border border-black dark:border-white h-[42px] w-[59px] rounded-lg" />
                  <div id="borda-sub-palavra-2" className="border border-black dark:border-white h-[42px] w-[59px] rounded-lg" />
                </div>
                <div id="borda-sub-3" className="border border-black dark:border-white h-[42px] w-[118px] rounded-lg" />
                <div id="borda-sub-4" className="border border-black dark:border-white h-[42px] w-[118px] rounded-lg flex">
                  <div id="borda-sub-palavra-3" className="border border-black dark:border-white h-[42px] w-[59px] rounded-lg" />
                  <div id="borda-sub-palavra-4" className="border border-red-500 dark:border-white h-[42px] w-[59px] rounded-lg" />
                </div>
              </div>
              <div id="borda-inferior" className="border border-black dark:border-white h-[12px] w-[355px] rounded-lg mx-auto mt-1" />
            </div>

            <div id="borda-lateral-direita" className="border border-black dark:border-white h-[89px] w-[2962px] rounded-lg flex items-center justify-center">
              <div className="w-full px-4">
                <Metronome />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
