import React, { useState } from "react";

interface WordTagProps {
  word: string;
  color?: string;
  isRhymed: boolean;
  onChange: (newWord: string) => void;
  onColorChange: (newColor: string) => void;
  onRemove: () => void; // New prop for removing this word
  rhymedColor?: string;
}

export function WordTag({
  word,
  color,
  isRhymed,
  onChange,
  onColorChange,
  onRemove,
  rhymedColor,
}: WordTagProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(word);

  // Use inline style if a custom or rhymed color is provided; fallback to Tailwind classes
  const backgroundStyle =
    color
      ? { backgroundColor: color }
      : isRhymed && rhymedColor
      ? { backgroundColor: rhymedColor }
      : {};

  return (
    <div
      className="inline-flex items-center m-1 p-1 border rounded dark:text-white"
      style={backgroundStyle}
    >
      {isEditing ? (
        <input
          className="bg-transparent outline-none px-1 uppercase font-bold text-sm"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            onChange(value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setIsEditing(false);
              onChange(value);
            }
          }}
          autoFocus
        />
      ) : (
        <span onClick={() => setIsEditing(true)} className="px-1 uppercase font-bold text-sm">
          {value || "___"}
        </span>
      )}
      {/* Tiny remove icon (kept minimal) */}
      <button
        onClick={onRemove}
        className="text-red-500 text-xs ml-1"
        title="Remover palavra"
      >
        &times;
      </button>
      <input
        type="color"
        value={color || "#ffffff"}
        onChange={(e) => onColorChange(e.target.value)}
        className="w-6 h-6 p-0 border-0 ml-1 cursor-pointer"
      />
    </div>
  );
}
