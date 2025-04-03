"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import { Button } from "@/components/ui/button";
import { analyzeMeter } from "@/lib/analyzeMeter";
import { AddNewVerseInline } from "./AddNewVerseInline";
import { SortableVerseLine } from "./SortableVerseLine";

interface Verse {
  id: number;
  words: { text: string; customColor?: string }[];
  tag: string;
}

interface OtherVerseCardProps {
  index: number;
  formParams: any;
  className?: string;
  onVersesChange?: (verses: string[]) => void;
}

type SelectedTab = "figuras" | "engMetrica" | "metrica" | "dramArq" | "lexicon";

interface ExtraOptions {
  selectedTab: SelectedTab;
  selectedEngMetrica: string;
  selectedVersoOption: string;
  numeroVersos: number;
  selectedRhymeScheme: string[];
  selectedDramArq: string;
  selectedLexicon: string[];
}

const initialExtraOptions: ExtraOptions = {
  selectedTab: "figuras",
  selectedEngMetrica: "trocaico",
  selectedVersoOption: "Onossílabo",
  numeroVersos: 4,
  selectedRhymeScheme: ["A", "B", "A", "B"],
  selectedDramArq: "Prólogo",
  selectedLexicon: [],
};

const literaryFigures = [
  { name: "Metáfora", description: "Comparação implícita entre duas coisas. Ex.: 'A vida é um sonho'." },
  { name: "Símile", description: "Comparação explícita usando 'como'. Ex.: 'Ele é forte como um touro'." },
  { name: "Hipérbole", description: "Exagero para enfatizar uma ideia. Ex.: 'Estou morrendo de fome'." },
  { name: "Ironia", description: "Dizer o oposto do que se quer expressar. Ex.: 'Que dia lindo!' (num dia chuvoso)." },
  { name: "Aliteração", description: "Repetição de sons consonantais. Ex.: 'O rato roeu a roupa do rei de Roma'." },
  { name: "Prosopopeia", description: "Atribuir características humanas a seres inanimados. Ex.: 'O sol sorriu para nós'." },
  { name: "Onomatopeia", description: "Palavras que imitam sons. Ex.: 'O relógio faz tic-tac'." },
  { name: "Eufemismo", description: "Suavização de uma expressão. Ex.: 'Ele partiu para um lugar melhor'." },
  { name: "Antítese", description: "Contraposição de ideias. Ex.: 'É um mar de rosas, mas também um deserto de espinhos'." },
  { name: "Paradoxo", description: "Ideias opostas que geram reflexão. Ex.: 'Menos é mais'." },
];

const engMetricaOptions = [
  { tipo: "trocaico", distribuicao: "Forte → Fraco", exemplo: "LU-a", efeito: "Enfático, marcado" },
  { tipo: "iâmbico", distribuicao: "Fraco → Forte", exemplo: "aMOR", efeito: "Fluído, crescente" },
  { tipo: "dactílico", distribuicao: "Forte → Fraco → Fraco", exemplo: "RÚ-sti-co", efeito: "Musical, épico" },
];

const versoOptions = ["Onossílabo", "Dissílabo", "Trissílabo", "Tetrassílabo", "Pentassílabo", "Hexassílabo"];
const dramArqOptions = ["Prólogo", "Parodos", "Episódios", "Êxodo"];
const dramArqTooltips: { [key: string]: string } = {
  "Prólogo": "Exposição do conflito",
  "Parodos": "Entrada do coro",
  "Episódios": "Escolha entre: Ascensão do herói, Erro trágico (hamartia), Virada de fortuna (peripeteia), Queda (catástrofe) ou Reconhecimento (anagnórise)",
  "Êxodo": "Lições do coro",
};

const lexiconOptions = [
  { termo: "Fogo", categoria: "Prometeico", significado: "Rebelião/Iluminação" },
  { termo: "Lâmina", categoria: "Sacrifício", significado: "Ruptura/Iniciação" },
  { termo: "Abismo", categoria: "Nietzschiano", significado: "Vazio/Criação" },
];

