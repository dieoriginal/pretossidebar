import React from "react";

interface VerseTagProps {
  tag: string;
  onChange: (newTag: string) => void;
}

export function VerseTag({ tag, onChange }: VerseTagProps) {
  const colorMapping: { [key: string]: string } = {
    A: "border-red-500",
    B: "border-blue-500",
    C: "border-lime-500",
    D: "border-yellow-500",
  };
  const borderColor = colorMapping[tag.toUpperCase()] || "border-gray-300";
  return (
    <select
      value={tag}
      onChange={(e) => onChange(e.target.value)}
      className={`w-12 text-center text-base px-3 py-2 border-2 rounded-full uppercase font-bold ${borderColor} bg-white dark:bg-slate-700 text-black dark:text-white`}
    >
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
      <option value="D">D</option>
    </select>
  );
}
