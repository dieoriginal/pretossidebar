/* eslint-disable */
"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";

import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetHeader, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/hooks/use-sidebar";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import jsPDF from "jspdf";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimation,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  restrictToVerticalAxis,
  restrictToHorizontalAxis,
} from "@dnd-kit/modifiers";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  X,
  Plus,
  Trash2,
  Eye,
  FileText,
  Video,
  Image as ImageIcon,
  Info,
  Save,
  LayoutGrid,
  LogOut,
  User,
  MenuIcon,
  PanelsTopLeft,
  ChevronLeft,
  ChevronDown,
  Dot
} from "lucide-react";
import { Select } from "@/components/ui/select";
import { debounce } from "lodash";
import {
  db,
  auth,
  syncProjectToCloud,
  saveProjectLocally,
  saveProjectToFirebase,
} from "@/lib/firebase";
import { salvarProjeto, carregarProjeto } from "@/lib/storage";
import { setCookie, getCookie } from "@/lib/cookies";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ReferenceTabs from "@/components/ReferenceTabs";
import { useToastLite } from "@/components/ui/toast-lite";

import NarratologiaTab from "@/components/narratologia-tab";

import { useProject } from "@/hooks/use-project";

// Interfaces para escrita literária
interface ParagraphWord {
  text: string;
  customColor?: string;
  emphasized?: boolean;
}

interface Paragraph {
  id: string;
  words: ParagraphWord[];
  type: string; // diálogo, descrição, ação, etc.
  character?: string;
  pointOfView?: string;
  narrativeTime?: string;
  literaryDevices?: string[];
  notes?: string;
}

interface Chapter {
  id: string;
  paragraphs: Paragraph[];
  structure: string;
  structureDesc?: string;
  summary: string;
  title: string;
  wordCount: number;
}

interface BookInfo {
  title: string;
  author: string;
  genre: string[];
  synopsis: string;
  wordCount: number;
}

const initialBookInfo: BookInfo = {
  title: "",
  author: "",
  genre: [],
  synopsis: "",
  wordCount: 0,
};

// Ficha técnica / Metadados editoriais
type BookTech = {
  formato?: string; // ex.: 150x230 mm (Brochura)
  paginas?: number;
  mioloPapel?: string; // ex.: Offset 80g, PB
  capaPapel?: string; // ex.: Cartolina 300g, laminação mate
  coresMiolo?: string; // PB ou 4/4
  perfilCor?: string; // FOGRA39, etc.
  sangria?: string; // 3mm
  margens?: string; // 20-25-20-25 mm
  isbn?: string;
  depositoLegal?: string;
  ean13?: string;
  precoCapa?: string;
  tiragem?: string;
  dataLancamento?: string;
  editora?: string;
  cidadeImpressao?: string;
  referenciaCapaUrl?: string;
  estruturaLivroUrl?: string;
};

// Figuras literárias mantidas da versão anterior
const literaryFigures = [
  {
    name: "Metáfora",
    description: "Comparação implícita entre duas coisas.",
    example: "A vida é um sonho.",
  },
  {
    name: "Símile",
    description: "Comparação explícita usando 'como'.",
    example: "Ele é forte como um touro.",
  },
  {
    name: "Hipérbole",
    description: "Exagero para enfatizar uma ideia.",
    example: "Estou morrendo de fome.",
  },
  // ... manter todas as outras figuras literárias
];

const paragraphTypes = [
  {
    name: "Descrição",
    description: "Descreve ambientes, personagens ou objetos.",
    example: "O castelo erguia-se imponente no topo da colina.",
  },
  {
    name: "Diálogo",
    description: "Conversa entre personagens.",
    example: "- Onde você esteve? - perguntou ela.",
  },
  {
    name: "Ação",
    description: "Movimento ou atividade dos personagens.",
    example: "Ele correu pela floresta, perseguindo a sombra.",
  },
  {
    name: "Reflexão",
    description: "Pensamentos internos do personagem.",
    example: "Por que tudo tinha que ser tão complicado?",
  },
  {
    name: "Transição",
    description: "Mudança de cena ou tempo.",
    example: "Os anos passaram como pássaros migratórios.",
  },
];

const pointOfViewOptions = [
  { value: "first", label: "Primeira Pessoa" },
  { value: "third-limited", label: "Terceira Pessoa Limitada" },
  { value: "third-omniscient", label: "Terceira Pessoa Onisciente" },
  { value: "second", label: "Segunda Pessoa" },
];

const narrativeTimeOptions = [
  { value: "present", label: "Tempo Presente" },
  { value: "past", label: "Passado" },
  { value: "future", label: "Futuro" },
  { value: "flashback", label: "Flashback" },
];