export function OtherVerseCard({ index, formParams, className, onVersesChange }: OtherVerseCardProps) {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [selectedContexts, setSelectedContexts] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [extraOptions, setExtraOptions] = useState<ExtraOptions>(initialExtraOptions);

  useEffect(() => {
    const storedState = localStorage.getItem(`verseCard-${index}`);
    if (storedState) {
      try {
        const parsedState = JSON.parse(storedState) as {
          verses: Verse[];
          selectedContexts: string[];
          extraOptions: ExtraOptions;
        };
        setVerses(parsedState.verses || []);
        setSelectedContexts(parsedState.selectedContexts || []);
        setExtraOptions(parsedState.extraOptions || initialExtraOptions);
      } catch (error) {
        console.error("Error parsing stored verse card state", error);
      }
    }
  }, [index]);

  useEffect(() => {
    const stateToStore = { verses, selectedContexts, extraOptions };
    localStorage.setItem(`verseCard-${index}`, JSON.stringify(stateToStore));
    
    if (onVersesChange) {
      const verseTexts = verses.map(v => v.words.map(w => w.text).join(" "));
      const storedVerses = JSON.parse(localStorage.getItem(`verseCard-${index}`) || '{}').verses?.map((v: Verse) => v.words.map((w: any) => w.text).join(" ")).join();
      // Add condition to prevent infinite updates
      if (verseTexts.join() !== storedVerses) {
        onVersesChange(verseTexts);
      }
    }
  }, [verses, selectedContexts, extraOptions, index, onVersesChange]);

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });
  const pointerSensor = useSensor(PointerSensor);
  const sensors = useSensors(keyboardSensor, pointerSensor);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setVerses((prev) => {
        const oldIndex = prev.findIndex((v) => v.id === active.id);
        const newIndex = prev.findIndex((v) => v.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const defaultTagCycle = ["A", "B", "C", "D"];
  const addNewVerse = (words: { text: string; customColor?: string }[]) => {
    const newTag = defaultTagCycle[verses.length % defaultTagCycle.length];
    const newVerse: Verse = { id: Date.now(), words, tag: newTag };
    setVerses((prev) => [...prev, newVerse]);
  };

  const deleteVerse = (id: number) => {
    setVerses((prev) => prev.filter((v) => v.id !== id));
  };

  const updateVerseWords = (id: number, newWords: { text: string; customColor?: string }[]) => {
    setVerses((prev) =>
      prev.map((v) => (v.id === id ? { ...v, words: newWords } : v))
    );
  };

  const updateVerseTag = (id: number, newTag: string) => {
    setVerses((prev) =>
      prev.map((v) => (v.id === id ? { ...v, tag: newTag } : v))
    );
  };

  const updateWordColor = (id: number, index: number, newColor: string) => {
    setVerses((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const updatedWords = [...v.words];
          updatedWords[index] = { ...updatedWords[index], customColor: newColor };
          return { ...v, words: updatedWords };
        }
        return v;
      })
    );
  };

  async function handleAnalyze() {
    const lines = verses.map((verse) => verse.words.map((w) => w.text).join(" "));
    try {
      const result = await analyzeMeter(lines);
      setAnalysisResult(result);
      setShowAnalysis(true);
    } catch (error) {
      console.error("Error analyzing meter:", error);
    }
  }

  const toggleContext = (figure: string) => {
    if (selectedContexts.includes(figure)) {
      setSelectedContexts(selectedContexts.filter((f) => f !== figure));
    } else {
      setSelectedContexts([...selectedContexts, figure]);
    }
  };

  const handleTabChange = (tab: SelectedTab) => {
    setExtraOptions((prev) => ({ ...prev, selectedTab: tab }));
  };

  const selectEngMetrica = (tipo: string) => {
    setExtraOptions((prev) => ({ ...prev, selectedEngMetrica: tipo }));
  };

  const selectVersoOption = (option: string) => {
    setExtraOptions((prev) => ({ ...prev, selectedVersoOption: option }));
  };

  const updateNumeroVersos = (num: number) => {
    setExtraOptions((prev) => ({ ...prev, numeroVersos: num }));
  };

  const updateRhymeScheme = (idx: number, letter: string) => {
    setExtraOptions((prev) => {
      const newScheme = [...prev.selectedRhymeScheme];
      newScheme[idx] = letter;
      return { ...prev, selectedRhymeScheme: newScheme };
    });
  };

  const selectDramArq = (option: string) => {
    setExtraOptions((prev) => ({ ...prev, selectedDramArq: option }));
  };

  const toggleLexicon = (termo: string) => {
    const current = extraOptions.selectedLexicon;
    if (current.includes(termo)) {
      setExtraOptions((prev) => ({
        ...prev,
        selectedLexicon: current.filter((t) => t !== termo),
      }));
    } else {
      setExtraOptions((prev) => ({
        ...prev,
        selectedLexicon: [...current, termo],
      }));
    }
  };

  return (
    <div className={`border p-4 rounded mb-4 select-none ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Estrofe #{index + 1}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleTabChange("figuras")}>
            Figuras
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleTabChange("engMetrica")}>
            Métrica
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleTabChange("dramArq")}>
            Arquitetura
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {extraOptions.selectedTab === "figuras" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {literaryFigures.map((figure) => (
              <button
                key={figure.name}
                onClick={() => toggleContext(figure.name)}
                className={`p-2 text-left rounded border transition-all ${
                  selectedContexts.includes(figure.name)
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 hover:border-gray-300 bg-white dark:bg-gray-800"
                }`}
                title={figure.description}
              >
                <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">{figure.name}</span>
                <span className="block text-xs text-gray-500 mt-1">{figure.description.split(".")[0]}</span>
              </button>
            ))}
          </div>
        )}

        {extraOptions.selectedTab === "engMetrica" && (
          <div className="grid gap-2">
            {engMetricaOptions.map((opt) => (
              <button
                key={opt.tipo}
                onClick={() => selectEngMetrica(opt.tipo)}
                className={`p-3 rounded border transition-all ${
                  extraOptions.selectedEngMetrica === opt.tipo
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 hover:border-gray-300 bg-white dark:bg-gray-800"
                }`}
                title={`Exemplo: ${opt.exemplo}\nEfeito: ${opt.efeito}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{opt.tipo}</span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{opt.distribuicao}</span>
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Exemplo: <span className="font-mono">{opt.exemplo}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {extraOptions.selectedTab === "metrica" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {versoOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => selectVersoOption(option)}
                  className={`p-2 rounded border transition-all ${
                    extraOptions.selectedVersoOption === option
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 hover:border-gray-300 bg-white dark:bg-gray-800"
                  }`}
                  title={`Verso ${option.toLowerCase()}`}
                >
                  <span className="block font-semibold text-gray-800 dark:text-gray-200">{option}</span>
                  <span className="block text-xs text-gray-500 mt-1">
                    {option.replace('ssílabo', ' sílabas').replace('sílabo', ' sílabas')}
                  </span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded border border-gray-200 bg-white dark:bg-gray-800">
                <label className="block text-sm font-semibold mb-2">Número de Versos</label>
                <input
                  type="number"
                  value={extraOptions.numeroVersos}
                  onChange={(e) => updateNumeroVersos(Number(e.target.value))}
                  className="w-full p-1 border rounded text-center"
                  min={1}
                />
              </div>

              <div className="p-3 rounded border border-gray-200 bg-white dark:bg-gray-800">
                <label className="block text-sm font-semibold mb-2">Esquema de Rima</label>
                <div className="flex gap-2">
                  {extraOptions.selectedRhymeScheme.map((letter, i) => (
                    <input
                      key={i}
                      type="text"
                      value={letter}
                      onChange={(e) => updateRhymeScheme(i, e.target.value.toUpperCase().slice(0, 1))}
                      className="flex-1 p-1 border rounded text-center uppercase font-mono"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {extraOptions.selectedTab === "dramArq" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {dramArqOptions.map((option) => (
              <button
                key={option}
                onClick={() => selectDramArq(option)}
                className={`p-3 rounded border transition-all ${
                  extraOptions.selectedDramArq === option
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 hover:border-gray-300 bg-white dark:bg-gray-800"
                }`}
                title={dramArqTooltips[option]}
              >
                <span className="block font-semibold text-gray-800 dark:text-gray-200">{option}</span>
                <span className="block text-xs text-gray-500 mt-2">
                  {dramArqTooltips[option].split(":")[0]}
                </span>
              </button>
            ))}
          </div>
        )}

        {extraOptions.selectedTab === "lexicon" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {lexiconOptions.map((term) => (
              <button
                key={term.termo}
                onClick={() => toggleLexicon(term.termo)}
                className={`p-3 rounded border transition-all ${
                  extraOptions.selectedLexicon.includes(term.termo)
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 hover:border-gray-300 bg-white dark:bg-gray-800"
                }`}
                title={`Significado: ${term.significado}`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{term.termo}</span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {term.categoria}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">{term.significado}</p>
              </button>
            ))}
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext items={verses.map((v) => v.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {verses.map((verse) => (
                <SortableVerseLine
                  key={verse.id}
                  id={verse.id}
                  verse={verse}
                  onDelete={deleteVerse}
                  onTagChange={updateVerseTag}
                  onWordChange={updateVerseWords}
                  onWordColorChange={updateWordColor}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="mt-4">
          <AddNewVerseInline addNewVerse={addNewVerse} />
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <Button onClick={handleAnalyze} variant="default">
              Analisar Métrica
            </Button>
            {showAnalysis && (
              <Button
                onClick={() => {
                  setShowAnalysis(false);
                  setAnalysisResult(null);
                }}
                variant="destructive"
              >
                Ocultar Métrica
              </Button>
            )}
          </div>
          {showAnalysis && analysisResult && (
            <div className="mt-2 p-4 border rounded">
              <p className="text-sm font-semibold">
                Métrica: {analysisResult.meter}
              </p>
              {analysisResult.original_lines.map((line: string, idx: number) => (
                <div key={idx} className="mt-1 p-2 border rounded">
                  <p className="text-sm">
                    Linha {idx + 1}: {line} (Total de sílabas: {analysisResult.word_details[idx].total_syllables})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.word_details[idx].details.map(
                      (
                        detail: {
                          word: string;
                          syllable_breakdown: string;
                          scansion: string;
                          syllable_count: number;
                        },
                        wIdx: number
                      ) => (
                        <div key={wIdx} className="text-xs p-1 border rounded">
                          <div>{detail.word}</div>
                          <div className="font-mono">
                            {detail.syllable_breakdown} ({detail.scansion})
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}