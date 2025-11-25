"use client";

import React, { useState } from "react";
import { ContentLayout } from "@/app/(demo)/obraeurudita/page";

export default function VideoEditChecklist() {
  const defaultItems = [
    { id: 1, label: "Hard Grain" },
    { id: 2, label: "Semetary Grain e VHS Errors" },
    { id: 3, label: "Overlay 3D Básico (Mannequins, esculturas)" },
    { id: 4, label: "Jump Cuts Ritmados (1/8 a 1/16 de compasso)" },
    { id: 5, label: "Optical Flow para Slow-Mo" },
    { id: 6, label: "VHS/Glitch Lo-fi (Datamosh, Bad TV)" },
    { id: 7, label: "RGB Split em Seções-Chave" },
    { id: 8, label: "Kinetic Typography (Mono/Condensed)" },
    { id: 9, label: "Máscaras e Luma Keys (Cyberpunk)" },
    { id: 10, label: "Displacement Maps Reactivos ao Áudio" },
    { id: 11, label: "Anime Cut-ins & Track Matte" },
    { id: 12, label: "Audio Spectrum Borders" },
    { id: 13, label: "Fast Movements & Quick Transitions" },
    { id: 14, label: "Adverts" },
    { id: 15, label: "Símbolos e Iconografia Personalizada" },
  ];

  const [checked, setChecked] = useState<Record<number, boolean>>(() =>
    defaultItems.reduce<Record<number, boolean>>((acc, item) => {
      acc[item.id] = false;
      return acc;
    }, {})
  );

  const toggleItem = (id: number) => {
    setChecked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <ContentLayout title="Edição de Vídeo">
      <div className="max-w-lg mx-auto p-4 bg-white dark:bg-gray-900 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">Checklist de Edição de Vídeo</h2>
        <ul className="space-y-2">
          {defaultItems.map((item) => (
            <li key={item.id} className="flex items-center">
              <input
                type="checkbox"
                id={`item-${item.id}`}
                checked={!!checked[item.id]}
                onChange={() => toggleItem(item.id)}
                className="h-5 w-5 rounded border-gray-300 focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
              />
              <label htmlFor={`item-${item.id}`} className="ml-3 text-base">
                {item.label}
              </label>
            </li>
          ))}
        </ul>
        <button
          onClick={() => console.log("Checked items:", checked)}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Salvar Checklist
        </button>
      </div>
    </ContentLayout>
  );
}

