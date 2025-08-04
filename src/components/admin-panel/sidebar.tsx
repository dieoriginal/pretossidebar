"use client";
import { Menu } from "@/components/admin-panel/menu";
import { SidebarToggle } from "@/components/admin-panel/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import { PanelsTopLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Sidebar() {
  const [filter, setFilter] = useState('');
  const [results, setResults] = useState<{syllable: string, count: number, words: string[]}[]>([]);
  
  const sidebar = useStore(useSidebar, (x) => x);
  
  // Agora podemos fazer a verificação condicional
  if (!sidebar) return null;
  const { isOpen, toggleOpen, getOpenState, setIsHover, settings } = sidebar;
  
  // Função para filtrar palavras
  const filterWords = (letter: string) => {
    // Aqui você implementaria a lógica para buscar as palavras
    // Exemplo de dados mockados:
    const mockData = [
      {syllable: 'sa', count: 15, words: ['saber', 'saco', 'sagaz']},
      {syllable: 'se', count: 8, words: ['selva', 'seda', 'seguro']},
      {syllable: 'si', count: 5, words: ['sinal', 'sino']},
    ];
    setResults(mockData);
  };

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        !getOpenState() ? "w-[90px]" : "w-96",
        settings.disabled && "hidden"
      )}
    >
      <SidebarToggle isOpen={isOpen} setIsOpen={toggleOpen} />

      <div
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800"
      >
        {/* Novo campo de filtro */}
        <div className="mb-4">
          <input
            type="text"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              filterWords(e.target.value);
            }}
            placeholder="Filtrar por letra..."
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Exibição dos resultados */}
        {results.map((result, index) => (
          <div
            key={index}
            className={cn(
              "mb-2 p-2 border rounded transition-all duration-300",
              result.words.length > 0 ? "h-auto" : "h-10"
            )}
          >
            <div className="font-bold">
              {result.syllable} ({result.count})
            </div>
            {result.words.length > 0 && (
              <div className="mt-2">
                {result.words.map((word, i) => (
                  <span key={i} className="mr-2">
                    {word}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        <Button
          className={cn(
            "transition-transform ease-in-out duration-300 mb-1",
            !getOpenState() ? "translate-x-1" : "translate-x-0"
          )}
          variant="link"
          asChild
        >
          <Link href="/obraeurudita" className="flex items-center gap-2">
            <PanelsTopLeft className="w-6 h-6 mr-1" />
            <h1
              className={cn(
                "font-bold text-lg whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300",
                !getOpenState()
                  ? "-translate-x-96 opacity-0 hidden"
                  : "translate-x-0 opacity-100"
              )}
            >
              Rimas
            </h1>
          </Link>
        </Button>
        <Menu isOpen={getOpenState()} />
      </div>
    </aside>
  );
}
