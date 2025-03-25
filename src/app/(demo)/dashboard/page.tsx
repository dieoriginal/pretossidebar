"use client";

import React, { useState, ChangeEvent } from "react";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/hooks/use-sidebar";
import { Sidebar } from "@/components/admin-panel/sidebar";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
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
  useSortable,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { analyzeMeter } from "@/lib/analyzeMeter";
import { Input } from "@/components/ui/input";

/* ------------------- VerseTag Component -------------------
   Renders a select dropdown with options A, B, C, D.
   The dropdown has increased padding and rounded corners,
   and its border color is determined by the selected tag.
--------------------------------------------------------------- */
function VerseTag({
  tag,
  onChange,
}: {
  tag: string;
  onChange: (newTag: string) => void;
}) {
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
      className={`w-12 text-center text-base px-3 py-2 border-2 ${borderColor} rounded-full`}
    >
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
      <option value="D">D</option>
    </select>
  );
}

/* ------------------- WordTag Component -------------------
   Renders each word as an editable tag.
   • Clicking the text toggles editing.
   • A small color picker is always visible so the user
     can change the background color.
   • If a custom color is set, it overrides the default.
   • For the rhymed (last) word, if no custom color is set,
     it falls back to the VerseTag’s matching color.
------------------------------------------------------------- */
function WordTag({
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
  onChange: (newWord: string) => void;
  onColorChange: (newColor: string) => void;
  rhymedColor?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(word);

  const effectiveColor = color
    ? color
    : isRhymed && rhymedColor
    ? rhymedColor
    : "#e5e7eb"; // Tailwind's gray-200

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      onChange(value);
    }
  };

  return (
    <div
      className="inline-flex items-center m-1 p-1 border rounded cursor-pointer"
      style={{ backgroundColor: effectiveColor }}
    >
      {isEditing ? (
        <input
          className="bg-transparent outline-none px-1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            onChange(value);
          }}
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

/* ------------------- SortableVerseLine Component -------------------
   Renders a draggable verse line. It uses a VerseTag select for
   the label and maps over an array of word objects.
   Each word is rendered as a WordTag. The last word (rhymed) gets a
   background matching the VerseTag’s color if not customized.
------------------------------------------------------------------------- */
function SortableVerseLine({
  id,
  verse,
  onDelete,
  onTagChange,
  onWordChange,
  onWordColorChange,
}: {
  id: number;
  verse: { words: { text: string; customColor?: string }[]; tag: string };
  onDelete: (id: number) => void;
  onTagChange: (id: number, newTag: string) => void;
  onWordChange: (
    id: number,
    newWords: { text: string; customColor?: string }[]
  ) => void;
  onWordColorChange: (
    id: number,
    index: number,
    newColor: string
  ) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : "",
    transition,
  };

  const bgColorMapping: { [key: string]: string } = {
    A: "#ef4444", // red-500
    B: "#3b82f6", // blue-500
    C: "#84cc16", // lime-500
    D: "#eab308", // yellow-500
  };
  const rhymedBgColor =
    bgColorMapping[verse.tag.toUpperCase()] || "#3b82f6"; // default blue

  const updateWordAtIndex = (index: number, newText: string) => {
    const updatedWords = [...verse.words];
    updatedWords[index] = { ...updatedWords[index], text: newText };
    onWordChange(id, updatedWords);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between border p-2 rounded"
    >
      <div className="flex items-center gap-2">
        <div {...listeners} {...attributes} className="cursor-move">
          <VerseTag
            tag={verse.tag}
            onChange={(newTag) => onTagChange(id, newTag)}
          />
        </div>
        <div className="flex flex-wrap">
          {verse.words.map((wordObj, idx) => (
            <WordTag
              key={idx}
              word={wordObj.text}
              color={wordObj.customColor}
              isRhymed={idx === verse.words.length - 1}
              onChange={(newWord) => updateWordAtIndex(idx, newWord)}
              onColorChange={(newColor) => onWordColorChange(id, idx, newColor)}
              rhymedColor={
                idx === verse.words.length - 1 ? rhymedBgColor : undefined
              }
            />
          ))}
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onDelete(id)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

/* ------------------- AddNewVerseInline Component -------------------
   Renders an inline input. When the user presses Enter,
   the input text is split into words and saved as an array of word objects.
------------------------------------------------------------------------- */
function AddNewVerseInline({
  addNewVerse,
}: {
  addNewVerse: (words: { text: string; customColor?: string }[]) => void;
}) {
  const [verseText, setVerseText] = useState("");
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && verseText.trim() !== "") {
      const words = verseText
        .split(" ")
        .filter((w) => w.length > 0)
        .map((w) => ({ text: w }));
      addNewVerse(words);
      setVerseText("");
    }
  };

  return (
    <input
      type="text"
      value={verseText}
      onChange={(e) => setVerseText(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Digite o verso e pressione Enter"
      className="border p-2 rounded w-full"
    />
  );
}

/* ------------------- VerseCard Component -------------------
   Manages an array of verses. Each verse now has:
     - words: an array of { text, customColor }
     - tag: a letter (A, B, C, or D)
   New verses get their default tag by cycling through A, B, C, D.
----------------------------------------------------------------- */
function VerseCard({ index }: { index: number }) {
  const [verses, setVerses] = useState<
    { id: number; words: { text: string; customColor?: string }[]; tag: string }[]
  >([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
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
    const newVerse = { id: Date.now(), words, tag: newTag };
    setVerses((prev) => [...prev, newVerse]);
  };

  const deleteVerse = (id: number) => {
    setVerses((prev) => prev.filter((v) => v.id !== id));
  };

  const updateVerseWords = (
    id: number,
    newWords: { text: string; customColor?: string }[]
  ) => {
    setVerses((prev) =>
      prev.map((v) => (v.id === id ? { ...v, words: newWords } : v))
    );
  };

  const updateVerseTag = (id: number, newTag: string) => {
    setVerses((prev) =>
      prev.map((v) => (v.id === id ? { ...v, tag: newTag } : v))
    );
  };

  const updateWordColor = (
    id: number,
    index: number,
    newColor: string
  ) => {
    setVerses((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const updatedWords = [...v.words];
          updatedWords[index] = {
            ...updatedWords[index],
            customColor: newColor,
          };
          return { ...v, words: updatedWords };
        }
        return v;
      })
    );
  };

  async function handleAnalyze() {
    const lines = verses.map((verse) =>
      verse.words.map((w) => w.text).join(" ")
    );
    try {
      const result = await analyzeMeter(lines);
      setAnalysisResult(result);
      setShowAnalysis(true);
    } catch (error) {
      console.error("Error analyzing meter:", error);
    }
  }

  return (
    <div className="border p-4 rounded mb-4">
      <h2 className="text-xl font-bold mb-2">Estrofe {index}</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <SortableContext
          items={verses.map((v) => v.id)}
          strategy={verticalListSortingStrategy}
        >
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
          <Button onClick={handleAnalyze} className="bg-green-500 text-white">
            Analyze Meter
          </Button>
          {showAnalysis && (
            <Button
              onClick={() => {
                setShowAnalysis(false);
                setAnalysisResult(null);
              }}
              className="bg-red-500 text-white"
            >
              Hide Meter
            </Button>
          )}
        </div>
        {showAnalysis && analysisResult && (
          <div className="mt-2">
            <p className="text-sm font-semibold">
              Meter: {analysisResult.meter}
            </p>
            {analysisResult.original_lines.map((line: string, idx: number) => (
              <div key={idx} className="mt-1 p-2 border rounded">
                <p className="text-sm">
                  Line {idx + 1}: {line} (Total syllables:{" "}
                  {analysisResult.word_details[idx].total_syllables})
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
  );
}

/* ------------------- DashboardPage Component -------------------
   Manages multiple stanzas (VerseCards).
------------------------------------------------------------------- */
export default function DashboardPage() {
  const sidebar = useSidebar();
  if (!sidebar) return <div>Loading...</div>;
  const { settings, setSettings } = sidebar;
  const [cards, setCards] = useState<number[]>([Date.now()]);
  const addNewCard = () => {
    setCards((prev) => [...prev, Date.now()]);
  };
  const removeCard = () => {
    setCards((prev) => (prev.length ? prev.slice(0, prev.length - 1) : prev));
  };

  return (
    <ContentLayout title="Dashboard">
      <AdminPanelLayout rightSidebar={<Sidebar />}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Versificaçao</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <TooltipProvider>
          <div className="flex gap-6 mt-6">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-hover-open"
                    onCheckedChange={(x) => setSettings({ isHoverOpen: x })}
                    checked={settings.isHoverOpen}
                  />
                  <Label htmlFor="is-hover-open">Abertura Subtíl</Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Quando encostares o Mouse à esquerda, a barra de lado
                  mostrar-se-á.
                </p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="disable-sidebar"
                    onCheckedChange={(x) => setSettings({ disabled: x })}
                    checked={settings.disabled}
                  />
                  <Label htmlFor="disable-sidebar">Desativar Sidebar</Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Esconder a sidebar</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        <div className="pt-4 gap-4">
          {cards.map((cardId, idx) => (
            <VerseCard key={cardId} index={idx + 1} />
          ))}
          <div className="flex justify-center gap-4">
            <Button onClick={addNewCard} className="bg-blue-500 text-white">
              Add New Estrofe
            </Button>
            <Button onClick={removeCard} className="bg-red-500 text-white">
              Remove Last Estrofe
            </Button>
          </div>
        </div>
      </AdminPanelLayout>
    </ContentLayout>
  );
}
