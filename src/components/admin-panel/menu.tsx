// components/Menu.tsx

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

// Basic function to estimate syllable count for Portuguese words.
// This counts contiguous vowel groups as syllables.
function countSyllables(word: string): number {
  const matches = word.toLowerCase().match(/[aeiouáéíóúâêîôûãõ]+/g);
  return matches ? matches.length : 0;
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
  const [ptVocabulary, setPtVocabulary] = useState<WordItem[]>([]);

  // Load Portuguese vocabulary from the txt file.
  // Place vocabulary.txt in your /public folder with one word per line.
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
            // If you have a way to detect verbs, you can add:
            // normalizedWord = isVerb(normalizedWord) ? normalizeVerb(normalizedWord) : normalizedWord;
            return {
              word: normalizedWord,
              numSyllables: countSyllables(normalizedWord)
            };
          });
          setPtVocabulary(vocab);
        })
        .catch((err) => console.error("Error loading vocabulary:", err));
    }
  }, [language]);

  // Simple function to determine if two words rhyme using their last two characters.
  const wordsRhyme = (wordA: string, wordB: string) => {
    if (wordA.length < 2 || wordB.length < 2) return false;
    return wordA.slice(-2).toLowerCase() === wordB.slice(-2).toLowerCase();
  };

  // Filter and group words based on the search query and concept.
  useEffect(() => {
    if (query.trim().length > 0) {
      if (language === "pt") {
        let filtered = ptVocabulary.filter((item) =>
          wordsRhyme(item.word, query)
        );

        if (concept.trim().length > 0) {
          filtered = filtered.filter((item) =>
            item.word.toLowerCase().includes(concept.toLowerCase())
          );
        }

        const groups = { 1: [], 2: [], 3: [], 4: [] } as {
          [key: number]: string[];
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
        // For English, use the Datamuse API.
        let apiUrl = `https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(
          query
        )}&md=s`;
        if (concept.trim().length > 0) {
          apiUrl += `&topics=${encodeURIComponent(concept)}`;
        }
        fetch(apiUrl)
          .then((res) => res.json())
          .then((data: any) => {
            const groups = { 1: [], 2: [], 3: [], 4: [] } as {
              [key: number]: string[];
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
          .catch((err) => console.error("Error fetching rhymes:", err));
      }
    } else {
      // If no query, optionally show all Portuguese words (grouped by syllables).
      if (language === "pt") {
        const groups = { 1: [], 2: [], 3: [], 4: [] } as {
          [key: number]: string[];
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
  }, [query, concept, language, ptVocabulary]);

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
