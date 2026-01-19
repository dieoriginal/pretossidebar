"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useSidebar } from "@/hooks/use-sidebar";
import { Sidebar } from "@/components/admin-panel/sidebar";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import jsPDF from "jspdf";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, Plus, Trash2, Eye, FileText, Video, Image } from "lucide-react";
import { analyzeMeter } from "@/lib/analyzeMeter";
import { AddNewVerseInline } from "@/components/admin-panel/estrofes/AddNewVerseInline";

interface FormValues {
  tipo: string;
  forma: string;
  tema: string;
  arquétipo: string;
  apolineo: number;
  dionisíaco: number;
  efeitoDesejado: string[];
  tipoMetrica: string;
  silabasPorLinha: number;
  posicaoCesura: number;
  esquemaRima: string;
  enjambement: number;
  aliteracaoConsoante: string;
  aliteracaoFrequencia: number;
  assonanciaVogal: string;
  assonanciaPadrao: string;
  onomatopeias: string[];
  prologo: string;
  parodos: string;
  episodios: string[];
  exodo: string;
  dicionarioPoetico: Array<{
    termo: string;
    categoria: string;
    significado: string;
  }>;
}

interface Verse {
  id: number;
  words: { text: string; customColor?: string }[];
  tag: string;
  media?: File | string;
  adlib?: string;
  voiceType?: string;
}

type SelectedTab = "figuras" | "engMetrica" | "metrica" | "dramArq" | "lexicon" | "voz";

interface ExtraOptions {
  selectedTab: SelectedTab;
  selectedEngMetrica: string;
  selectedVersoOption: string;
  numeroVersos: number;
  selectedRhymeScheme: string[];
  selectedDramArq: string;
  selectedLexicon: string[];
  selectedVoice: string;
}

type VerseWord = { 
  text: string; 
  customColor?: string;
};

type VerseLine = VerseWord[];
type Strophe = VerseLine[];

interface Option {
  value: string;
  label: string;
}

