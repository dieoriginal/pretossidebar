"use client";

import { useState } from "react";

export function WordTag({
  word,
  color,
  isRhymed,
  onChange,
  onColorChange,
  rhymedColor,
}: {
  word: string;
  color?: string;
  isRhymed: boolean;
  onChange: (newWords: { text: string; customColor?: string }[]) => void;
  onColorChange: (newColor: string) => void;
  rhymedColor?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(word);

  const effectiveColor = color
    ? color
    : isRhymed && rhymedColor
    ? rhymedColor
    : "#e5e7eb";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleBlur();
  };

  const handleBlur = () => {
    setIsEditing(false);
    const words = value.toUpperCase().split(/\s+/).filter(Boolean);
    if (words.length > 1) {
      onChange(words.map(w => ({ text: w, customColor: color })));
    } else {
      onChange([{ text: value.toUpperCase(), customColor: color }]);
    }
  };

  return (
    <div
      className="inline-flex items-center m-1 p-1 border rounded cursor-pointer"
      style={{ backgroundColor: effectiveColor }}
    >
      {isEditing ? (
        <input
          list="portuguese-words"
          className="bg-transparent outline-none px-1 uppercase"
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <span onClick={() => setIsEditing(true)} className="px-1">
          {value}
        </span>
      )}
      <input
        type="color"
        value={color || "#ffffff"}
        onChange={(e) => onColorChange(e.target.value)}
        className="w-6 h-6 p-0 border-0 ml-1 cursor-pointer"
      />
    </div>
  );
}