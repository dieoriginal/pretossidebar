import React, { useState } from "react";

interface WordTagProps {
  word: string;
  color?: string;
  isRhymed: boolean;
  onChange: (newWord: string) => void;
  onColorChange: (newColor: string) => void;
  rhymedColor?: string;
}

export function WordTag({
  word,
  color,
  isRhymed,
  onChange,
  onColorChange,
  rhymedColor,
}: WordTagProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(word);

  // If a custom color (or rhymed color) exists, use it inline.
  // Otherwise, fallback to Tailwind classes:
  //   Light: bg-gray-200; Dark: bg-black
  const backgroundStyle =
    color
      ? { backgroundColor: color }
      : isRhymed && rhymedColor
      ? { backgroundColor: rhymedColor }
      : undefined;

  return (
    <div
      className={`inline-flex items-center m-1 p-1 border rounded cursor-pointer dark:text-white ${
        !color && !(isRhymed && rhymedColor)
          ? "bg-gray-200 dark:bg-black"
          : ""
      }`}
      style={backgroundStyle}
    >
      {isEditing ? (
        <input
          className="bg-transparent outline-none px-1 uppercase font-bold"
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
        <span onClick={() => setIsEditing(true)} className="px-1 uppercase font-bold">
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
