import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export interface Word {
  text: string;
  color: string;
}

interface AddNewVerseInlineProps {
  addNewVerse: (words: Word[]) => void;
}

export function AddNewVerseInline({ addNewVerse }: AddNewVerseInlineProps) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (input.trim()) {
      const words = input.trim().split(" ").map(word => ({ 
        text: word,
        color: '#000000' // Default color
      }));
      addNewVerse(words);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="flex gap-2">
      <input 
        type="text" 
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Digite o verso..."
        className="border p-1 rounded flex-1"
      />
      <Button onClick={handleAdd} variant="default">
        Adicionar Verso
      </Button>
    </div>
  );
}