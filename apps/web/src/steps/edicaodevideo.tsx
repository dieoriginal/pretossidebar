"use client";

import React, { useState, useEffect } from "react";
import { ContentLayout } from "@/app/(demo)/obraeurudita/page";
import VideoQuotesBucket from "@/components/admin-panel/video/VideoQuotesBucket";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useProject } from "@/hooks/use-project";
import { AutoSaveStatus } from "@/components/auto-save-status";

export default function VideoEditChecklist() {
  const project = useProject((s) => s.project);
  const projectId = project?.id || 'current-project';

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

  // Auto-save hook
  const { save: saveChecklist, status: saveStatus, load: loadChecklist } = useAutoSave<Record<number, boolean>>({
    stepKey: 'edicaodevideo',
    projectId,
    autoLoad: true,
    onSave: (loadedData) => {
      if (loadedData) {
        setChecked(loadedData);
      }
    },
  });

  const [checked, setChecked] = useState<Record<number, boolean>>(() =>
    defaultItems.reduce<Record<number, boolean>>((acc, item) => {
      acc[item.id] = false;
      return acc;
    }, {})
  );

  // Carregar dados salvos ao montar
  useEffect(() => {
    loadChecklist().then((loadedData) => {
      if (loadedData) {
        setChecked(loadedData);
      }
    });
  }, [loadChecklist]);

  // Auto-save quando checked muda
  useEffect(() => {
    saveChecklist(checked);
  }, [checked, saveChecklist]);

  const toggleItem = (id: number) => {
    setChecked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <ContentLayout title="Edição de Vídeo">
      <div className="space-y-6">
        {/* Checklist de Edição */}
        <div className="max-w-lg mx-auto p-4 bg-white dark:bg-gray-900 rounded-2xl shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Checklist de Edição de Vídeo</h2>
            <AutoSaveStatus status={saveStatus} />
          </div>
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
        </div>

        {/* Bucket de Quotes para Edição de Vídeo */}
        <div className="max-w-5xl mx-auto">
          <VideoQuotesBucket />
        </div>
      </div>
    </ContentLayout>
  );
}

