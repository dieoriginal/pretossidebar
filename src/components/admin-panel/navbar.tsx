"use client"

import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/admin-panel/user-nav";
import { SheetMenu } from "@/components/admin-panel/sheet-menu";
import Player from "../madzadev/player";
import ControlRoomSidebar from "../control-room-sider";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 h-[89px] w-[1430px] bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="mx-4 sm:mx-8 flex items-center">

        <div className="border border-transparent border-thin h-[59px] w-[141px] rounded-lg ml-9 mr-10">

        <div className="border border-transparent h-[39px] w-[121px] rounded-lg ml-2 mt-2.5 items-center flex-col">
          
          <div>
            <div className="items-center">
              <h1 className="font-extrabold font-arial text-3xl tracking-tighter -m-1 italic">PRETOS
                <h1 className="text-lg -mt-4 italic  tracking-widest">MUSIC</h1>
              </h1>
            </div>
          
          </div> 
        </div>    

        </div>

        <div className="flex items-center space-x-4 lg:space-x-0">
     

          <div className="border border-black dark:border-dark-500 dark:border-white border-thin h-[89px] w-[1056px] rounded-lg flex flex-row ml-55">

            

              <div className="border border-black dark:border-dark-500 dark:border-white border-thin h-[89px] w-[362px] rounded-lg flex flex-row">

                   <div className="border border-black dark:border-dark-500 dark:border-white border-thin h-[89px] w-[151px] rounded-lg ">

                  </div>

                  <div className="border border-black dark:border-dark-500 dark:border-white border-thin h-[89px] w-[151px] rounded-lg ">

                  </div>

             </div>

             <div className="border border-black dark:border-dark-500 dark:border-white border-thin h-[89px] w-[582px] rounded-lg">

              <div className="border border-black dark:border-dark-500 dark:border-white border-thin h-[42px] w-[355px] rounded-lg ml-11 mt-4 flex flex-row">

                <div className="border border-black dark:border-dark-500 dark:border-white border-thin h-[42px] w-[118px] rounded-lg flex flex-row ">

                 <div className="border border-black dark:border-dark-500 dark:border-white border-thin h-[42px] w-[59px] rounded-lg ">

                  </div>

                  <div className="border border-black dark:border-dark-500 dark:border-white border-thin h-[42px] w-[59px] rounded-lg ">

                  </div>

                </div>

                <div className="border border-black dark:border-dark-500 dark:border-white border-thin h-[42px] w-[118px] rounded-lg ">

                </div>

                <div className="border border-black dark:border-dark-500 dark:border-white border-thin h-[42px] w-[118px] rounded-lg flex flex-row  ">

                  <div className="border border-black dark:border-dark-500 dark:border-white border-thin h-[42px] w-[59px] rounded-lg ">

                 </div>

                 <div className="border border-black dark:border-dark-500 dark:border-white border-thin h-[42px] w-[59px] rounded-lg ">

                  </div>

                </div>

              </div>

              <div className="border border-black dark:border-white border-thin h-[12px] w-[355px] rounded-lg ml-11 mt-1">

              </div>

             

             </div>




             <div className="border border-black dark:border-white border-thin h-[89px] w-[362px] rounded-lg flex flex-row">

             <div className="border border-black dark:border-white border-thin h-[89px] w-[151px] rounded-lg ">

</div>
                <div className="border border-black dark:border-white border-thin h-[89px] w-[151px] rounded-lg ">

</div>



             </div>

          </div>

          

          
     
        </div>
        <div className="flex flex-1 items-center justify-end">
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