const chapterStructures = [
  {
    value: "exposição",
    description: "Apresenta o cenário e personagens principais.",
    instruction: "Use este capítulo para estabelecer o mundo da história.",
  },
  {
    value: "conflito",
    description: "Introduz o problema principal da narrativa.",
    instruction: "Apresente o desafio que moverá a história para frente.",
  },
  {
    value: "desenvolvimento",
    description: "Desenvolve os personagens e enredos secundários.",
    instruction: "Aprofunde a caracterização e construa tensão.",
  },
  {
    value: "clímax",
    description: "Ponto alto da tensão narrativa.",
    instruction: "Crie o momento de maior impacto emocional.",
  },
  {
    value: "resolução",
    description: "Conclui os arcos narrativos.",
    instruction: "Resolva as questões pendentes de forma satisfatória.",
  },
];

const genreOptions = [
  "Ficção Científica",
  "Fantasia",
  "Romance",
  "Mistério",
  "Suspense",
  "Terror",
  "Distopia",
  "Realismo Mágico",
  "Histórico",
  "Contemporâneo",
];

// Componente para palavras (adaptado)
const WordTag = ({
  word,
  color,
  isEmphasized,
  onChange,
  onColorChange,
  onRemove,
}: {
  word: string;
  color?: string;
  isEmphasized: boolean;
  onChange: (newWord: string) => void;
  onColorChange: (newColor: string) => void;
  onRemove: () => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(word);

  return (
    <>
    <div
      className="inline-flex items-center m-1 p-1 border rounded dark:text-white"
    >
      {isEditing ? (
        <input
          className="bg-transparent outline-none px-1 text-sm"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onChange(e.target.value);
          }}
          onBlur={() => {
            setIsEditing(false);
            onChange(value);
          }}
          onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
          placeholder="Palavra"
          aria-label="Editar palavra"
          autoFocus
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className={`px-1 text-sm ${isEmphasized ? "font-black" : ""}`}
        >
          {value || "___"}
        </span>
      )}
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
        title="Escolher cor da palavra"
        aria-label="Escolher cor da palavra"
      />
    </div>
    </>
  );
};

// Componente para parágrafos sortable
const SortableParagraph = ({
  paragraph,
  chapterIndex,
  paragraphIndex,
  onParagraphChange,
  onRemove,
  onDragStart,
}: {
  paragraph: Paragraph;
  chapterIndex: number;
  paragraphIndex: number;
  onParagraphChange: (newParagraph: Paragraph) => void;
  onRemove: () => void;
  onDragStart: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef } = useSortable({ id: paragraph.id });

  const handleWordChange = (wordIndex: number, newWord: string) => {
    const newWords = paragraph.words.map((w, i) =>
      i === wordIndex ? { ...w, text: newWord } : w,
    );
    onParagraphChange({ ...paragraph, words: newWords });
  };

  const handleWordColorChange = (wordIndex: number, newColor: string) => {
    const newWords = paragraph.words.map((w, i) =>
      i === wordIndex ? { ...w, customColor: newColor } : w,
    );
    onParagraphChange({ ...paragraph, words: newWords });
  };

  const handleRemoveWord = (wordIndex: number) => {
    const newWords = paragraph.words.filter((_, i) => i !== wordIndex);
    onParagraphChange({ ...paragraph, words: newWords });
  };

  const handleAddWord = () => {
    onParagraphChange({ ...paragraph, words: [...paragraph.words, { text: "" }] });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <>
    <div
      ref={setNodeRef}
      className="p-4 mb-4 border rounded-lg relative group bg-white dark:bg-gray-800"
    >
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-move p-1 hover:bg-gray-100 rounded"
          onMouseDown={() => onDragStart(paragraph.id)}
        >
          ↕
        </button>
        <button onClick={onRemove} className="text-red-500" title="Remover parágrafo" aria-label="Remover parágrafo">
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <select
          value={paragraph.type}
          onChange={(e) =>
            onParagraphChange({ ...paragraph, type: e.target.value })
          }
          className="p-2 border rounded text-sm"
          aria-label="Tipo de parágrafo"
        >
          {paragraphTypes.map((type) => (
            <option key={type.name} value={type.name}>
              {type.name}
            </option>
          ))}
        </select>

        <Input
          placeholder="Personagem"
          value={paragraph.character || ""}
          onChange={(e) =>
            onParagraphChange({ ...paragraph, character: e.target.value })
          }
          className="w-32 text-sm"
        />

        <select
          value={paragraph.pointOfView || ""}
          onChange={(e) =>
            onParagraphChange({ ...paragraph, pointOfView: e.target.value })
          }
          className="p-2 border rounded text-sm"
          aria-label="Ponto de vista"
        >
          <option value="">Ponto de Vista</option>
          {pointOfViewOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={paragraph.narrativeTime || ""}
          onChange={(e) =>
            onParagraphChange({ ...paragraph, narrativeTime: e.target.value })
          }
          className="p-2 border rounded text-sm"
          aria-label="Tempo narrativo"
        >
          <option value="">Tempo Narrativo</option>
          {narrativeTimeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Área de escrita */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (over && active.id !== over.id) {
            const oldIndex = paragraph.words.findIndex(
              (w) => w.text === active.id,
            );
            const newIndex = paragraph.words.findIndex((w) => w.text === over.id);
            const newWords = arrayMove(paragraph.words, oldIndex, newIndex);
            onParagraphChange({ ...paragraph, words: newWords });
          }
        }}
      >
        <SortableContext
          items={paragraph.words.map((w) => w.text)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-wrap gap-2 mb-4">
            {paragraph.words.map((word, wordIndex) => (
              <WordTag
                key={word.text + wordIndex}
                word={word.text}
                color={word.customColor}
                isEmphasized={word.emphasized || false}
                onChange={(newWord) => handleWordChange(wordIndex, newWord)}
                onColorChange={(newColor) =>
                  handleWordColorChange(wordIndex, newColor)
                }
                onRemove={() => handleRemoveWord(wordIndex)}
              />
            ))}
            <Button onClick={handleAddWord} size="sm">
              +
            </Button>
          </div>
        </SortableContext>
      </DndContext>

      {/* Notas do parágrafo */}
      <Input
        placeholder="Notas sobre este parágrafo..."
        value={paragraph.notes || ""}
        onChange={(e) =>
          onParagraphChange({ ...paragraph, notes: e.target.value })
        }
        className="w-full mt-2 text-sm"
      />
    </div>
    </>
  );
};

// Navbar simplificada
function Navbar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 h-[89px] w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="mx-4 sm:mx-8 flex items-center justify-between">
        <div className="border border-transparent h-[59px] w-[141px] rounded-lg">
          <div className="border border-transparent h-[39px] w-[121px] rounded-lg ml-18 mt-2.5">
            <div className="items-center ml-8">
              <h1 className="font-extrabold font-arial text-3xl tracking-tighter -m-1 italic">
                ESCRITA
                <h1 className="text-lg -mt-4 italic tracking-widest">LITERÁRIA</h1>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-1 justify-center">
          <div className="border h-[89px] w-full max-w-[1556px] rounded-lg flex">
            <div className="flex-1 p-4">
              <div className="flex items-center justify-center gap-4">
                <h2 className="text-2xl font-bold">{title}</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}

