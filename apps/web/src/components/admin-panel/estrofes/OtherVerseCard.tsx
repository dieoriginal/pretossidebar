"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import jsPDF from "jspdf";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormValues } from "@/types";

interface Word {
  text: string;
  color: string;
}

const initialPoeticParams: FormValues = {
  tipo: "Épica",
  forma: "Longa, narrativa, hexâmetro dactílico",
  tema: "Mitologia, heróis, guerra",
  arquétipo: "Prometeu",
  apolineo: 50,
  dionisíaco: 50,
  efeitoDesejado: [],
  tipoMetrica: "trocaico",
  silabasPorLinha: 12,
  posicaoCesura: 6,
  esquemaRima: "ABAB - ABBA - AABB",
  enjambement: 0.3,
  aliteracaoConsoante: "m",
  aliteracaoFrequencia: 3,
  assonanciaVogal: "ó",
  assonanciaPadrao: "cíclico",
  onomatopeias: ["estrondo", "rugir", "crepitar"],
  prologo: "Exposição do conflito",
  parodos: "Entrada do coro",
  episodios: [
    "Ascensão do herói",
    "Erro trágico (hamartia)",
    "Virada de fortuna (peripeteia)",
    "Queda (catástrofe)",
    "Reconhecimento (anagnórise)",
  ],
  exodo: "Lições do coro",
  dicionarioPoetico: [
    { termo: "Fogo", categoria: "Prometeico", significado: "Rebelião/Iluminação" },
    { termo: "Lâmina", categoria: "Sacrifício", significado: "Ruptura/Iniciação" },
    { termo: "Abismo", categoria: "Nietzschiano", significado: "Vazio/Criação" },
  ],
};

