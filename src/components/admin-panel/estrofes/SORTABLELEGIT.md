import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { VerseTag } from "./VerseTag";
import { WordTag } from "./WordTag";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SortableVerseLineProps {
  id: number;
  verse: { 
    words: { text: string; customColor?: string }[]; 
    tag: string;
    adlib?: string;
  };
  onDelete: (id: number) => void;
  onTagChange: (id: number, newTag: string) => void;
  onWordChange: (
    id: number,
    newWords: { text: string; customColor?: string }[]
  ) => void;
  onWordColorChange: (id: number, index: number, newColor: string) => void;
  onAdlibChange?: (id: number, newAdlib: string) => void; // Tornar opcional
}

export function SortableVerseLine({
  id,
  verse,
  onDelete,
  onTagChange,
  onWordChange,
  onWordColorChange,
  onAdlibChange = () => {}, // Função padrão
}: SortableVerseLineProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: transform ? CSS.Transform.toString(transform) : "",
    transition,
    position: "relative",
  };

  // Vibrant colors for the rhymed (last) word
  const bgColorMapping: { [key: string]: string } = {
    A: "#dc2626", // red-600
    B: "#2563eb", // blue-600
    C: "#65a30d", // lime-600
    D: "#ca8a04", // yellow-600
  };
  const rhymedBgColor = bgColorMapping[verse.tag.toUpperCase()] || "#2563eb";

  // Update word text at a given index
  const updateWordAtIndex = (index: number, newText: string) => {
    const updatedWords = [...verse.words];
    updatedWords[index] = { ...updatedWords[index], text: newText };
    onWordChange(id, updatedWords);
  };

  // Insert a new empty word after a given index (-1 inserts at beginning)
  const handleInsertWord = (index: number) => {
    const updatedWords = [...verse.words];
    updatedWords.splice(index + 1, 0, { text: "" });
    onWordChange(id, updatedWords);
  };

  // Remove word at a given index
  const handleRemoveWord = (index: number) => {
    const updatedWords = [...verse.words];
    updatedWords.splice(index, 1);
    onWordChange(id, updatedWords);
  };

  return (
    <div ref={setNodeRef} style={style} className="border p-2 rounded mb-2">
      {/* ADLIB input in the top-right corner */}
      <input
        type="text"
        placeholder="ADLIB..."
        value={verse.adlib || ""}
        onChange={(e) => onAdlibChange(id, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className="absolute font-extrabold top-1 right-1 text-sm p-2 border-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Drag handle and verse tag */}
      <div className="flex items-center gap-2">
        <div {...listeners} {...attributes} className="cursor-move">
          <VerseTag tag={verse.tag} onChange={(newTag) => onTagChange(id, newTag)} />
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {/* Insert button before the first word */}
          <button
            onClick={() => handleInsertWord(-1)}
            className="text-green-500 text-xs px-1"
            title="Inserir palavra no início"
          >
            +
          </button>

          {verse.words.map((wordObj, idx) => (
            <React.Fragment key={idx}>
              <WordTag
                word={wordObj.text}
                color={wordObj.customColor}
                isRhymed={idx === verse.words.length - 1}
                onChange={(newWord) => updateWordAtIndex(idx, newWord)}
                onColorChange={(newColor) => onWordColorChange(id, idx, newColor)}
                onRemove={() => handleRemoveWord(idx)}
                rhymedColor={idx === verse.words.length - 1 ? rhymedBgColor : undefined}
              />
              {/* Insert button between words */}
              <button
                onClick={() => handleInsertWord(idx)}
                className="text-green-500 text-xs px-1"
                title="Inserir nova palavra aqui"
              >
                +
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Delete verse button */}
      <div className="mt-1 text-right">
        <Button variant="ghost" size="icon" onClick={() => onDelete(id)} title="Deletar estrofe">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