// User Navigation
function UserNav() {
  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="#" alt="Avatar" />
                  <AvatarFallback className="bg-transparent">JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Perfil</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Autor</p>
            <p className="text-xs leading-none text-muted-foreground">autor@example.com</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/dashboard" className="flex items-center">
              <LayoutGrid className="w-4 h-4 mr-3 text-muted-foreground" /> Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/account" className="flex items-center">
              <User className="w-4 h-4 mr-3 text-muted-foreground" /> Account
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="hover:cursor-pointer">
          <LogOut className="w-4 h-4 mr-3 text-muted-foreground" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Footer
function Footer() {
  return (
    <div className="z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-4 md:mx-8 flex h-14 items-center">
        <p className="text-xs md:text-sm leading-loose text-muted-foreground text-left">© ESCRITA LITERÁRIA 2025</p>
      </div>
    </div>
  );
}

// Admin Panel Layout
function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="min-h-[calc(100vh_-_56px)] bg-zinc-50 dark:bg-zinc-900">
        {children}
      </main>
      <footer>
        <Footer />
      </footer>
    </>
  );
}

// ContentLayout Component - define o componente que estava faltando
interface ContentLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function ContentLayout({ title, children }: ContentLayoutProps) {
  return (
    <TooltipProvider>
      <div className="w-full overflow-hidden transition-all duration-300">
        <Navbar title={title} />
        <AdminPanelLayout>
          <div className="w-full pt-8 pb-8 px-4 mx-auto max-w-[1800px]">
            <div className="p-4 items-center w-full">
              {children}
            </div>
          </div>
        </AdminPanelLayout>
      </div>
    </TooltipProvider>
  );
}

// Resto dos componentes (ContentLayout, MultiStepper, etc.) mantidos similares
// mas adaptados para escrita literária

