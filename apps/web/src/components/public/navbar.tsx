"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export const PublicNavbar = () => {
  return (
    <header className="w-full border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/public" className="font-mono text-lg font-bold">
          Die Pretty Mercédes
        </Link>

        <div>
          <nav className="flex space-x-4">
            <Link href="/public/concerts" className="hover:text-gray-600 dark:hover:text-gray-400">
              CONCERTOS
            </Link>

            <Link href="/public/singles" className="hover:text-gray-600 dark:hover:text-gray-400">
              MUSIC
            </Link>

            <Link href="/merch" className="hover:text-gray-600 dark:hover:text-gray-400">
              MERCH
            </Link>
            
            <Link href="/public" className="hover:text-gray-600 dark:hover:text-gray-400">
              PROGRESSO
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};

