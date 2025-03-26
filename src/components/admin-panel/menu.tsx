"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getMenuList } from "@/lib/menu-list";

interface MenuProps {
  isOpen: boolean | undefined;
}

interface WordItem {
  word: string;
  numSyllables?: number;
}

export function Menu({ isOpen }: MenuProps) {
  const pathname = usePathname();
  const menuList = getMenuList(pathname);

  const [query, setQuery] = useState("");
  const [concept, setConcept] = useState("");
  const [language, setLanguage] = useState<"en" | "pt">("en");
  const [groupedResults, setGroupedResults] = useState<{
    1: string[];
    2: string[];
    3: string[];
    4: string[];
  }>({ 1: [], 2: [], 3: [], 4: [] });

  // Carrega as rimas e agrupa-as por número de sílabas
  useEffect(() => {
    if (query.trim().length > 0) {
      let apiUrl = "";
      if (language === "pt") {
        apiUrl = `http://localhost:5000/rhymes?query=${encodeURIComponent(
          query
        )}&concept=${encodeURIComponent(concept)}`;
      } else {
        apiUrl = `https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(query)}&md=s`;
        if (concept.trim().length > 0) {
          apiUrl += `&topics=${encodeURIComponent(concept)}`;
        }
      }
      fetch(apiUrl)
        .then((res) => res.json())
        .then((data: any) => {
          if (language === "en") {
            // Separa e agrupa os resultados por número de sílabas
            const groups = { 1: [], 2: [], 3: [], 4: [] } as { [key: number]: string[] };
            (data as WordItem[]).forEach((item) => {
              if (item.numSyllables) {
                if (item.numSyllables === 1) groups[1].push(item.word);
                else if (item.numSyllables === 2) groups[2].push(item.word);
                else if (item.numSyllables === 3) groups[3].push(item.word);
                else if (item.numSyllables >= 4) groups[4].push(item.word);
              }
            });
            setGroupedResults(groups);
          } else {
            // Para Português, os dados já vêm agrupados do backend
            setGroupedResults(data);
          }
        })
        .catch((err) => console.error("Error fetching rhymes:", err));
    } else {
      setGroupedResults({ 1: [], 2: [], 3: [], 4: [] });
    }
  }, [query, concept, language]);

  return (
    <div
      className="
        mt-4 h-full w-full
        bg-white text-black 
        dark:bg-gray-900 dark:text-white
        transition-colors duration-300
        flex flex-col
      "
      style={{ overflow: "hidden" }}
    >
      <div className="p-2">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Pesquisar Rimas"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="
              w-full p-1 text-sm
              border border-gray-300 rounded
              bg-transparent
            "
          />
          <input
            type="text"
            placeholder="Conceito (ex: war, love...)"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            className="
              w-full p-1 text-sm
              border border-gray-300 rounded
              bg-transparent
            "
          />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "pt")}
            className="
              w-full p-1 text-sm
              border border-gray-300 rounded
              bg-transparent
            "
          >
            <option value="en">English</option>
            <option value="pt">Português</option>
          </select>
        </div>
      </div>

      <div className="px-2 pb-2 flex flex-col gap-2">
        {[1, 2, 3, 4].map((group) => (
          <div
            key={group}
            className="
              border border-gray-300 dark:border-gray-700
              rounded
            "
          >
            <div
              className="
                bg-gray-100 dark:bg-gray-800
                px-2 py-1
                rounded-t
              "
            >
              <h1 className="text-sm font-semibold">
                {group === 4
                  ? "4 ou Mais Sílabas"
                  : `${group} Sílaba${group > 1 ? "s" : ""}`}
              </h1>
            </div>

            <div
              className="
                p-2 flex flex-wrap gap-2
                h-24
                overflow-y-auto
              "
            >
              {groupedResults[group].map((word) => (
                <span
                  key={word}
                  className="
                    text-sm 
                    bg-gray-200 dark:bg-gray-700
                    px-2 py-1 
                    rounded
                  "
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