const PreviewModal = ({ verses }: { verses: Word[][] }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" className="gap-2">
        <EyeIcon className="h-4 w-4" />
        Pré-visualizar
      </Button>
    </DialogTrigger>
    <DialogContent className="min-h-[90vh] max-w-[800px]">
      <DialogHeader>
        <DialogTitle className="text-center">Pré-visualização do Poema</DialogTitle>
      </DialogHeader>
      <div className="bg-white p-8 h-full">
        <div className="font-helvetica uppercase text-black text-center space-y-6 text-lg">
          {verses.map((verse, index) => (
            <p key={index} className="break-words">
              {verse.map((word, i) => (
                <span key={i} style={{ color: word.color }}>
                  {word.text}{i < verse.length - 1 ? " " : ""}
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const hexToRgb = (hex: string) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
};

const exportToPDF = (verses: Word[][]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  let y = margin;
  const lineHeight = 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  verses.forEach(verse => {
    let currentLine: Word[] = [];
    let currentLineWidth = 0;

    const flushLine = () => {
      let lineX = margin;
      currentLine.forEach((word, wordIndex) => {
        const wordText = word.text.toUpperCase() + (wordIndex === currentLine.length - 1 ? "" : " ");
        const rgb = hexToRgb(word.color) || { r: 0, g: 0, b: 0 };
        doc.setTextColor(rgb.r, rgb.g, rgb.b);
        doc.text(wordText, lineX, y);
        lineX += doc.getTextWidth(wordText);
      });
      y += lineHeight;
      currentLine = [];
      currentLineWidth = 0;
    };

    verse.forEach((word) => {
      const wordWidth = doc.getTextWidth(word.text.toUpperCase() + " ");
      if (currentLineWidth + wordWidth > pageWidth - margin * 2) {
        flushLine();
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
      }
      currentLine.push(word);
      currentLineWidth += wordWidth;
    });

    if (currentLine.length > 0) {
      flushLine();
    }

    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  });

  doc.save("poema.pdf");
};

function VerseCard({ index, onVersesChange }: { index: number, onVersesChange: (words: Word[]) => void }) {
  const [words, setWords] = useState<Word[]>([]);

  const handleColorChange = (index: number, color: string) => {
    const newWords = [...words];
    newWords[index].color = color;
    setWords(newWords);
    onVersesChange(newWords);
  };

  const addNewVerse = (newWords: Word[]) => {
    const updated = [...words, ...newWords];
    setWords(updated);
    onVersesChange(updated);
  };

  const removeWord = (removeIndex: number) => {
    const updatedWords = words.filter((_, i) => i !== removeIndex);
    setWords(updatedWords);
    onVersesChange(updatedWords);
  };

  return (
    <div className="border p-4 rounded-lg mb-4">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Digite o verso..."
          className="border p-1 rounded flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const newWords = e.currentTarget.value.trim().split(" ").map(word => ({ text: word, color: "#000000" }));
              addNewVerse(newWords);
              e.currentTarget.value = "";
            }
          }}
        />
        <Button
          onClick={() => {
            const input = document.querySelector(`input[placeholder="Digite o verso..."]`) as HTMLInputElement;
            const newWords = input.value.trim().split(" ").map(word => ({ text: word, color: "#000000" }));
            addNewVerse(newWords);
            input.value = "";
          }}
          variant="default"
        >
          Adicionar Verso
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {words.map((word, i) => (
          <div key={i} className="flex items-center gap-1 bg-gray-100 p-1 rounded">
            <input
              type="color"
              value={word.color}
              onChange={(e) => handleColorChange(i, e.target.value)}
              className="w-6 h-6"
            />
            <span style={{ color: word.color }}>{word.text}</span>
            <button onClick={() => removeWord(i)} className="text-red-500 ml-2">
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OtherVerseCard() {
  const [globalParams] = useState<FormValues>(initialPoeticParams);
  const [cards, setCards] = useState<number[]>([Date.now()]);
  const [allVerses, setAllVerses] = useState<Word[][]>([]);

  const addNewCard = () => setCards((prev) => [...prev, Date.now()]);
  const removeCard = () => setCards((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));

  const handleVersesUpdate = useCallback((index: number, words: Word[]) => {
    setAllVerses(prev => {
      const newVerses = [...prev];
      newVerses[index] = words;
      return newVerses;
    });
  }, []);

  return (
    <div className="p-4">
      {/* Unique page content without duplicate global layouts */}
  
   

      <div className="space-y-6">
        {cards.map((cardId, idx) => (
          <VerseCard key={cardId} index={idx} onVersesChange={(words) => handleVersesUpdate(idx, words)} />
        ))}
      </div>

      <div className="sticky bottom-0 bg-background/95 backdrop-blur p-4 flex justify-center gap-4 flex-wrap">
        <Button onClick={addNewCard} variant="default" className="gap-2">
          <PlusIcon className="h-4 w-4" />
          Adicionar Estrofe
        </Button>
        <Button onClick={removeCard} variant="destructive" className="gap-2">
          <TrashIcon className="h-4 w-4" />
          Remover Estrofe
        </Button>
        <PreviewModal verses={allVerses} />
        <Button onClick={() => exportToPDF(allVerses)} variant="secondary" className="gap-2">
          <FileTextIcon className="h-4 w-4" />
          Exportar PDF
        </Button>
        <Button
          variant="secondary"
          className="gap-2"
          onClick={() => (window.location.href = "http://localhost:3000/cinematografia")}
        >
          <VideoIcon className="h-4 w-4" />
          Planear Cinematografia
        </Button>
      </div>
    </div>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path fill="currentColor" d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z" />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z" />
    </svg>
  );
}

function VideoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11z" />
    </svg>
  );
}

function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path fill="currentColor" d="M12 9a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5 5 5 0 0 1 5-5 5 5 0 0 1 5 5 5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5" />
    </svg>
  );
}

function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path fill="currentColor" d="M14 2v6h6m-4 5H8m8 4H8m2-8H8" />
    </svg>
  );
}
