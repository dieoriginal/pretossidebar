import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/admin-panel/user-nav";
import { SheetMenu } from "@/components/admin-panel/sheet-menu";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 h-[89px] w-[1256px] bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="mx-4 sm:mx-8 flex h-full items-center">
        <div className="flex items-center space-x-4 lg:space-x-0">
     

          <div className="border border-white border-thin h-[79px] w-[1088px] rounded-lg flex flex-row">
            
             <div className="border border-white border-thin h-[79px] w-[362px] rounded-lg"></div>
             <div className="border border-white border-thin h-[79px] w-[362px] rounded-lg"></div>
             <div className="border border-white border-thin h-[79px] w-[362px] rounded-lg"></div>

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
