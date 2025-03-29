import React, { useState } from "react";

interface AddNewVerseInlineProps {
  addNewVerse: (words: { text: string; customColor?: string }[]) => void;
}

export function AddNewVerseInline({ addNewVerse }: AddNewVerseInlineProps) {
  const [verseText, setVerseText] = useState("");
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && verseText.trim() !== "") {
      const words = verseText
        .split(" ")
        .filter((w) => w.length > 0)
        .map((w) => ({ text: w }));
      addNewVerse(words);
      setVerseText("");
    }
  };

  return (
    <input
      type="text"
      value={verseText}
      onChange={(e) => setVerseText(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="DIGITE O VERSO E PRESSIONE ENTER"
      className="border p-2 rounded w-full uppercase"
    />
  );
}
