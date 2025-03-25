"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Ellipsis, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getMenuList } from "@/lib/menu-list";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CollapseMenuButton } from "@/components/admin-panel/collapse-menu-button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface MenuProps {
  isOpen: boolean | undefined;
}

export function Menu({ isOpen }: MenuProps) {
  const pathname = usePathname();
  const menuList = getMenuList(pathname);
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ word: string }[]>([]);

  // Query Datamuse API for rhymes whenever the query changes.
  useEffect(() => {
    if (query.trim().length > 0) {
      fetch(`https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => setResults(data))
        .catch((err) => console.error("Error fetching rhymes:", err));
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="mt-8 h-full w-full">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Pesquisar Rimas"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        {results.length > 0 && (
          <ul className="max-h-64 overflow-y-auto">
            {results.map((item) => (
              <li key={item.word} className="p-2 border-b hover:bg-gray-100">
                {item.word}
              </li>
            ))}
          </ul>
        )}
      </nav>
    </ScrollArea>
  );
}