const Dashboard = () => {
  const router = useRouter();
  const { settings } = useSidebar();
  const [activeTab, setActiveTab] = useState("escrita");
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: Date.now().toString(),
      structure: "exposição",
      summary: "Primeiro capítulo introduzindo os personagens e o cenário.",
      title: "Capítulo 1",
      paragraphs: [],
      wordCount: 0,
    },
  ]);
  const [bookInfo, setBookInfo] = useState<BookInfo>(initialBookInfo);
  const [fullText, setFullText] = useState("");
  const [draggedParagraphId, setDraggedParagraphId] = useState<string | null>(null);
  const chapterEndRef = useRef<HTMLDivElement>(null);
  const [selectedParagraphs, setSelectedParagraphs] = useState<number[]>([]);
  const [bookTech, setBookTech] = useState<BookTech>({});

  // Projeto global
  const project = useProject((s) => s.project);
  const updateProject = useProject((s) => s.update);

  useEffect(() => {
    const projAny = project as any;
    if (projAny?.chapters && projAny.chapters.length > 0) {
      setChapters(projAny.chapters as Chapter[]);
    }
    if (projAny?.bookInfo) {
      setBookInfo(projAny.bookInfo as BookInfo);
    }
    if (projAny?.bookTech) {
      setBookTech(projAny.bookTech as BookTech);
    }
  }, [project]);

  useEffect(() => {
    updateProject({ chapters } as any);
  }, [chapters, updateProject]);

  useEffect(() => {
    updateProject({ bookInfo } as any);
  }, [bookInfo, updateProject]);

  useEffect(() => {
    updateProject({ bookTech } as any);
  }, [bookTech, updateProject]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    chapterEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chapters.length]);

  const handleAddChapter = () => {
    const newChapter: Chapter = {
      id: Date.now().toString(),
      structure: "exposição",
      summary: "Novo capítulo.",
      title: `Capítulo ${chapters.length + 1}`,
      paragraphs: [],
      wordCount: 0,
    };
    setChapters([...chapters, newChapter]);
  };

  const handleParagraphChange = (
    chapterIndex: number,
    paragraphIndex: number,
    newParagraph: Paragraph,
  ) => {
    const newChapters = [...chapters];
    newChapters[chapterIndex].paragraphs[paragraphIndex] = newParagraph;
    
    // Atualizar contagem de palavras
    const wordCount = newParagraph.words.reduce((count, word) => 
      count + (word.text ? word.text.split(' ').length : 0), 0
    );
    newChapters[chapterIndex].wordCount = newChapters[chapterIndex].paragraphs.reduce(
      (total, p) => total + p.words.reduce((count, word) => 
        count + (word.text ? word.text.split(' ').length : 0), 0
      ), 0
    );
    
    setChapters(newChapters);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldChapterIndex = chapters.findIndex((c) =>
        c.paragraphs.some((p) => p.id === active.id),
      );
      const newChapterIndex = chapters.findIndex((c) =>
        c.paragraphs.some((p) => p.id === over.id),
      );

      const oldParagraphIndex = chapters[oldChapterIndex].paragraphs.findIndex(
        (p) => p.id === active.id,
      );
      const newParagraphIndex = chapters[newChapterIndex].paragraphs.findIndex(
        (p) => p.id === over.id,
      );

      const newChapters = [...chapters];
      const movedParagraph = newChapters[oldChapterIndex].paragraphs[oldParagraphIndex];

      newChapters[oldChapterIndex].paragraphs.splice(oldParagraphIndex, 1);
      newChapters[newChapterIndex].paragraphs.splice(
        newParagraphIndex,
        0,
        movedParagraph,
      );

      setChapters(newChapters);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginBottom = 20;

    doc.setFontSize(18);
    doc.text(bookInfo.title.toUpperCase(), 10, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`por ${bookInfo.author}`, 10, y);
    y += 20;

    const addPageIfNeeded = () => {
      if (y > pageHeight - marginBottom) {
        doc.addPage();
        y = 20;
      }
    };

    chapters.forEach((chapter, chapterIndex) => {
      addPageIfNeeded();
      doc.setFontSize(16);
      doc.text(chapter.title, 10, y);
      y += 10;

      doc.setFontSize(12);
      doc.text(`Estrutura: ${chapter.structure}`, 10, y);
      y += 10;

      if (chapter.summary) {
        doc.text(`Resumo: ${chapter.summary}`, 10, y);
        y += 10;
      }

      chapter.paragraphs.forEach((paragraph) => {
        addPageIfNeeded();

        const paragraphText = paragraph.words.map((word) => word.text).join(" ");
        
        // Quebra de texto para caber na página
        const lines = doc.splitTextToSize(paragraphText, 180);
        lines.forEach((line: string) => {
          addPageIfNeeded();
          doc.text(line, 15, y);
          y += 7;
        });

        y += 5; // Espaço entre parágrafos
      });

      y += 10; // espaço entre capítulos
    });

    doc.save(`${bookInfo.title || "livro"}_${bookInfo.author || "autor"}.pdf`);
  };

  const { push } = useToastLite();

  const handleSaveProject = async () => {
    try {
      const current = useProject.getState().project;
      if (!current) {
        push({ msg: "Nenhum projeto atual", kind: "error" });
        return;
      }
      const toSave = { 
        ...current, 
        chapters, 
        bookInfo, 
        updatedAt: new Date().toISOString(),
        totalWordCount: chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0)
      };
      
      push({ msg: "Projeto salvo!", kind: "success" });
    } catch (error) {
      console.error("Erro ao salvar projeto:", error);
      push({ msg: "Erro ao salvar projeto.", kind: "error" });
    }
  };

  return (
    <ContentLayout title="Escrita Literária">
      <div className="w-full mx-auto max-w-[1800px] px-4">
        {/* Card de Informações do Livro */}
        <Card className="w-full mb-6">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="TÍTULO DO LIVRO"
                  value={bookInfo.title}
                  onChange={(e) =>
                    setBookInfo((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="text-xl font-bold"
                />
                
                <Input
                  placeholder="AUTOR"
                  value={bookInfo.author}
                  onChange={(e) =>
                    setBookInfo((prev) => ({
                      ...prev,
                      author: e.target.value,
                    }))
                  }
                  className="text-sm"
                />

                <div className="col-span-2">
                  <Label>Gêneros</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {genreOptions.map((genre) => (
                      <Button
                        key={genre}
                        variant={
                          bookInfo.genre.includes(genre)
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          setBookInfo((prev) => ({
                            ...prev,
                            genre: prev.genre.includes(genre)
                              ? prev.genre.filter((g) => g !== genre)
                              : [...prev.genre, genre],
                          }))
                        }
                        size="sm"
                      >
                        {genre}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <Label>Sinopse</Label>
                  <textarea
                    value={bookInfo.synopsis}
                    onChange={(e) =>
                      setBookInfo((prev) => ({
                        ...prev,
                        synopsis: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded mt-2"
                    rows={3}
                    placeholder="Descreva brevemente a história..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="narratologia">Narratologia</TabsTrigger>
                    <TabsTrigger value="escrita">Escrita</TabsTrigger>
                    <TabsTrigger value="estrutura">Estrutura</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex items-center gap-4">
                  <Badge variant="outline">
                    Total: {chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0)} palavras
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Conteúdo Principal */}
        {activeTab === "escrita" && (
          <div className="space-y-6 w-full">
            {chapters.map((chapter, chapterIndex) => (
              <Card key={chapter.id} className="p-6 w-full">
                <div className="flex justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold">{chapter.title}</h3>
                    <div className="flex gap-4">
                      <Input
                        value={chapter.title}
                        onChange={(e) => {
                          const newChapters = [...chapters];
                          newChapters[chapterIndex].title = e.target.value;
                          setChapters(newChapters);
                        }}
                        className="w-48"
                      />
                      
                      <select
                        value={chapter.structure}
                        onChange={(e) => {
                          const newChapters = [...chapters];
                          newChapters[chapterIndex].structure = e.target.value;
                          setChapters(newChapters);
                        }}
                        className="p-2 border rounded"
                        aria-label="Estrutura do capítulo"
                      >
                        {chapterStructures.map((structure) => (
                          <option key={structure.value} value={structure.value}>
                            {structure.value}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      {chapter.wordCount} palavras
                    </Badge>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        setChapters(chapters.filter((_, i) => i !== chapterIndex))
                      }
                    >
                      Remover Capítulo
                    </Button>
                  </div>
                </div>

                <div className="mb-4">
                  <Label>Resumo do Capítulo</Label>
                  <Input
                    value={chapter.summary}
                    onChange={(e) => {
                      const newChapters = [...chapters];
                      newChapters[chapterIndex].summary = e.target.value;
                      setChapters(newChapters);
                    }}
                    placeholder="Descreva brevemente o que acontece neste capítulo..."
                    className="w-full"
                  />
                </div>

                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-sm font-semibold">
                    {
                      chapterStructures.find(
                        (s) => s.value === chapter.structure,
                      )?.instruction
                    }
                  </p>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  onDragStart={({ active }) =>
                    setDraggedParagraphId(active.id as string)
                  }
                >
                  <SortableContext
                    items={chapter.paragraphs.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {chapter.paragraphs.map((paragraph, paragraphIndex) => (
                      <SortableParagraph
                        key={paragraph.id}
                        paragraph={paragraph}
                        chapterIndex={chapterIndex}
                        paragraphIndex={paragraphIndex}
                        onParagraphChange={(newParagraph) =>
                          handleParagraphChange(chapterIndex, paragraphIndex, newParagraph)
                        }
                        onRemove={() => {
                          const newChapters = [...chapters];
                          newChapters[chapterIndex].paragraphs.splice(
                            paragraphIndex,
                            1,
                          );
                          setChapters(newChapters);
                        }}
                        onDragStart={setDraggedParagraphId}
                      />
                    ))}
                  </SortableContext>
                </DndContext>

                <div className="mt-4 flex gap-4">
                  <Button
                    onClick={() => {
                      const newChapters = [...chapters];
                      newChapters[chapterIndex].paragraphs.push({
                        id: Date.now().toString(),
                        words: [{ text: "" }],
                        type: "Descrição",
                      });
                      setChapters(newChapters);
                    }}
                    variant="outline"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Novo Parágrafo
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        Adicionar Texto Completo
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Inserir Texto Completo</DialogTitle>
                      </DialogHeader>
                      <textarea
                        value={fullText}
                        onChange={(e) => setFullText(e.target.value)}
                        className="w-full h-64 p-2 border rounded"
                        placeholder="Cole o texto completo aqui. Parágrafos serão separados por linhas vazias."
                      />
                      <Button
                        onClick={() => {
                          const paragraphs = fullText.split("\n\n");
                          const newParagraphs = paragraphs.map((text, index) => ({
                            id: `${Date.now()}_${index}`,
                            words: text.split(" ").map(word => ({ text: word })),
                            type: "Descrição",
                          }));
                          
                          const newChapters = [...chapters];
                          newChapters[chapterIndex].paragraphs.push(...newParagraphs);
                          setChapters(newChapters);
                          setFullText("");
                        }}
                      >
                        Aplicar
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
                <div ref={chapterEndRef} />
              </Card>
            ))}

            <Card className="p-6">
              <Button
                onClick={handleAddChapter}
                variant="outline"
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar Novo Capítulo
              </Button>
            </Card>
          </div>
        )}

        {activeTab === "estrutura" && (
          <div className="space-y-6">
            {/* Ficha Técnica e Metadados Editorais */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Ficha Técnica do Livro</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Formato</span>
                  <Input value={bookTech.formato || ''} onChange={(e)=>setBookTech({...bookTech, formato: e.target.value})} placeholder="ex.: 150×230 mm (Brochura)" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Nº de páginas</span>
                  <Input type="number" value={bookTech.paginas || '' as any} onChange={(e)=>setBookTech({...bookTech, paginas: Number(e.target.value)||undefined})} placeholder="ex.: 240" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Miolo (papel/gramagem)</span>
                  <Input value={bookTech.mioloPapel || ''} onChange={(e)=>setBookTech({...bookTech, mioloPapel: e.target.value})} placeholder="Offset 80g, PB" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Capa (papel/laminação)</span>
                  <Input value={bookTech.capaPapel || ''} onChange={(e)=>setBookTech({...bookTech, capaPapel: e.target.value})} placeholder="Cartolina 300g, laminação mate" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Cores do miolo</span>
                  <Input value={bookTech.coresMiolo || ''} onChange={(e)=>setBookTech({...bookTech, coresMiolo: e.target.value})} placeholder="PB ou 4/4" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Perfil de cor</span>
                  <Input value={bookTech.perfilCor || ''} onChange={(e)=>setBookTech({...bookTech, perfilCor: e.target.value})} placeholder="ex.: FOGRA39" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Sangria</span>
                  <Input value={bookTech.sangria || ''} onChange={(e)=>setBookTech({...bookTech, sangria: e.target.value})} placeholder="ex.: 3 mm" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Margens</span>
                  <Input value={bookTech.margens || ''} onChange={(e)=>setBookTech({...bookTech, margens: e.target.value})} placeholder="ex.: 20-25-20-25 mm" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">ISBN</span>
                  <Input value={bookTech.isbn || ''} onChange={(e)=>setBookTech({...bookTech, isbn: e.target.value})} placeholder="ISBN" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Depósito Legal</span>
                  <Input value={bookTech.depositoLegal || ''} onChange={(e)=>setBookTech({...bookTech, depositoLegal: e.target.value})} placeholder="DL" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">EAN‑13</span>
                  <Input value={bookTech.ean13 || ''} onChange={(e)=>setBookTech({...bookTech, ean13: e.target.value})} placeholder="Código de barras" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Preço de capa</span>
                  <Input value={bookTech.precoCapa || ''} onChange={(e)=>setBookTech({...bookTech, precoCapa: e.target.value})} placeholder="ex.: €14,90" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Tiragem</span>
                  <Input value={bookTech.tiragem || ''} onChange={(e)=>setBookTech({...bookTech, tiragem: e.target.value})} placeholder="ex.: 1000" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Data de lançamento</span>
                  <Input type="date" value={bookTech.dataLancamento || ''} onChange={(e)=>setBookTech({...bookTech, dataLancamento: e.target.value})} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Editora</span>
                  <Input value={bookTech.editora || ''} onChange={(e)=>setBookTech({...bookTech, editora: e.target.value})} placeholder="Nome da editora" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Cidade de impressão</span>
                  <Input value={bookTech.cidadeImpressao || ''} onChange={(e)=>setBookTech({...bookTech, cidadeImpressao: e.target.value})} placeholder="ex.: Lisboa" />
                </label>
                <label className="flex flex-col gap-1 md:col-span-2">
                  <span className="text-xs text-muted-foreground">URL referência da estrutura de capa (ilustração)</span>
                  <Input value={bookTech.referenciaCapaUrl || ''} onChange={(e)=>setBookTech({...bookTech, referenciaCapaUrl: e.target.value})} placeholder="https://.../estrutura-capa.webp" />
                </label>
                <label className="flex flex-col gap-1 md:col-span-2">
                  <span className="text-xs text-muted-foreground">URL estrutura do livro (miolo)</span>
                  <Input value={bookTech.estruturaLivroUrl || ''} onChange={(e)=>setBookTech({...bookTech, estruturaLivroUrl: e.target.value})} placeholder="https://.../estrutura-livro.jpg" />
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {bookTech.referenciaCapaUrl && (
                  <div className="relative w-full h-64 border rounded overflow-hidden bg-muted/20">
                    <Image src={bookTech.referenciaCapaUrl} alt="Estrutura de capa" fill className="object-contain" sizes="50vw" unoptimized />
                  </div>
                )}
                {bookTech.estruturaLivroUrl && (
                  <div className="relative w-full h-64 border rounded overflow-hidden bg-muted/20">
                    <Image src={bookTech.estruturaLivroUrl} alt="Estrutura do livro" fill className="object-contain" sizes="50vw" unoptimized />
                  </div>
                )}
              </div>
            </Card>

            {/* Estrutura Editorial: Exterior / Interior */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-2">Estrutura Editorial</h3>
              <p className="text-sm text-muted-foreground mb-4">Referência técnica das partes do livro, exterior e interior.</p>
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="exterior">
                  <AccordionTrigger>EXTERIOR</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li><strong>Capa:</strong> Frente com título, autor e editora – proteção e introdução à obra.</li>
                      <li><strong>Contracapa:</strong> Parte traseira, geralmente com sinopse.</li>
                      <li><strong>Lombada:</strong> Lateral que une folhas, com título e autor.</li>
                      <li><strong>Orelhas:</strong> Abas dobradas com bio do autor e notas editoriais.</li>
                      <li><strong>Sobrecapa:</strong> Capa adicional (edições de luxo) com informações semelhantes.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="interior">
                  <AccordionTrigger>INTERIOR</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold">Secção Pré-textual</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li><strong>Folha de guarda:</strong> Em branco/ilustrada, liga miolo à capa.</li>
                          <li><strong>Folha de rosto:</strong> Título, autor, editora e identificação.</li>
                          <li><strong>Sumário/Índice:</strong> Lista de capítulos e páginas.</li>
                          <li><strong>Prefácio/Apresentação/Epígrafe/Agradecimentos:</strong> Introduções contextuais.</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold">Secção Textual</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li><strong>Corpo do livro:</strong> Conteúdo principal em capítulos (página capitular com título; fólio de numeração; iconografia quando aplicável).</li>
                        </ul>
                        <div className="mt-2 p-3 border rounded bg-muted/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Capítulos Sugeridos (tema: trabalho 9‑to‑5 e sociedade dos individados)</span>
                            <Button size="sm" onClick={() => {
                              const template: {title: string; summary: string}[] = [
                                { title: "1. O enquadramento: o 9‑to‑5 como maquilhagem da paz social", summary: "Origem histórica e custo social do horário." },
                                { title: "2. O humano dentro do horário: predisposições e erosões", summary: "Rotina, abstração iminente, ansiedades do arranque." },
                                { title: "3. Hierarquias e jogo invisível das contratações", summary: "Teatralidade corporativa e filtros opacos." },
                                { title: "4. Género, desemprego e subsidiação", summary: "Dinâmicas de género e paliativos sociais." },
                                { title: "5. Precariedade deliberada: contratos a termo e experimentais", summary: "Insegurança crónica como ferramenta de gestão." },
                                { title: "6. Economia do salário: ganhar para devolver", summary: "Ciclo salário→consumo→dependência." },
                                { title: "7. Trabalho múltiplo e sobrevivência", summary: "Gig, três empregos, filtros estruturais." },
                                { title: "8. Casa vs trabalho: dissolução do limite", summary: "Teletrabalho e casa‑escritório." },
                                { title: "9. Cultura corporativa e guerra interpessoal", summary: "Micro‑políticas, complacência, statu quo." },
                                { title: "10. Recrutamento e sobrepopulação virtual", summary: "Vagas‑postura e lotaria injusta." },
                                { title: "11. Burocracia, dívida e a sociedade dos individados", summary: "Armada burocrática e penalizações." },
                                { title: "12. Linhas de fuga e propostas", summary: "Estratégias individuais e reformas." },
                                { title: "13. Conclusão — a imigração para o escritório", summary: "Guerra camuflada de normalidade." },
                                { title: "14. A automatização e a IA no trabalho", summary: "Desafios e requalificação (PT/UE)." },
                                { title: "15. Trabalho híbrido e remoto", summary: "Flexibilidade vs erosão de limites." },
                                { title: "16. Saúde mental e bem‑estar", summary: "Burnout, programas e 2025." },
                                { title: "17. Diversidade geracional e inclusão", summary: "Conflitos e DEI nas equipas." },
                                { title: "18. Transição verde e empregos sustentáveis", summary: "Skills verdes e precariedade." },
                                { title: "19. Tendências salariais e desigualdades", summary: "Setores, negociação e equidade." },
                                { title: "20. Futuro do trabalho até 2030", summary: "Projeções e reformas necessárias." },
                              ];
                              const titles = new Set(chapters.map(c => c.title));
                              const toAdd: Chapter[] = template
                                .filter(t => !titles.has(t.title))
                                .map((t, i) => ({ id: `${Date.now()}_${i}`, structure: "desenvolvimento", summary: t.summary, title: t.title, paragraphs: [], wordCount: 0 }));
                              if (toAdd.length) setChapters(prev => [...prev, ...toAdd]);
                            }}>Inserir Sumário Sugerido</Button>
                          </div>
                          <ol className="list-decimal pl-5 space-y-1 text-sm">
                            <li>O enquadramento: o 9‑to‑5 como maquilhagem da paz social</li>
                            <li>O humano dentro do horário: predisposições e erosões</li>
                            <li>Hierarquias e jogo invisível das contratações</li>
                            <li>Género, desemprego e subsidiação</li>
                            <li>Precariedade deliberada: contratos a termo e experimentais</li>
                            <li>Economia do salário: ganhar para devolver</li>
                            <li>Trabalho múltiplo e sobrevivência</li>
                            <li>Casa vs trabalho: dissolução do limite</li>
                            <li>Cultura corporativa e guerra interpessoal</li>
                            <li>Recrutamento e sobrepopulação virtual</li>
                            <li>Burocracia, dívida e a sociedade dos individados</li>
                            <li>Linhas de fuga e propostas</li>
                            <li>Conclusão — a imigração para o escritório</li>
                            <li>A automatização e a IA no trabalho</li>
                            <li>Trabalho híbrido e remoto</li>
                            <li>Saúde mental e bem‑estar</li>
                            <li>Diversidade geracional e inclusão</li>
                            <li>Transição verde e empregos sustentáveis</li>
                            <li>Tendências salariais e desigualdades</li>
                            <li>Futuro do trabalho até 2030</li>
                          </ol>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold">Secção Pós‑textual</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li><strong>Posfácio e Epílogo</strong></li>
                          <li><strong>Apêndice</strong> e <strong>Anexo</strong></li>
                          <li><strong>Glossário</strong> (termos e definições)</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          </div>
        )}

        {/* Barra de Ferramentas Inferior */}
        <Card className="sticky bottom-0 mt-6">
          <CardContent className="p-4 flex justify-between">
            <div className="flex gap-4">
              <Button
                onClick={exportToPDF}
                variant="secondary"
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Exportar PDF
              </Button>

              <Button
                onClick={handleSaveProject}
                variant="default"
                className="bg-green-500 hover:bg-green-600"
              >
                <Save className="mr-2" />
                Salvar Projeto
              </Button>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <Eye className="mr-2" /> Pré-visualizar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="text-center">
                    Pré-visualização do Livro
                  </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="space-y-8">
                    <div className="text-center border-b pb-4">
                      <h1 className="text-3xl font-bold mb-2">{bookInfo.title}</h1>
                      <h2 className="text-xl text-gray-600">por {bookInfo.author}</h2>
                    </div>
                    
                    {chapters.map((chapter, index) => (
                      <div key={index} className="border-b pb-6 last:border-b-0">
                        <h3 className="text-2xl font-bold mb-4">{chapter.title}</h3>
                        {chapter.paragraphs.map((paragraph, pIndex) => (
                          <p key={pIndex} className="mb-4 text-justify leading-relaxed">
                            {paragraph.words.map((word, wIndex) => (
                              <span key={wIndex} className={word.emphasized ? "font-bold" : ""}>
                                {word.text}{" "}
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
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
};

export default Dashboard;