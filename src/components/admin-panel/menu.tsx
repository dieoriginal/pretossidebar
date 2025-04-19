"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getMenuList } from "@/lib/menu-list";
import { restoreAccents, toSentenceCase, normalizeVerb } from "@/lib/normalize";

interface MenuProps {
  isOpen: boolean | undefined;
}

interface WordItem {
  word: string;
  numSyllables?: number;
}

function countSyllables(word: string): number {
  const matches = word.toLowerCase().match(/[aeiouáéíóúâêîôûãõ]+/g);
  return matches ? matches.length : 0;
}

export function Menu({ isOpen }: MenuProps) {
  const pathname = usePathname();
  const menuList = getMenuList(pathname);

  const [query, setQuery] = useState("");
  const [concept, setConcept] = useState("");
  const [startLetter, setStartLetter] = useState("");
  const [language, setLanguage] = useState<"en" | "pt">("pt");
  const [groupedResults, setGroupedResults] = useState({
    1: [] as string[],
    2: [] as string[],
    3: [] as string[],
    4: [] as string[]
  });
  const [ptVocabulary, setPtVocabulary] = useState<WordItem[]>([]);

  useEffect(() => {
    if (language === "pt") {
      fetch("/vocabulary.txt")
        .then((res) => res.text())
        .then((text) => {
          const words = text
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line !== "");
          const vocab = words.map((word) => {
            let normalizedWord = word;
            normalizedWord = restoreAccents(normalizedWord);
            normalizedWord = toSentenceCase(normalizedWord);
            return {
              word: normalizedWord,
              numSyllables: countSyllables(normalizedWord)
            };
          });
          setPtVocabulary(vocab);
        })
        .catch((err) => console.error("Erro ao carregar vocabulário:", err));
    }
  }, [language]);

  const wordsRhyme = (wordA: string, wordB: string) => {
    if (wordA.length < 4 || wordB.length < 4) return false;
    return wordA.slice(-4).toLowerCase() === wordB.slice(-4).toLowerCase();
  };

  useEffect(() => {
    if (query.trim().length === 0) {
      setGroupedResults({ 1: [], 2: [], 3: [], 4: [] });
      return;
    }

    if (query.trim().length > 0) {
      if (language === "pt") {
        let filtered = ptVocabulary.filter((item) =>
          wordsRhyme(item.word.toLowerCase(), query.toLowerCase())
        );

        if (concept.trim().length > 0) {
          filtered = filtered.filter((item) =>
            item.word.toLowerCase().includes(concept.toLowerCase())
          );
        }

        if (startLetter.trim().length > 0) {
          filtered = filtered.filter((item) =>
            item.word.toLowerCase().startsWith(startLetter.toLowerCase())
          );
        }

        const groups = {
          1: [] as string[],
          2: [] as string[],
          3: [] as string[],
          4: [] as string[]
        };
        
        filtered.forEach((item) => {
          if (item.numSyllables) {
            if (item.numSyllables === 1) groups[1].push(item.word);
            else if (item.numSyllables === 2) groups[2].push(item.word);
            else if (item.numSyllables === 3) groups[3].push(item.word);
            else if (item.numSyllables >= 4) groups[4].push(item.word);
          }
        });
        setGroupedResults(groups);
      } else {
        let apiUrl = `https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(
          query
        )}&md=s`;
        if (concept.trim().length > 0) {
          apiUrl += `&topics=${encodeURIComponent(concept)}`;
        }
        fetch(apiUrl)
          .then((res) => res.json())
          .then((data: any) => {
            const groups = {
              1: [] as string[],
              2: [] as string[],
              3: [] as string[],
              4: [] as string[]
            };
            (data as WordItem[]).forEach((item) => {
              if (item.numSyllables) {
                if (item.numSyllables === 1) groups[1].push(item.word);
                else if (item.numSyllables === 2) groups[2].push(item.word);
                else if (item.numSyllables === 3) groups[3].push(item.word);
                else if (item.numSyllables >= 4) groups[4].push(item.word);
              }
            });
            setGroupedResults(groups);
          })
          .catch((err) => console.error("Erro ao buscar rimas:", err));
      }
    } else {
      if (language === "pt") {
        const groups = {
          1: [] as string[],
          2: [] as string[],
          3: [] as string[],
          4: [] as string[]
        };
        ptVocabulary.forEach((item) => {
          if (item.numSyllables) {
            if (item.numSyllables === 1) groups[1].push(item.word);
            else if (item.numSyllables === 2) groups[2].push(item.word);
            else if (item.numSyllables === 3) groups[3].push(item.word);
            else if (item.numSyllables >= 4) groups[4].push(item.word);
          }
        });
        setGroupedResults(groups);
      } else {
        setGroupedResults({ 1: [], 2: [], 3: [], 4: [] });
      }
    }
  }, [query, concept, startLetter, language, ptVocabulary]);

  const getCardHeight = (wordsCount: number) => {
    if (wordsCount === 0) return 'h-8';
    if (wordsCount <= 5) return 'h-24';
    if (wordsCount <= 10) return 'h-32';
    if (wordsCount <= 20) return 'h-48';
    return 'h-64';
  };

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
            placeholder="Conceito (ex: guerra, amor...)"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            className="
              w-full p-1 text-sm
              border border-gray-300 rounded
              bg-transparent
            "
          />
          <input
            type="text"
            placeholder="Letra inicial (ex: s)"
            value={startLetter}
            onChange={(e) => setStartLetter(e.target.value)}
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
            <option value="pt">Português</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div className="px-2 pb-2 flex flex-col gap-2">
        {[1, 2, 3, 4].map((group) => (
          <div
            key={group}
            className={`
              border border-gray-300 dark:border-gray-700
              rounded
              ${groupedResults[group as keyof typeof groupedResults].length === 0 ? 'h-8' : ''}
            `}
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
                  ? `4 Sílabas (${groupedResults[4].length})`
                  : `${group} Sílaba${group > 1 ? "s" : ""} (${groupedResults[group as keyof typeof groupedResults].length})`}
              </h1>
            </div>

            {groupedResults[group as keyof typeof groupedResults].length > 0 && (
              <div
                className={`
                  p-2 flex flex-wrap gap-2
                  ${getCardHeight(groupedResults[group as keyof typeof groupedResults].length)}
                  overflow-y-auto
                `}
              >
                {groupedResults[group as keyof typeof groupedResults].map((word) => (
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