interface DropdownSelectProps {
  id: string;
  label: string;
  options: Option[];
  onSelect?: (value: string) => void;
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

const initialExtraOptions: ExtraOptions = {
  selectedTab: "figuras",
  selectedEngMetrica: "trocaico",
  selectedVersoOption: "Onossílabo",
  numeroVersos: 4,
  selectedRhymeScheme: ["A", "B", "A", "B"],
  selectedDramArq: "Prólogo",
  selectedLexicon: [],
  selectedVoice: "normal",
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

const shotTypeOptions: Option[] = [
  { value: "highAngle", label: "Plano alto / Ângulo alto - Câmera posicionada acima do sujeito, olhando para baixo. Efeito: Faz o sujeito parecer fraco ou pequeno. Exemplo: Uma criança sendo repreendida por um adulto." },
  { value: "lowAngle", label: "Plano baixo / Ângulo baixo - Câmera posicionada abaixo do sujeito, olhando para cima. Efeito: Faz o sujeito parecer poderoso ou intimidador. Exemplo: Um super-herói em pé antes da ação." },
  { value: "dutchAngle", label: "Plano holandês / Ângulo inclinado - Câmera inclinada para o lado. Efeito: Cria desconforto, tensão ou distorção. Exemplo: Usado em filmes de terror para indicar que algo está errado." },
  { value: "eyeLevel", label: "Ao nível dos olhos - Câmera ao nível dos olhos do sujeito. Efeito: Perspectiva neutra, natural e equilibrada. Exemplo: Uma cena de conversa casual." },
];

const camMovementOptions: Option[] = [
  { value: "zoom", label: "Zoom" },
  { value: "pan", label: "Panorâmica" },
  { value: "tilt", label: "Tilt" },
  { value: "dolly", label: "Travelling" },
];

const resolutionOptions: Option[] = [
  { value: "4k - 120FPS", label: "4K - 120FPS" },
  { value: "4k", label: "4K" },
  { value: "1080p", label: "1080p" },
];

const stabilizationOptions: Option[] = [
  { value: "gimbal", label: "Gimbal" },
  { value: "tripod", label: "Tripé" },
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

const voiceOptions: Option[] = [
  { value: "low", label: "Voz Grave" },
  { value: "normal", label: "Voz Normal" },
  { value: "high", label: "Voz Aguda" },
  { value: "gucci", label: "Estilo Gucci Mane" },
];

const SortableVerseLine: React.FC<{
  id: number;
  verse: Verse;
  onDelete: (id: number) => void;
  onTagChange: (id: number, newTag: string) => void;
  onWordChange: (id: number, newWords: Verse["words"]) => void;
  onWordColorChange: (id: number, index: number, newColor: string) => void;
  onMediaUpload: (id: number, file: File) => void;
  onVoiceChange: (id: number, voice: string) => void;
}> = ({ id, verse, onDelete, onTagChange, onWordChange, onWordColorChange, onMediaUpload, onVoiceChange }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative",
  };

  const bgColorMapping: { [key: string]: string } = {
    A: "#dc2626", B: "#2563eb", C: "#65a30d", D: "#ca8a04",
  };
  const rhymedBgColor = bgColorMapping[verse.tag.toUpperCase()] || "#2563eb";

  const updateWordAtIndex = (index: number, newText: string) => {
    const updatedWords = [...verse.words];
    updatedWords[index] = { ...updatedWords[index], text: newText };
    onWordChange(id, updatedWords);
  };

  const handleInsertWord = (index: number) => {
    const updatedWords = [...verse.words];
    updatedWords.splice(index + 1, 0, { text: "" });
    onWordChange(id, updatedWords);
  };

  const handleRemoveWord = (index: number) => {
    const updatedWords = [...verse.words];
    updatedWords.splice(index, 1);
    onWordChange(id, updatedWords);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onMediaUpload(id, e.target.files[0]);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="border p-2 rounded mb-2">
      <div className="flex items-center gap-2">
        <div {...listeners} {...attributes} className="cursor-move">
          <VerseTag tag={verse.tag} onChange={(newTag) => onTagChange(id, newTag)} />
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <button onClick={() => handleInsertWord(-1)} className="text-green-500 text-xs px-1" title="Inserir palavra no início">
            +
          </button>

          {verse.words.map((wordObj, idx) => (
            <React.Fragment key={idx}>
              <WordTag
                word={wordObj.text}
                color={wordObj.customColor}
                isRhymed={idx === verse.words.length - 1}
                onChange={(newWord) => updateWordAtIndex(idx, newWord)}
                onColorChange={(newColor) => onWordColorChange(id, idx, newColor)}
                onRemove={() => handleRemoveWord(idx)}
                rhymedColor={idx === verse.words.length - 1 ? rhymedBgColor : undefined}
              />
              <button onClick={() => handleInsertWord(idx)} className="text-green-500 text-xs px-1" title="Inserir nova palavra aqui">
                +
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <select
            value={verse.voiceType || "normal"}
            onChange={(e) => onVoiceChange(id, e.target.value)}
            className="border rounded p-1 text-sm"
          >
            {voiceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <label className="cursor-pointer p-1 hover:bg-gray-100 rounded">
            <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
            {verse.media ? (
              verse.media instanceof File ? (
                verse.media.type.startsWith("video") ? (
                  <Video size={16} />
                ) : (
                  <img src={URL.createObjectURL(verse.media)} alt="Reference" className="max-h-44" />
                )
              ) : (
                <span>Mídia carregada</span>
              )
            ) : (
              <Video size={16} className="text-gray-500" />
            )}
          </label>

          <Button variant="ghost" size="icon" onClick={() => onDelete(id)} title="Deletar estrofe">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const WordTag: React.FC<{
  word: string;
  color?: string;
  isRhymed: boolean;
  onChange: (newWord: string) => void;
  onColorChange: (newColor: string) => void;
  onRemove: () => void;
  rhymedColor?: string;
}> = ({ word, color, isRhymed, onChange, onColorChange, onRemove, rhymedColor }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(word);

  const backgroundStyle = color
    ? { backgroundColor: color }
    : isRhymed && rhymedColor
    ? { backgroundColor: rhymedColor }
    : {};

  return (
    <div className="inline-flex items-center m-1 p-1 border rounded dark:text-white" style={backgroundStyle}>
      {isEditing ? (
        <input
          className="bg-transparent outline-none px-1 uppercase font-bold text-sm"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            onChange(value);
          }}
          onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
          autoFocus
        />
      ) : (
        <span onClick={() => setIsEditing(true)} className="px-1 uppercase font-bold text-sm">
          {value || "___"}
        </span>
      )}
      <button onClick={onRemove} className="text-red-500 text-xs ml-1" title="Remover palavra">
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
};

const VerseTag: React.FC<{ tag: string; onChange: (newTag: string) => void }> = ({ tag, onChange }) => {
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
      className={`w-16 text-center items-center py-2 border-2 rounded-full uppercase font-bold ${borderColor} bg-white dark:bg-slate-700 text-black dark:text-white`}
    >
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
      <option value="D">D</option>
    </select>
  );
};

const DropdownSelect: React.FC<DropdownSelectProps> = ({ id, label, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Option | null>(options[0]);

  const handleSelect = (option: Option) => {
    setSelected(option);
    setIsOpen(false);
    if (onSelect) onSelect(option.value);
  };

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-left bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        {selected ? selected.label : "Selecione uma opção"}
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded shadow-lg">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option)}
              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-gray-100"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function DashboardPage() {
  const sidebar = useSidebar();
  const { settings, setSettings } = sidebar;
  const [globalParams] = useState<FormValues>(initialPoeticParams);
  const [cards, setCards] = useState<number[]>([Date.now()]);
  const [allVerses, setAllVerses] = useState<Verse[][]>([]);
  const [activeTab, setActiveTab] = useState("versos");
  const [selectedContexts, setSelectedContexts] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [extraOptions, setExtraOptions] = useState<ExtraOptions>(initialExtraOptions);
  const [fullLyrics, setFullLyrics] = useState<string>("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleVersesUpdate = useCallback((index: number, verses: Verse[]) => {
    setAllVerses((prev) => {
      const newVerses = [...prev];
      newVerses[index] = verses;
      return newVerses;
    });
  }, []);

  const addNewCard = () => setCards((prev) => [...prev, Date.now()]);
  const removeCard = () => setCards((prev) => prev.slice(0, -1));

  const toggleContext = (figureName: string) => {
    setSelectedContexts(prev => 
      prev.includes(figureName)
        ? prev.filter(name => name !== figureName)
        : [...prev, figureName]
    );
  };

  const selectEngMetrica = (tipo: string) => {
    setExtraOptions(prev => ({ ...prev, selectedEngMetrica: tipo }));
  };

  const selectVersoOption = (option: string) => {
    setExtraOptions(prev => ({ ...prev, selectedVersoOption: option }));
  };

  const updateNumeroVersos = (value: number) => {
    setExtraOptions(prev => ({ ...prev, numeroVersos: value }));
  };

  const updateRhymeScheme = (index: number, value: string) => {
    const newScheme = [...extraOptions.selectedRhymeScheme];
    newScheme[index] = value;
    setExtraOptions(prev => ({ ...prev, selectedRhymeScheme: newScheme }));
  };

  const selectDramArq = (option: string) => {
    setExtraOptions(prev => ({ ...prev, selectedDramArq: option }));
  };

  const toggleLexicon = (termo: string) => {
    setExtraOptions(prev => ({
      ...prev,
      selectedLexicon: prev.selectedLexicon.includes(termo)
        ? prev.selectedLexicon.filter(t => t !== termo)
        : [...prev.selectedLexicon, termo]
    }));
  };

  const exportToPDF = (verses: Strophe[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const lineHeight = 10;
    let yPosition = 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0);

    verses.forEach((strophe) => {
      strophe.forEach((verse) => {
        const line = verse.map((word) => word.text.toUpperCase()).join(" ");
        if (yPosition > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 10, yPosition);
        yPosition += lineHeight;
      });
      yPosition += lineHeight;
    });

    doc.save("poema.pdf");
  };

  const handleAddFullLyrics = () => {
    const lines = fullLyrics.split('\n').filter(line => line.trim() !== '');
    const newStrophe = lines.map((line, index) => ({
      id: Date.now() + index,
      words: line.split(' ').map(text => ({ text })),
      tag: ["A", "B", "C", "D"][index % 4],
    }));
    
    setAllVerses(prev => [...prev, newStrophe]);
    setCards(prev => [...prev, Date.now()]);
    setFullLyrics("");
  };

  const handleVerseMediaUpload = (cardIndex: number, verseId: number, file: File) => {
    setAllVerses(prev => prev.map((strophe, idx) => {
      if (idx !== cardIndex) return strophe;
      return strophe.map(verse => {
        if (verse.id !== verseId) return verse;
        return { ...verse, media: file };
      });
    }));
  };

  const handleVoiceChange = (cardIndex: number, verseId: number, voice: string) => {
    setAllVerses(prev => prev.map((strophe, idx) => {
      if (idx !== cardIndex) return strophe;
      return strophe.map(verse => {
        if (verse.id !== verseId) return verse;
        return { ...verse, voiceType: voice };
      });
    }));
  };

  const handleDragEndVerse = (event: DragEndEvent, cardIndex: number) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setAllVerses(prev => {
      const newVerses = [...prev];
      const verses = [...newVerses[cardIndex]];
      const oldIndex = verses.findIndex(v => v.id === active.id);
      const newIndex = verses.findIndex(v => v.id === over.id);
      
      newVerses[cardIndex] = arrayMove(verses, oldIndex, newIndex);
      return newVerses;
    });
  };

  const renderCards = () => {
    switch (activeTab) {
      case "versos":
        return cards.map((cardId, idx) => (
          <div key={cardId} className="border p-4 rounded mb-4 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Estrofe {idx + 1}</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setExtraOptions(prev => ({ ...prev, selectedTab: "figuras" }))}>
                  Figuras
                </Button>
                <Button variant="outline" size="sm" onClick={() => setExtraOptions(prev => ({ ...prev, selectedTab: "engMetrica" }))}>
                  Métrica
                </Button>
                <Button variant="outline" size="sm" onClick={() => setExtraOptions(prev => ({ ...prev, selectedTab: "dramArq" }))}>
                  Arquitetura
                </Button>
                <Button variant="outline" size="sm" onClick={() => setExtraOptions(prev => ({ ...prev, selectedTab: "voz" }))}>
                  Voz
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

              {extraOptions.selectedTab === "voz" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {voiceOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setExtraOptions(prev => ({ ...prev, selectedVoice: option.value }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        extraOptions.selectedVoice === option.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 hover:border-gray-300 bg-white dark:bg-gray-800"
                      }`}
                    >
                      <span className="block font-semibold text-lg mb-2">{option.label}</span>
                      <span className="block text-sm text-gray-500">
                        {option.value === 'gucci' ? "Flow rítmico e marcado" : 
                         option.value === 'low' ? "Tom grave e autoritário" :
                         "Tom natural e claro"}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={(e) => handleDragEndVerse(e, idx)}
              >
                <SortableContext items={allVerses[idx]?.map(v => v.id) || []} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {allVerses[idx]?.map((verse) => (
                      <SortableVerseLine
                        key={verse.id}
                        id={verse.id}
                        verse={verse}
                        onDelete={(id) => handleVersesUpdate(idx, allVerses[idx].filter(v => v.id !== id))}
                        onTagChange={(id, newTag) =>
                          handleVersesUpdate(
                            idx,
                            allVerses[idx].map(v => v.id === id ? { ...v, tag: newTag } : v)
                          )
                        }
                        onWordChange={(id, newWords) =>
                          handleVersesUpdate(
                            idx,
                            allVerses[idx].map(v => v.id === id ? { ...v, words: newWords } : v)
                          )
                        }
                        onWordColorChange={(id, wordIndex, newColor) =>
                          handleVersesUpdate(
                            idx,
                            allVerses[idx].map(v =>
                              v.id === id
                                ? {
                                    ...v,
                                    words: v.words.map((w, i) => 
                                      i === wordIndex ? { ...w, customColor: newColor } : w
                                    )
                                  }
                                : v
                            )
                          )
                        }
                        onMediaUpload={(id, file) => handleVerseMediaUpload(idx, id, file)}
                        onVoiceChange={(id, voice) => handleVoiceChange(idx, id, voice)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <div className="mt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Digite o verso..."
                    className="border p-2 rounded flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const target = e.target as HTMLInputElement;
                        const words = target.value.split(" ").map(text => ({ text }));
                        handleVersesUpdate(idx, [
                          ...(allVerses[idx] || []),
                          {
                            id: Date.now(),
                            words,
                            tag: ["A", "B", "C", "D"][(allVerses[idx]?.length || 0) % 4],
                            voiceType: extraOptions.selectedVoice
                          }
                        ]);
                        target.value = "";
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      const input = document.querySelector(`input[placeholder="Digite o verso..."]`) as HTMLInputElement;
                      const words = input.value.split(" ").map(text => ({ text }));
                      handleVersesUpdate(idx, [
                        ...(allVerses[idx] || []),
                        {
                          id: Date.now(),
                          words,
                          tag: ["A", "B", "C", "D"][(allVerses[idx]?.length || 0) % 4],
                          voiceType: extraOptions.selectedVoice
                        }
                      ]);
                      input.value = "";
                    }}
                  >
                    Adicionar Verso
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ));

      case "pdf":
        return cards.map((cardId, idx) => (
          <div key={cardId} className="border p-4 rounded mb-4">
            <h3 className="text-lg font-semibold">Estrofe {idx + 1}</h3>
            <div className="space-y-2 mt-4">
              {(allVerses[idx] || []).map((verse, verseIdx) => (
                <p key={verseIdx} className="break-words">
                  {verse.words.map((w) => w.text).join(" ")}
                </p>
              ))}
            </div>
          </div>
        ));

      case "cinematografia":
        return allVerses.flat().map((verse) => {
          const verseText = verse.words.map(w => w.text).join(" ");
          return (
            <div key={verse.id} className="border border-gray-200 dark:border-gray-600 p-6 rounded-lg shadow-sm mb-6 bg-white dark:bg-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="block text-gray-700 dark:text-gray-300 mb-2">Conteúdo Mídia</Label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 h-48 flex items-center justify-center">
                    {verse.media ? (
                      verse.media instanceof File ? (
                        verse.media.type.startsWith("video") ? (
                          <video controls className="max-h-44">
                            <source src={URL.createObjectURL(verse.media)} type={verse.media.type} />
                          </video>
                        ) : (
                          <img src={URL.createObjectURL(verse.media)} alt="Reference" className="max-h-44" />
                        )
                      ) : (
                        <span>Mídia carregada</span>
                      )
                    ) : (
                      <span className="text-gray-500">Arraste ou clique para enviar</span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="block text-gray-700 dark:text-gray-300 mb-2">Configurações de Filmagem</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <DropdownSelect
                        id={`shotType-${verse.id}`}
                        label="Tipo de Shot"
                        options={shotTypeOptions}
                      />
                      <DropdownSelect
                        id={`camMovement-${verse.id}`}
                        label="Movimento da Câmera"
                        options={camMovementOptions}
                      />
                      <DropdownSelect
                        id={`resolution-${verse.id}`}
                        label="Resolução"
                        options={resolutionOptions}
                      />
                      <DropdownSelect
                        id={`stabilization-${verse.id}`}
                        label="Estabilização"
                        options={stabilizationOptions}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="block text-gray-700 dark:text-gray-300 mb-2">Localização</Label>
                    <Input type="text" placeholder="Insira a localização" className="w-full" />
                  </div>

                  

                  
                </div>
              </div>
              
              <div className="mt-4 border-t pt-4">
                <Label className="block text-gray-700 dark:text-gray-300 mb-2">Texto do Verso</Label>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                  {verse.words.map((word, idx) => (
                    <span key={idx} style={{ color: word.customColor }} className="uppercase font-bold">
                      {word.text}{" "}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        });

      default:
        return null;
    }
  };

  return (
    <ContentLayout title="Dashboard">
      <AdminPanelLayout rightSidebar={<Sidebar />}>
        <Card className="mb-6 h-[36px] flex items-center justify-center">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="versos">Versificação</TabsTrigger>
                <TabsTrigger value="pdf">Documentação</TabsTrigger>
                <TabsTrigger value="cinematografia">Cinematografia</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {renderCards()}

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                Adicionar Letra Completa
              </Button>
            </DialogTrigger>
            <DialogContent className="min-h-[400px] max-w-[750px]">
              <DialogHeader>
                <DialogTitle className="text-center">Adicionar Letra Completa</DialogTitle>
              </DialogHeader>
              <textarea
                value={fullLyrics}
                onChange={(e) => setFullLyrics(e.target.value)}
                className="w-full h-64 border rounded p-2 font-mono text-sm"
                placeholder="Cole a letra aqui (mantenha quebras de linha)..."
                style={{ resize: "none", whiteSpace: 'pre' }}
              />
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleAddFullLyrics}
                  variant="default"
                  disabled={!fullLyrics.trim()}
                >
                  Aplicar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Card className="sticky bottom-0 bg-background/95 backdrop-blur">
            <CardContent className="pt-6 flex justify-center gap-4 flex-wrap">
              <div className="flex gap-4">
                {activeTab !== "cinematografia" && (
                  <>
                    <Button onClick={addNewCard} variant="default" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar Estrofe
                    </Button>
                    <Button onClick={removeCard} variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Remover Estrofe
                    </Button>
                  </>
                )}
              </div>

              <div className="flex gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Eye className="h-4 w-4" />
                      Pré-visualizar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="min-h-[834px] max-w-[750px]">
                    <DialogHeader>
                      <DialogTitle className="text-center">Pré-visualização do Poema</DialogTitle>
                    </DialogHeader>
                    <div className="bg-white p-8 h-full dark:bg-black">
                      <div className="font-helvetica uppercase text-black dark:text-white text-center space-y-6 text-lg">
                        {allVerses.map((strophe, stropheIndex) => (
                          <div key={stropheIndex} className="space-y-4">
                            {strophe.map((verse, verseIndex) => (
                              <p key={verseIndex} className="break-words">
                                {verse.words.map((word, wordIndex) => (
                                  <span key={wordIndex} style={{ color: word.customColor || "inherit" }}>
                                    {word.text.toUpperCase()}{" "}
                                  </span>
                                ))}
                              </p>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {activeTab === "pdf" && (
                  <Button onClick={() => exportToPDF(allVerses)} variant="secondary" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Exportar PDF
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminPanelLayout>
    </ContentLayout>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z" />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z" />
    </svg>
  );
}

function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path d="M12 9a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5 5 5 0 0 1 5-5 5 5 0 0 1 5 5 5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5" />
    </svg>
  );
}

function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6m-4 5H8m8 4H8m2-8H8" />
    </svg>
  );
}