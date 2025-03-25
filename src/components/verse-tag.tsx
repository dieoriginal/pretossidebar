"use client";

export function VerseTag({
  tag,
  onChange,
}: {
  tag: string;
  onChange: (newTag: string) => void;
}) {
  const colorMapping: { [key: string]: string } = {
    A: "border-red-500 bg-red-100",
    B: "border-blue-500 bg-blue-100",
    C: "border-lime-500 bg-lime-100",
    D: "border-yellow-500 bg-yellow-100",
  };
  
  const borderColor = colorMapping[tag.toUpperCase()] || "border-gray-300 bg-gray-100";

  return (
    <select
      value={tag}
      onChange={(e) => onChange(e.target.value)}
      className={`w-12 text-center text-base px-3 py-2 border-2 ${borderColor} rounded-full 
        shadow-sm font-bold uppercase appearance-none`}
      style={{ textAlignLast: 'center' }}
    >
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
      <option value="D">D</option>
    </select>
  );
}