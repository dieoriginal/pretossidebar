import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { VerseTag } from "./VerseTag";
import { WordTag } from "./WordTag";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SortableVerseLineProps {
  id: number;
  verse: { words: { text: string; customColor?: string }[]; tag: string };
  onDelete: (id: number) => void;
  onTagChange: (id: number, newTag: string) => void;
  onWordChange: (
    id: number,
    newWords: { text: string; customColor?: string }[]
  ) => void;
  onWordColorChange: (id: number, index: number, newColor: string) => void;
}

export function SortableVerseLine({
  id,
  verse,
  onDelete,
  onTagChange,
  onWordChange,
  onWordColorChange,
}: SortableVerseLineProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : "",
    transition,
  };

  // More vibrant, saturated colors for the rhymed word:
  const bgColorMapping: { [key: string]: string } = {
    A: "#dc2626", // red-600
    B: "#2563eb", // blue-600
    C: "#65a30d", // lime-600
    D: "#ca8a04", // yellow-600
  };
  const rhymedBgColor = bgColorMapping[verse.tag.toUpperCase()] || "#2563eb";

  const updateWordAtIndex = (index: number, newText: string) => {
    const updatedWords = [...verse.words];
    updatedWords[index] = { ...updatedWords[index], text: newText };
    onWordChange(id, updatedWords);
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between border p-2 rounded">
      <div className="flex items-center gap-2">
        <div {...listeners} {...attributes} className="cursor-move">
          <VerseTag tag={verse.tag} onChange={(newTag) => onTagChange(id, newTag)} />
        </div>
        <div className="flex flex-wrap">
          {verse.words.map((wordObj, idx) => (
            <WordTag
              key={idx}
              word={wordObj.text}
              color={wordObj.customColor}
              isRhymed={idx === verse.words.length - 1}
              onChange={(newWord) => updateWordAtIndex(idx, newWord)}
              onColorChange={(newColor) => onWordColorChange(id, idx, newColor)}
              rhymedColor={idx === verse.words.length - 1 ? rhymedBgColor : undefined}
            />
          ))}
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onDelete(id)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
