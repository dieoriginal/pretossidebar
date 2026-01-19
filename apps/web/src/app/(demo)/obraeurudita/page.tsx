"use client";
import { useProject } from "@/hooks/use-project";
import FeaturingManager from "@/components/FeaturingManager";
import { SynopsisCRUD } from "@/components/synopsis/SynopsisCRUD";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import Metronome from "@/components/admin-panel/estrofes/metronome";
import { TitleSuggestionsDialog, AdlibsDialog, HitFrameworkDialog } from "@/components/library";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";

import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
// dnd-kit imports for drag & drop and sortable lists
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
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DragEndEvent } from "@dnd-kit/core";
import { DragOverlay, defaultDropAnimation } from "@dnd-kit/core";
import { jsPDF } from "jspdf";
// UI inputs and dialogs used below
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetHeader, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/hooks/use-sidebar";
import { Sidebar } from "@/components/admin-panel/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
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
  Dot,
  Plus,
  X,
  Eye,
  Video,
  FileText,
  GripVertical,
  Minus,
  Square,
  Maximize2,
  Minimize2
} from "lucide-react";
// (Select imported above with full API)
import { debounce } from "lodash";
import {
  syncProjectToCloud,
  saveProjectLocally,
  saveProjectToFirebase,
  getCurrentUserId,
} from "@/lib/firebase";
import { salvarProjeto, carregarProjeto } from "@/lib/storage";
import { setCookie, getCookie } from "@/lib/cookies";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ReferenceTabs from "@/components/ReferenceTabs";
import { useToastLite } from "@/components/ui/toast-lite";
import { Navbar as ProfessionalNavbar } from "@/components/admin-panel/navbar";

import NarratologiaTab from "@/components/narratologia-tab";

import AccountStep from "@/steps/account";
import ContratualizacaoStep from "@/steps/contratualizacao";
import CustosFixosStep from "@/steps/custosfixos";
import DireitosAutoraisStep from "@/steps/direitosautorais";
import FilmagemStep from "@/steps/filmagem";
import FotografiaStep from "@/steps/fotografia";
import GravacaoStep from "@/steps/gravacao";
import LancamentoStep from "@/steps/lancamento";
import VideoEditChecklist from "@/steps/edicaodevideo";
import MonetizacaoStep from "@/steps/monetizacao";
import NarratologiaStep from "@/steps/narratologia";
import OrcamentoStep from "@/steps/orcamento";
import VestuarioStep from "@/steps/vestuario";
// (useProject imported at top)

// Use static import to avoid dev chunk loading timeouts

interface VerseWord {
  text: string;
  customColor?: string;
  stressed?: boolean;
}

interface Verse {
  id: string;
  words: VerseWord[];
  tag: string;
  media?: File | string;
  adlib?: string;
  voiceType?: string;
  figura?: string;
  cameraSettings?: {
    shotType: string;
    movement: string;
    resolution: string;
    stabilization: string;
    location: string;
    sceneLabel?: string; // Nova frase curta (4 chars) para descrever a cena
    relatedVerses?: number[]; // Adicionando campo para versos relacionados
    iso?: string;
    shutterSpeed?: string;
    ndFilter?: string;
    intExt?: string;
    characters?: string;
    props?: string;
    style?: string;
    objective?: string;
    tags?: string;
    specialEffects?: string;
    cameraMovement?: string;
    coverage?: string;
    cast?: string;
    propsCostumes?: string;
    rhythmStyle?: string;
    sceneType?: string;
  };
  function?: string;
  technique?: string;
  metaTool?: string;
  persona?: string;
  threeAct?: string;
  musicSection?: string; // New field
}

interface Strophe {
  id: string;
  verses: Verse[];
  architecture: string;
  architectureDesc?: string;
  description: string;
  // Optional fields used in UI controls
  threeAct?: string;
  musicSection?: string;
}

interface SongInfo {
  title: string;
  artist: string;
  featuring: string[];
  producer: string;
}

const initialSongInfo: SongInfo = {
  title: "",
  artist: "",
  featuring: [],
  producer: "",
};

type LiteraryFigure = { name: string; description: string; example: string };
type Word = { text: string; color?: string; stressed?: boolean };

const literaryFigures: LiteraryFigure[] = [
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
  {
    name: "Ironia",
    description: "Dizer o oposto do que se quer expressar.",
    example: "Que dia lindo! (num dia chuvoso)",
  },
  {
    name: "Aliteração",
    description: "Repetição de sons consonantais.",
    example: "O rato roeu a roupa do rei de Roma.",
  },
  {
    name: "Prosopopeia",
    description: "Atribuir características humanas a seres inanimados.",
    example: "O sol sorriu para nós.",
  },
  {
    name: "Onomatopeia",
    description: "Palavras que imitam sons.",
    example: "O relógio faz tic-tac.",
  },
  {
    name: "Eufemismo",
    description: "Suavização de uma expressão.",
    example: "Ele partiu para um lugar melhor.",
  },
  {
    name: "Antítese",
    description: "Contraposição de ideias.",
    example: "É um mar de rosas, mas também um deserto de espinhos.",
  },
  {
    name: "Paradoxo",
    description: "Ideias opostas que geram reflexão.",
    example: "Menos é mais.",
  },
  {
    name: "Quiasmo",
    description:
      "Inversão na ordem das palavras ou ideias em frases paralelas.",
    example: "Devo viver para comer ou comer para viver?",
  },
  {
    name: "Anáfora",
    description:
      "Repetição de uma palavra ou expressão no início de frases ou versos.",
    example: "Chove sobre a cidade, chove sobre os campos.",
  },
  {
    name: "Assíndeto",
    description: "Omissão de conjunções.",
    example: "Vim, vi, venci.",
  },
  {
    name: "Polissíndeto",
    description: "Uso excessivo de conjunções.",
    example: "E chora, e grita, e corre, e cai.",
  },
  {
    name: "Metonímia",
    description: "Substituição por proximidade de sentido.",
    example: "Bebi um copo.",
  },
  {
    name: "Sinestesia",
    description: "Mistura de sensações de sentidos diferentes.",
    example: "Ouvi um cheiro doce.",
  },
  {
    name: "Gradação",
    description: "Sequência crescente ou decrescente de ideias.",
    example: "Chorei, lamentei, desesperei.",
  },
  {
    name: "Pleonasmo",
    description: "Uso de palavras redundantes para reforçar a ideia.",
    example: "Subir para cima.",
  },
  {
    name: "Elipse",
    description: "Omissão de um termo facilmente subentendido.",
    example: "Na sala, apenas dois alunos.",
  },
  {
    name: "Zeugma",
    description: "Omissão de um termo já mencionado anteriormente.",
    example: "Eu gosto de café; ela, de chá.",
  },
  {
    name: "Catacrese",
    description: "Metáfora desgastada ou comum no uso cotidiano.",
    example: "Pé da mesa.",
  },
  {
    name: "Antonomásia",
    description: "Uso de uma característica ou título no lugar do nome.",
    example: "O Rei do Pop (Michael Jackson).",
  },
  {
    name: "Apóstrofe",
    description: "Chamamento enfático a uma pessoa ou coisa.",
    example: "Ó deuses, escutem meu clamor!",
  },
  {
    name: "Paranomásia",
    description:
      "Uso de palavras com sons parecidos, mas significados diferentes.",
    example: "Conhecer para crescer.",
  },
  {
    name: "Hipérbato",
    description: "Inversão da ordem lógica das palavras na frase.",
    example: "De tudo, ao meu amor serei atento.",
  },
  {
    name: "Perífrase",
    description: "Uso de várias palavras para se referir a algo ou alguém.",
    example: "A cidade maravilhosa (Rio de Janeiro).",
  },
];

const verseFunctions = [
  {
    name: "Afirmação",
    description:
      "Declara algo como verdadeiro. Ex: 'Eu sou o fogo que queima sem cessar.'",
  },
  {
    name: "Ato",
    description:
      "Expressa ação, movimento ou mudança. Ex: 'Levanto-me contra o silêncio.'",
  },
  {
    name: "Desejo",
    description:
      "Revela vontade ou intenção. Ex: 'Quero rasgar o céu com gritos de guerra.'",
  },
  {
    name: "Negação",
    description:
      "Recusa, rejeição, oposição. Ex: 'Não sou a sombra que vocês pensam.'",
  },
  {
    name: "Pergunta",
    description:
      "Interrogativa, direta ou retórica. Ex: 'Quem sou eu diante do abismo?'",
  },
  {
    name: "Profecia",
    description:
      "Anuncia o que virá, com peso visionário. Ex: 'O dia da queda virá ao som dos tambores.'",
  },
  {
    name: "Declaração de guerra",
    description: "Confronto direto, aviso. Ex: 'Rompo pactos, ergo muralhas.'",
  },
  {
    name: "Confissão",
    description:
      "Exposição íntima ou revelação. Ex: 'Carrego pecados em cada palavra.'",
  },
  {
    name: "Evocação",
    description:
      "Chama ou invoca algo/alguém. Ex: 'Venham, espíritos da noite eterna.'",
  },
  {
    name: "Desabafo",
    description:
      "Descarga emocional ou mental. Ex: 'Estou farto das máscaras e jogos.'",
  },
  {
    name: "Crítica / Ataque",
    description:
      "Julgamento ou acusação. Ex: 'Vocês se arrastam na lama e chamam isso de trono.'",
  },
  {
    name: "Manifesto / Declaração ideológica",
    description:
      "Posição política, social ou espiritual. Ex: 'A ordem será destruída pela verdade nua.'",
  },
  {
    name: "Autodefinição",
    description:
      "Construção da própria identidade. Ex: 'Sou lâmina, sou código, sou negação do caos.'",
  },
  {
    name: "Chamado / Convocação",
    description: "Incitação, liderança. Ex: 'Ergam-se os que ainda têm alma.'",
  },
  {
    name: "Maldição / Benção",
    description:
      "Desejo de ruína ou proteção. Ex: 'Que tua mentira te devore por dentro.'",
  },
  {
    name: "Juramento / Promessa",
    description: "Compromisso selado. Ex: 'Juro nunca mais me calar.'",
  },
  {
    name: "Despedida / Corte",
    description:
      "Fim de algo, separação. Ex: 'Este é o último eco do que fomos.'",
  },
  {
    name: "Instrução / Ordem",
    description: "Comando ou direção. Ex: 'Fechem os olhos. Escutem o sangue.'",
  },
  {
    name: "Ironia / Sarcasmo",
    description:
      "Duplo sentido, crítica disfarçada. Ex: 'Ah, que bela é a tua hipocrisia vestida de ouro.'",
  },
  {
    name: "Provocação / Desafio",
    description:
      "Convite ao confronto. Ex: 'Se és rei, então lute por tua coroa.'",
  },
];

const voiceOptions = [
  { value: "chest", label: "Voz do Peito" },
  { value: "baby", label: "Baby Voice" },
  { value: "psycho", label: "PSIC00" },
  { value: "intimidating", label: "Voz Grave Intimidante" },
  { value: "charismatic", label: "Carismático" },
  { value: "empresonification", label: "Impersonificação" },
];

const dramArqOptions = [
  {
    value: "Prelúdio",
    description:
      "Introdução poética que prepara o leitor para o que está por vir",
    instruction:
      "Use esta estrofe para criar uma atmosfera e sugerir os temas que serão desenvolvidos, como uma abertura musical que antecipa a sinfonia.",
  },
  {
    value: "Prólogo",
    description: "Introdução que apresenta o contexto inicial da obra",
    instruction:
      "Nesta estrofe, estabeleça o cenário e apresente os personagens principais.",
  },
  {
    value: "Parodos (coro)",
    description: "Entrada do coro no teatro grego",
    instruction: "Introduza o coro ou a voz coletiva que comentará a ação.",
  },
  {
    value: "Episódios",
    description: "Partes principais da narrativa",
    instruction: "Desenvolva a ação principal e os conflitos da história.",
    subtypes: [
      {
        value: "Ascensão do herói",
        description:
          "O herói é introduzido e ganha destaque, mostrando suas qualidades e ambições iniciais.",
        instruction:
          "Apresente o protagonista e estabeleça seus objetivos iniciais.",
      },
      {
        value: "Erro trágico (hamartia)",
        description:
          "O herói comete um erro crucial, muitas vezes por orgulho ou ignorância, que inicia a reviravolta.",
        instruction:
          "Mostre o momento crucial onde o herói comete um erro que altera o curso da história.",
      },
      {
        value: "Virada de fortuna (peripeteia)",
        description:
          "Ocorre uma mudança drástica na sorte do herói, geralmente de boa para má, intensificando o conflito.",
        instruction:
          "Descreva a reviravolta que muda completamente a situação do herói.",
      },
      {
        value: "Queda (catástrofe)",
        description:
          "O herói enfrenta as consequências de seus erros, levando a sofrimento e, frequentemente, à morte.",
        instruction: "Mostre as consequências dramáticas dos erros do herói.",
      },
      {
        value: "Reconhecimento (anagnórise)",
        description:
          "O herói ou outros personagens ganham um entendimento crítico da situação, reconhecendo verdades antes ocultas.",
        instruction:
          "Descreva o momento de revelação e compreensão da verdade.",
      },
    ],
  },
  {
    value: "Êxodo",
    description: "Conclusão da história",
    instruction:
      "Resolva os conflitos e encerre a narrativa de forma satisfatória.",
  },
  {
    value: "Epílogo",
    description: "Texto final que complementa ou encerra a obra",
    instruction:
      "Forneça uma reflexão final ou mostre as consequências da história.",
  },
];

const episodeOptions = [
  "Ascensão do herói",
  "Erro trágico (hamartia)",
  "Virada de fortuna (peripeteia)",
  "Queda (catástrofe)",
  "Reconhecimento (anagnórise)",
];

const shotTypeOptions = [
  { value: "highAngle", label: "Plano alto / Ângulo alto" },
  { value: "lowAngle", label: "Plano baixo / Ângulo baixo" },
  { value: "dutchAngle", label: "Plano holandês / Ângulo inclinado" },
  { value: "eyeLevel", label: "Ao nível dos olhos" },
];

const featuringOptions = [
  "Zara G",
  "YuriNR5",
  "Sippinpurp",
  "YUZI",
  "YunLilo",
  "Yasz Dicko",
  "MAFIA73",
  "P. William",
  "Chaylan",
];

const literaryTechniques = [
  {
    category: "Técnicas Narrativas",
    techniques: [
      {
        name: "Flashback",
        description: "Retorno ao passado para explicar o presente.",
      },
      {
        name: "Flashforward",
        description: "Visão do futuro para contextualizar o presente.",
      },
      {
        name: "Monólogo interno",
        description:
          "Pensamentos ou sentimentos do personagem expressos em sua mente.",
      },
      {
        name: "Stream of consciousness",
        description: "Corrente contínua de pensamento não filtrado.",
      },
      {
        name: "Narrador omnisciente",
        description:
          "Conhecimento de todos os pensamentos e ações dos personagens.",
      },
      {
        name: "Narrador limitado",
        description: "Conhecimento apenas do que o personagem principal sabe.",
      },
      {
        name: "Narrador em terceira pessoa",
        description:
          "Narrativa em terceira pessoa, distanciando o leitor dos personagens.",
      },
      {
        name: "Narrador em primeira pessoa",
        description:
          "Narrativa em primeira pessoa, envolvendo o leitor nos pensamentos do personagem.",
      },
      {
        name: "Narrador dual",
        description: "Múltiplos narradores para contar a história.",
      },
      {
        name: "Narrador plural",
        description: "Vários personagens contando a história simultaneamente.",
      },
      {
        name: "Narrador ausente",
        description:
          "Ausência de um narrador explícito, deixando o leitor interpretar a história.",
      },
      {
        name: "Narrador ironico",
        description: "Narrador que comenta a ação com sarcasmo ou ironia.",
      },
      {
        name: "Narrador objetivo",
        description: "Narrador neutro, apenas relatando os eventos.",
      },
      {
        name: "Narrador subjetivo",
        description: "Narrador que expressa sua opinião sobre os eventos.",
      },
    ],
  },
];

const metaNarrativeTools = [
  {
    name: "Meta-comentário",
    description:
      "Quando o artista comenta a própria letra ou processo criativo.",
  },
  {
    name: "Quebra da quarta parede",
    description: "Falar diretamente com o ouvinte, fora da narrativa.",
  },
  {
    name: "Interrupção narrativa",
    description: "Pausa para explicar ou mudar o ponto de vista.",
  },
  {
    name: "Fluxo de consciência",
    description: "Corrente contínua de pensamento não filtrado.",
  },
  {
    name: "Parêntese lírico",
    description: "Comentários internos que quebram o ritmo.",
  },
  {
    name: "Auto-diálogo / Conflito interno",
    description: "O artista fala consigo mesmo dentro do verso.",
  },
  {
    name: "Auto-correção",
    description: "Corrigir uma linha anterior ('Espera—quis dizer...').",
  },
  {
    name: "Barras com estilo de anotação",
    description: "Linhas que funcionam como notas de rodapé.",
  },
  {
    name: "Barras hipotéticas/condicionais",
    description: "'Se eu tivesse dito isto... aquilo teria acontecido.'",
  },
  {
    name: "Escrita-sobre-escrita",
    description: "Falar sobre o ato de escrever (metapoético).",
  },
  {
    name: "In medias res",
    description: "Começar a meio da história e depois desenvolver.",
  },
  {
    name: "Intrusão autoral",
    description: "Quebra de personagem para narrar com intenção real.",
  },
];

const personaTechniques = [
  {
    category: "Persona",
    techniques: [
      {
        name: "Não é o autor",
        description:
          "A persona é uma voz fictícia, não corresponde ao 'eu' real do autor.",
      },
      {
        name: "Voz e perspetiva",
        description: "Define o tom, o ponto de vista e a atitude da narração.",
      },
      {
        name: "Criação intencional",
        description: "É escolhida pelo autor com um propósito específico.",
      },
      {
        name: "Presente em poesia e prosa",
        description:
          "Embora comum na poesia, também aparece em romances, contos e outros géneros.",
      },
      {
        name: "Simples ou complexa",
        description:
          "Pode ser uma caracterização direta ou uma construção profunda e multifacetada.",
      },
    ],
  },
];

const threeActStructure = [
  {
    category: "Acto I – Início (Setup)",
    techniques: [
      {
        name: "Introdução de personagens",
        description:
          "Apresenta os personagens principais e o contexto da história.",
      },
      {
        name: "Conflito central",
        description:
          "Estabelece o problema ou desafio que impulsiona a narrativa.",
      },
      {
        name: "Incidente incitante",
        description: "Momento que rompe o equilíbrio e lança a ação.",
      },
    ],
  },
  {
    category: "Acto II – Desenvolvimento (Confrontação)",
    techniques: [
      {
        name: "Complicações",
        description: "Explora os desafios e eleva a tensão.",
      },
      {
        name: "Ponto médio",
        description: "Momento que reverte ou aprofunda a situação.",
      },
      {
        name: "Revés maior",
        description: "Testa verdadeiramente o protagonista.",
      },
    ],
  },
  {
    category: "Acto III – Conclusão (Resolução)",
    techniques: [
      { name: "Clímax", description: "Conflitos atingem o auge." },
      {
        name: "Resolução",
        description: "Encerra as pontas soltas da narrativa.",
      },
      {
        name: "Final fechado",
        description: "Conclusão positiva ou definitiva.",
      },
      { name: "Final aberto", description: "Conclusão reflexiva ou ambígua." },
    ],
  },
];

const WordTag = ({
  word,
  color,
  isRhymed,
  onChange,
  onColorChange,
  onRemove,
  rhymedColor,
}: {
  word: string;
  color?: string;
  isRhymed: boolean;
  onChange: (newWord: string) => void;
  onColorChange: (newColor: string) => void;
  onRemove: () => void;
  rhymedColor?: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(word.toUpperCase());
  const bgColor = color || (isRhymed ? rhymedColor : undefined);

  return (
    <div
      className="inline-flex items-center m-1 p-1 border rounded dark:text-white"
      style={{ backgroundColor: bgColor }}
    >
      {isEditing ? (
        <input
          className="bg-transparent outline-none px-1 uppercase font-bold text-sm"
          value={value}
          onChange={(e) => {
            const newVal = e.target.value.toUpperCase();
            setValue(newVal);
            onChange(newVal);
          }}
          onBlur={() => {
            setIsEditing(false);
            onChange(value);
          }}
          onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
          autoFocus
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className={"px-1 uppercase font-bold text-sm"}
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
      />
    </div>
  );
};

const VerseTag = ({
  tag,
  onChange,
}: {
  tag: string;
  onChange: (newTag: string) => void;
}) => {
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

const SortableVerse = ({
  verse,
  stropheIndex,
  verseIndex,
  onVerseChange,
  onRemove,
  onDragStart,
  modoNietzsche,
  musicStructure,
}: {
  verse: Verse;
  stropheIndex: number;
  verseIndex: number;
  onVerseChange: (newVerse: Verse) => void;
  onRemove: () => void;
  onDragStart: (id: string) => void;
  modoNietzsche: boolean;
  musicStructure: string[]; // Adicionando a prop musicStructure
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: verse.id });
  const bgColorMapping: Record<string, string> = {
    A: "#ef4444",
    B: "#3b82f6",
    C: "#84cc16",
    D: "#eab308",
  };

  // Adicionando a definição dos sensores aqui
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
  };

  const handleWordChange = (wordIndex: number, newWord: string) => {
    // Immutable update for proper re-rendering
    const newWords = verse.words.map((w, i) =>
      i === wordIndex ? { ...w, text: newWord } : w,
    );
    onVerseChange({ ...verse, words: newWords });
  };

  const handleWordColorChange = (wordIndex: number, newColor: string) => {
    // Immutable update for proper re-rendering
    const newWords = verse.words.map((w, i) =>
      i === wordIndex ? { ...w, customColor: newColor } : w,
    );
    onVerseChange({ ...verse, words: newWords });
  };

  const handleRemoveWord = (wordIndex: number) => {
    const newWords = verse.words.filter((_, i) => i !== wordIndex);
    onVerseChange({ ...verse, words: newWords });
  };

  const handleAddWord = () => {
    onVerseChange({ ...verse, words: [...verse.words, { text: "" }] });
  };

  // Função para obter a descrição de uma técnica pelo nome
  const getDescription = (name: string, category: any[]) => {
    for (const cat of category) {
      const tech = cat.techniques.find((t: any) => t.name === name);
      if (tech) return tech.description;
    }
    return "";
  };

  const [contextoCompleto, setContextoCompleto] = useState(false);

  useEffect(() => {
    // Verifica se todos os campos de contexto foram preenchidos
    const completo =
      verse.voiceType &&
      verse.figura &&
      verse.function &&
      verse.technique &&
      verse.metaTool &&
      verse.persona &&
      verse.threeAct;
    setContextoCompleto(!!completo);
  }, [verse]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 mb-4 border rounded-lg relative group bg-white dark:bg-gray-800"
    >
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-move p-1 hover:bg-gray-100 rounded"
          onMouseDown={() => onDragStart(verse.id)}
        >
          ↕
        </button>
        <button onClick={onRemove} className="text-red-500" aria-label="Remover verso" title="Remover verso">
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <VerseTag
          tag={verse.tag}
          onChange={(newTag) => onVerseChange({ ...verse, tag: newTag })}
        />

        {/* New Music Section Select */}

        <Input
          placeholder="ADLIB"
          value={verse.adlib || ""}
          onChange={(e) =>
            onVerseChange({ ...verse, adlib: e.target.value.toUpperCase() })
          }
          className="w-32 text-sm border-2 border-yellow-500 bg-slate-700-500 focus:border-yellow-500 focus:bg-black"
        />
        <AdlibsDialog onPick={(phrase) => onVerseChange({ ...verse, adlib: phrase.toUpperCase() })} />

        {/* Componentes de seleção sempre visíveis */}
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <select
            value={verse.voiceType}
            onChange={(e) =>
              onVerseChange({ ...verse, voiceType: e.target.value })
            }
            className="p-2 border rounded text-sm flex-1 min-w-[120px]"
            style={{ width: `${(verse.voiceType?.length ?? 0) * 8 + 100}px` }}
          >
            {voiceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={verse.figura}
            onChange={(e) =>
              onVerseChange({ ...verse, figura: e.target.value })
            }
            className="p-2 border rounded text-sm flex-1 min-w-[120px]"
            style={{ width: `${(verse.figura?.length ?? 0) * 8 + 100}px` }}
          >
            <option value="">Figura</option>
            {literaryFigures.map((fig) => (
              <option key={fig.name} value={fig.name}>
                {fig.name}
              </option>
            ))}
          </select>

          <select
            value={verse.function}
            onChange={(e) =>
              onVerseChange({ ...verse, function: e.target.value })
            }
            className="p-2 border rounded text-sm flex-1 min-w-[120px]"
            style={{ width: `${(verse.function?.length ?? 0) * 8 + 100}px` }}
          >
            <option value="">Função</option>
            {verseFunctions.map((func) => (
              <option key={func.name} value={func.name}>
                {func.name}
              </option>
            ))}
          </select>

          <select
            value={verse.technique}
            onChange={(e) =>
              onVerseChange({ ...verse, technique: e.target.value })
            }
            className="p-2 border rounded text-sm flex-1 min-w-[120px]"
            style={{ width: `${(verse.technique?.length ?? 0) * 8 + 100}px` }}
          >
            <option value="">Técnica</option>
            {literaryTechniques.map((cat) => (
              <optgroup key={cat.category} label={cat.category}>
                {cat.techniques.map((tech) => (
                  <option key={tech.name} value={tech.name}>
                    {tech.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <select
            value={verse.metaTool}
            onChange={(e) =>
              onVerseChange({ ...verse, metaTool: e.target.value })
            }
            className="p-2 border rounded text-sm flex-1 min-w-[120px]"
            style={{ width: `${(verse.metaTool?.length ?? 0) * 8 + 100}px` }}
          >
            <option value="">Meta-narrativa</option>
            {metaNarrativeTools.map((tool) => (
              <option key={tool.name} value={tool.name}>
                {tool.name}
              </option>
            ))}
          </select>

          <select
            value={verse.persona}
            onChange={(e) =>
              onVerseChange({ ...verse, persona: e.target.value })
            }
            className="p-2 border rounded text-sm flex-1 min-w-[120px]"
            style={{ width: `${(verse.persona?.length ?? 0) * 8 + 100}px` }}
          >
            <option value="">Persona</option>
            {personaTechniques.map((cat) => (
              <optgroup key={cat.category} label={cat.category}>
                {cat.techniques.map((tech) => (
                  <option key={tech.name} value={tech.name}>
                    {tech.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <select
            value={verse.threeAct}
            onChange={(e) =>
              onVerseChange({ ...verse, threeAct: e.target.value })
            }
            className="p-2 border rounded text-sm flex-1 min-w-[120px]"
            style={{ width: `${(verse.threeAct?.length ?? 0) * 8 + 100}px` }}
          >
            <option value="">Estrutura em 3 Atos</option>
            {threeActStructure.map((cat) => (
              <optgroup key={cat.category} label={cat.category}>
                {cat.techniques.map((tech) => (
                  <option key={tech.name} value={tech.name}>
                    {tech.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Exibição das descrições */}
      <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
        <h3 className="font-bold">CONTEXTO</h3>
        {verse.voiceType && (
          <p>
            <strong>Voz:</strong>{" "}
            {voiceOptions.find((opt) => opt.value === verse.voiceType)?.label}
          </p>
        )}
        {verse.figura && (
          <p>
            <strong>Figura:</strong>{" "}
            {
              literaryFigures.find((fig) => fig.name === verse.figura)
                ?.description
            }
          </p>
        )}
        {verse.function && (
          <p>
            <strong>Função:</strong>{" "}
            {
              verseFunctions.find((func) => func.name === verse.function)
                ?.description
            }
          </p>
        )}
        {verse.technique && (
          <p>
            <strong>Técnica:</strong>{" "}
            {getDescription(verse.technique, literaryTechniques)}
          </p>
        )}
        {verse.metaTool && (
          <p>
            <strong>Meta-narrativa:</strong>{" "}
            {
              metaNarrativeTools.find((tool) => tool.name === verse.metaTool)
                ?.description
            }
          </p>
        )}
        {verse.persona && (
          <p>
            <strong>Persona:</strong>{" "}
            {getDescription(verse.persona, personaTechniques)}
          </p>
        )}
      </div>

      {/* Campo de versos condicional */}
      {(!modoNietzsche || contextoCompleto) && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={({ active, over }) => {
            if (over && active.id !== over.id) {
              const oldIndex = verse.words.findIndex(
                (w) => w.text === active.id,
              );
              const newIndex = verse.words.findIndex((w) => w.text === over.id);
              const newWords = arrayMove(verse.words, oldIndex, newIndex);
              onVerseChange({ ...verse, words: newWords });
            }
          }}
        >
          <SortableContext
            items={verse.words.map((w) => w.text)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {verse.words.map((word, wordIndex) => (
                <WordTag
                  key={word.text + wordIndex}
                  word={word.text}
                  color={word.customColor}
                  isRhymed={wordIndex === verse.words.length - 1}
                  onChange={(newWord) => handleWordChange(wordIndex, newWord)}
                  onColorChange={(newColor) =>
                    handleWordColorChange(wordIndex, newColor)
                  }
                  onRemove={() => handleRemoveWord(wordIndex)}
                  rhymedColor={bgColorMapping[verse.tag]}
                />
              ))}
              <Button onClick={handleAddWord} size="sm">
                +
              </Button>
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Mensagem quando o Modo Nietzsche está ativo e o contexto não está completo */}
      {modoNietzsche && !contextoCompleto && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded mt-4">
          <p className="text-sm text-yellow-800">
            Complete o contexto acima para desbloquear o campo de versos.
          </p>
        </div>
      )}
    </div>
  );
};

const PreviewModal = ({ verses }: { verses: Word[][] }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" className="gap-2">
        <Eye className="h-4 w-4" />
        Pré-visualizar
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-4xl h-[90vh]">
      <DialogHeader>
        <DialogTitle className="text-center">
          Pré-visualização do Poema
        </DialogTitle>
      </DialogHeader>
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="bg-white dark:bg-black p-8">
          <div className="font-helvetica uppercase text-black dark:text-white text-center space-y-6 text-lg leading-relaxed">
            {verses.map((verse, index) => (
              <p key={index} className="break-words max-w-full">
                {verse.map((word, i) => (
                  <span
                    key={i}
                    style={{ color: word.color }}
                    className={word.stressed ? "font-extrabold" : "font-normal"}
                  >
                    {word.text}
                    {i < verse.length - 1 ? " " : ""}
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const analyzeMeter = async (text: string) => {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lines: text.split("\n"),
      }),
    });

    if (!response.ok) {
      throw new Error("Erro na análise da métrica");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro:", error);
    return null;
  }
};

const exportStoryboard = async (strophes: Strophe[], songInfo: SongInfo) => {
  const doc = new jsPDF('p', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  let yPosition = margin;
  const lineHeight = 16;
  const sectionSpacing = 25;

  // Helper function to check page break
  const checkPageBreak = (heightNeeded: number) => {
    if (yPosition + heightNeeded > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Helper function to add section header
  const addSectionHeader = (title: string, fontSize: number = 14) => {
    checkPageBreak(lineHeight + 10);
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(44, 62, 80); // Dark blue-gray
    doc.text(title, margin, yPosition);
    yPosition += lineHeight + 5;
  };

  // Helper function to add info row
  const addInfoRow = (label: string, value: string, indent: number = 0) => {
    checkPageBreak(lineHeight);
    doc.setFontSize(8); // Reduced from 10 to 8
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(52, 73, 94); // Medium gray
    doc.text(`${label}:`, margin + indent, yPosition);
    doc.setTextColor(44, 62, 80); // Dark blue-gray
    doc.text(value, margin + indent + 100, yPosition); // Increased spacing from 80 to 100
    yPosition += lineHeight;
  };

  // Helper function to add media preview
  const addMediaPreview = async (verse: any, index: number) => {
    if (verse.media instanceof File && verse.media.type.startsWith("image")) {
      try {
        const imgData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(verse.media as File);
        });
        
        checkPageBreak(80);
        doc.addImage(imgData, 'JPEG', margin, yPosition, 120, 80);
        yPosition += 85;
      } catch (error) {
        console.error('Error adding image to PDF:', error);
      }
    }
  };

  const versesFlat = strophes.flatMap(strophe => strophe.verses);
  
  for (let index = 0; index < versesFlat.length; index++) {
    const verse = versesFlat[index];
    if (verse.cameraSettings) {
      // Add scene header
      addSectionHeader(`CENA ${index + 1}`, 16);
      
      // Add verse text
      checkPageBreak(lineHeight);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 32, 44); // Very dark blue
      const verseText = verse.words.map((w: { text: string }) => w.text).join(" ");
      doc.text(verseText, margin, yPosition);
      yPosition += lineHeight + 10;

      // Add media preview if available
      await addMediaPreview(verse, index);

      // Add gap space after media
      yPosition += 20;

      // Add musical context information
      addSectionHeader('Contexto Musical', 12);
      
      // Helper function for right-aligned info rows
      const addRightAlignedInfoRow = (label: string, value: string) => {
        checkPageBreak(lineHeight);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(52, 73, 94); // Medium gray
        doc.text(`${label}:`, margin, yPosition);
        doc.setTextColor(44, 62, 80); // Dark blue-gray
        doc.text(value, pageWidth - margin - doc.getTextWidth(value), yPosition, { align: 'right' });
        yPosition += lineHeight;
      };
      
      addRightAlignedInfoRow('Artista Musical', songInfo.artist || 'Artista não definido');
      addRightAlignedInfoRow('Título da Música', songInfo.title || 'Título não definido');
      addRightAlignedInfoRow('Produtor de Música', songInfo.producer || 'Produtor não definido');
      if (songInfo.featuring && songInfo.featuring.length > 0) {
        addRightAlignedInfoRow('Featuring', songInfo.featuring.join(', '));
      }

      // Add detailed cinematography information
      addSectionHeader('Configurações Profissionais', 12);
      
      // Camera Settings
      addInfoRow('Tipo de Plano', shotTypeOptions.find(opt => opt.value === verse.cameraSettings?.shotType)?.label || 'Não definido');
      addInfoRow('Movimento de Câmera', verse.cameraSettings.movement.toUpperCase());
      addInfoRow('Cobertura e Ambiente', verse.cameraSettings.location.toUpperCase());
      
      // Technical Settings
      addSectionHeader('Configurações Técnicas', 12);
      addInfoRow('Resolução', verse.cameraSettings.resolution.toUpperCase());
      addInfoRow('Estabilização', verse.cameraSettings.stabilization.toUpperCase());
      
      // Professional Details
      addSectionHeader('Detalhes Profissionais', 12);
      addInfoRow('ISO', '100');
      addInfoRow('Velocidade do Obturador', '1/60');
      addInfoRow('Filtros ND', '0.3 (1 stop)');
      addInfoRow('INT/EXT', 'Interior');
      
      // Cast and Characters
      addSectionHeader('Elenco e Personagens', 12);
      addInfoRow('Número de Personagens', '2');
      addInfoRow('Gênero', 'Misto');
      addInfoRow('Idades', '25-35 anos');
      
      // Props and Wardrobe
      addSectionHeader('Adereços e Figurinos', 12);
      addInfoRow('Props', 'Lista de adereços específicos');
      addInfoRow('Figurinos', 'Estilo contemporâneo');
      
      // Style and Rhythm
      addSectionHeader('Ritmo e Estilo', 12);
      addInfoRow('Estilo', 'Slow motion (60-120 fps)');
      addInfoRow('Tipo de Cena', 'Diálogo (master, over-the-shoulder)');
      addInfoRow('Objetivo em 3 Palavras', 'Amor, Paixão, Dor');
      addInfoRow('Tags de Destaque', '#HighContrast #SlowMotion');
      
      // Special Effects
      addSectionHeader('Efeitos Especiais', 12);
      addInfoRow('Efeitos', 'Levitação');
      
      // Location Details
      addSectionHeader('Localização', 12);
      addInfoRow('Local', verse.cameraSettings.location.toUpperCase());
      addInfoRow('Versos Relacionados', verseText.substring(0, 50) + '...');
      addInfoRow('Descrição da Cena', 'Cena detalhada com foco na narrativa visual');
      
      // Add spacing between scenes
      yPosition += sectionSpacing;
      
      // Check if we need a new page
      if (yPosition > pageHeight - margin - 100) {
        doc.addPage();
        yPosition = margin;
      }
    }
  }

  // Add summary page at the end
  doc.addPage();
  yPosition = margin;
  
  addSectionHeader('RESUMO DO PROJETO CINEMATOGRÁFICO', 18);
  yPosition += 20;
  
  const totalScenes = versesFlat.filter(v => v.cameraSettings).length;
  const totalVerses = versesFlat.length;
  
  addInfoRow('Total de Cenas', totalScenes.toString());
  addInfoRow('Total de Versos', totalVerses.toString());
  addInfoRow('Formato', '16:9 Widescreen');
  addInfoRow('Resolução', '4K UHD');
  addInfoRow('Codec', 'ProRes 422 HQ');
  
  yPosition += 20;
  addSectionHeader('EQUIPAMENTOS PRINCIPAIS', 14);
  addInfoRow('Câmera', 'Sony FX3');
  addInfoRow('Lente', 'Sony 24-70mm f/2.8 GM');
  addInfoRow('Estabilização', 'DJI RS 3 Pro');
  addInfoRow('Iluminação', 'Aputure 600D Pro');
  
  yPosition += 20;
  addSectionHeader('EQUIPE TÉCNICA', 14);
  addInfoRow('Diretor de Fotografia', 'Nome do DOP');
  addInfoRow('Operador de Câmera', 'Nome do Operador');
  addInfoRow('Assistente de Câmera', 'Nome do AC');
  addInfoRow('Gaffer', 'Nome do Gaffer');

  doc.save('storyboard_detalhado.pdf');
};

// Adicione isso junto com as outras constantes no início do arquivo
const adlibCategories = [
  {
    name: "Sons de Arma",
    adlibs: ["PAH!", "BANG!", "RATATAT!", "POW!", "BLAM!"],
  },
  {
    name: "Sons de Fumaça",
    adlibs: ["PSSSSH!", "WHOOSH!", "FUMO!", "VAPOR!", "NÉVOA!"],
  },
  {
    name: "Sinais de Partida",
    adlibs: ["VAI!", "GO!", "JÁ!", "AGORA!", "PARTIU!"],
  },
  {
    name: "Expressões",
    adlibs: [
      "GAZ!",
      "FAVAS!",
      "DURUDU!",
      "SOPRO!",
      "PXIU!",
      "Uhuhuh",
      "BREH!",
      "YA!",
      "BAZA!",
      "FOMOS",
    ],
  },
];

const musicStructureOptions = [
  {
    value: "introducao",
    label: "🎼 Introdução",
    description: "Início maquete ou vocal, estabelece tom e atmosfera",
    example: "Guitarra em 'Smoke on the Water'",
  },
  {
    value: "verso",
    label: "📌 Verso (estrofe)",
    description: "Parte narrativa, apresenta ideias ou história",
    example: "'Once upon a time you dressed so fine…' – Bob Dylan",
  },
  {
    value: "pre-refrao",
    label: "🎶 Pré-refrão",
    description: "Ponte curta antes do refrão, eleva tensão",
    example: "'Oh, the misery…' – Imagine Dragons",
  },
  {
    value: "refrao",
    label: "🎵 Refrão (coro)",
    description: "Parte repetida e mais memorável, geralmente com a mensagem",
    example: "'We will, we will rock you…'",
  },
  {
    value: "ponte",
    label: "🌉 Ponte (bridge)",
    description: "Secção contrastante, nova progressão harmónica ou melódica",
    example: "'Middle 8' em 'Something' – The Beatles",
  },
  {
    value: "break",
    label: "⏸️ Break / Paragem",
    description: "Queda brusca de som ou ritmo, efeito dramático",
    example: "'Drop' no EDM",
  },
  {
    value: "solo",
    label: "🎸 Solo",
    description: "Secção maquete, normalmente improvisada",
    example: "Solo de guitarra em 'Hotel California'",
  },
  {
    value: "outro",
    label: "🔚 Outro (conclusão)",
    description: "Encerramento da música",
    example: "Fade out em 'Hey Jude' – The Beatles",
  },
];

const SortableMusicStructureItem = ({
  id,
  value,
}: {
  id: string;
  value: string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
  };

  const option = musicStructureOptions.find((opt) => opt.value === value);

  return (
    <div ref={setNodeRef} style={style} className="inline-block">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="default"
            className="rounded-full px-4 py-2 whitespace-nowrap m-1"
            {...attributes}
            {...listeners}
          >
            {option?.label}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{option?.description}</p>
          <p className="text-sm text-gray-600">Exemplo: {option?.example}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

/* ------------------ Navbar ------------------ */
interface NavbarProps {
  title: string;
}

function Navbar({ title }: NavbarProps) {
  return <ProfessionalNavbar title={title} />;
}

/* ------------------ Merged ContentLayout ------------------ */
interface ContentLayoutProps {
  title: string;
  children: React.ReactNode;
  /**
   * Quando false, não mostra o stepper/processo e nem renderiza o "ActiveStep".
   * Útil para reusar o mesmo "mecanismo" (navbar + sidebar + admin shell) em outras áreas,
   * como escrita literária.
   */
  showStepper?: boolean;
  /**
   * Steps e componentes podem ser sobrescritos para outros processos (ex.: literatura).
   */
  steps?: Step[];
  stepComponents?: Record<number, React.ComponentType<any>>;
  /**
   * Chave do step atual dentro do projeto (zustand). Por padrão usa "currentStep".
   * Ex.: "literatureStep" para não conflitar com o step de música.
   */
  stepKey?: string;
}

interface Step {
  name: string;
  link: string;
  timeframe: string;
  description: string;
}

interface MultiStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

const MultiStepper: React.FC<MultiStepperProps> = ({ steps, currentStep, onStepClick }) => {
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="flex flex-col gap-4 w-full overflow-x-auto">
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between relative">
        <div className="absolute left-[30%] top-0 h-full w-px bg-gray-300 dark:bg-gray-600" />
        <div className="absolute left-[70%] top-0 h-full w-px bg-gray-300 dark:bg-gray-600" />
        
        {steps.map((step, index) => (
          <div key={step.name} className="flex flex-col items-center flex-1 min-w-[80px]">
            <div className="flex items-center w-full">
              <button
                type="button"
                onClick={() => onStepClick && onStepClick(index)}
                className="flex items-center w-full focus:outline-none"
              >
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border text-sm font-medium transition-colors duration-300 ${
                        index <= currentStep
                          ? "bg-primary text-white border-primary"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{step.description}</p>
                  </TooltipContent>
                </Tooltip>
              </button>
              {index !== steps.length - 1 && (
                <div
                  className={`flex-1 h-1 ${
                    index < currentStep ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                  } mx-2`}
                ></div>
              )}
            </div>
            <span className="mt-2 text-xs text-center">{step.name}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900">
              Mês 1 - Pré-Produção
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Definir base sonora, conceito e letras</p>
          </TooltipContent>
        </Tooltip>
  <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="bg-green-100 dark:bg-green-900">
              Mês 2 - Produção
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Gravação, figurinos e filmagens</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900">
              Mês 3 - Pós-Produção
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Contratos, direitos autorais e lançamento</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

const LayoutDepthContext = React.createContext(0);

/* ------------------ Draggable Reference Sidebar ------------------ */
function DraggableReferenceSidebar() {
  const [position, setPosition] = useState({ x: 0, y: 89 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoHoverEnabled, setAutoHoverEnabled] = useState(false);
  const [savedSize, setSavedSize] = useState({ width: 420, height: typeof window !== 'undefined' ? window.innerHeight - 89 : 600 });
  const sidebarRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const STORAGE_KEY = "reference-sidebar-position";
  const STATE_STORAGE_KEY = "reference-sidebar-state";
  const AUTO_HOVER_KEY = "reference-sidebar-auto-hover";

  // Load saved position and state from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { x, y } = JSON.parse(saved);
        // Validate saved position is within viewport
        if (x >= 0 && x <= window.innerWidth && y >= 0 && y <= window.innerHeight) {
          setPosition({ x, y });
        } else {
          setPosition({ x: window.innerWidth - 420, y: 89 });
        }
      } else {
        // Default: right side, below navbar
        setPosition({ x: window.innerWidth - 420, y: 89 });
      }

      // Load saved state
      const savedState = localStorage.getItem(STATE_STORAGE_KEY);
      if (savedState) {
        const { minimized, fullscreen, size } = JSON.parse(savedState);
        if (minimized !== undefined) setIsMinimized(minimized);
        if (fullscreen !== undefined) setIsFullscreen(fullscreen);
        if (size) setSavedSize(size);
      }

      // Load auto-hover setting
      const savedAutoHover = localStorage.getItem(AUTO_HOVER_KEY);
      if (savedAutoHover !== null) {
        setAutoHoverEnabled(JSON.parse(savedAutoHover));
      }
    } catch (error) {
      console.error("Erro ao carregar posição/estado da sidebar:", error);
      // Fallback to default
      if (typeof window !== "undefined") {
        setPosition({ x: window.innerWidth - 420, y: 89 });
      }
    }
  }, []);

  // Save position and state to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Only save if position is valid
    if (position.x > 0 && position.y > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    }
  }, [position]);

  // Save state to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify({
      minimized: isMinimized,
      fullscreen: isFullscreen,
      size: savedSize
    }));
  }, [isMinimized, isFullscreen, savedSize]);

  // Save auto-hover setting
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(AUTO_HOVER_KEY, JSON.stringify(autoHoverEnabled));
  }, [autoHoverEnabled]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't drag if clicking on window controls
    if ((e.target as HTMLElement).closest('.window-controls')) {
      return;
    }
    
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    // Calculate offset from top-left corner
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMinimize = () => {
    if (!isMinimized) {
      // Save current size before minimizing
      if (containerRef.current) {
        setSavedSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    }
    setIsMinimized(!isMinimized);
    setIsFullscreen(false);
  };

  const handleFullscreen = () => {
    if (!isFullscreen) {
      // Save current size before fullscreen
      if (containerRef.current) {
        setSavedSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    }
    setIsFullscreen(!isFullscreen);
    setIsMinimized(false);
  };

  const handleClose = () => {
    setIsMinimized(true);
    setIsFullscreen(false);
  };

  const handleMouseEnter = () => {
    if (!autoHoverEnabled || isFullscreen) return;
    
    // Clear any pending timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    // If minimized, maximize on hover
    if (isMinimized) {
      setIsMinimized(false);
    }
  };

  const handleMouseLeave = () => {
    if (!autoHoverEnabled || isFullscreen || isMinimized) return;

    // Clear any pending timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Delay minimization slightly to avoid flickering
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isFullscreen) {
        setIsMinimized(true);
      }
    }, 300); // 300ms delay
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      
      // Calculate new position (top-left corner)
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;

      // Keep within viewport bounds with padding
      const padding = 8;
      newX = Math.max(padding, Math.min(window.innerWidth - containerWidth - padding, newX));
      newY = Math.max(padding, Math.min(window.innerHeight - containerHeight - padding, newY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Calculate dimensions based on state
  const getDimensions = () => {
    if (typeof window === 'undefined') {
      return { width: 420, height: 600 };
    }
    
    if (isMinimized) {
      return { width: 420, height: 40 }; // Just header height
    }
    if (isFullscreen) {
      return { 
        width: window.innerWidth, 
        height: window.innerHeight,
        left: 0,
        top: 0
      };
    }
    return { 
      width: savedSize.width || 420, 
      height: savedSize.height || (window.innerHeight - 89)
    };
  };

  const dimensions = getDimensions();
  const displayPosition = isFullscreen 
    ? { x: 0, y: 0 }
    : position;

  return (
    <aside
      ref={sidebarRef}
      className="hidden xl:flex flex-col fixed border bg-background dark:bg-zinc-900 shadow-lg rounded-lg overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        left: `${displayPosition.x}px`,
        top: `${displayPosition.y}px`,
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        maxHeight: isFullscreen ? '100vh' : `${dimensions.height}px`,
        cursor: isDragging ? "grabbing" : "default",
        transition: isDragging ? 'none' : 'all 0.2s ease-in-out',
        zIndex: 9998, // Always on top (just below FloatingNavbar which is 9999)
      }}
    >
      <div
        ref={containerRef}
        className={cn(
          "h-full flex flex-col transition-all",
          isDragging && "shadow-2xl scale-[1.01]"
        )}
      >
        {/* Header with Window Controls */}
        <div
          onMouseDown={handleMouseDown}
          className="cursor-grab active:cursor-grabbing px-4 py-2 border-b bg-muted/50 hover:bg-muted transition-colors flex items-center justify-between shrink-0"
          title="Arrastar sidebar"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <GripVertical className="h-4 w-4 opacity-60 hover:opacity-100 transition-opacity shrink-0" />
            <span className="text-xs font-medium text-muted-foreground truncate">Referências</span>
          </div>
          
          {/* Window Controls */}
          <div className="flex items-center gap-1 window-controls shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 px-1">
                  <Switch
                    checked={autoHoverEnabled}
                    onCheckedChange={setAutoHoverEnabled}
                    className="h-4 w-8"
                  />
                  <span className="text-[10px] text-muted-foreground">Auto</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {autoHoverEnabled ? "Desativar auto-minimizar/maximizar no hover" : "Ativar auto-minimizar/maximizar no hover"}
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-muted"
                  onClick={handleMinimize}
                  title={isMinimized ? "Maximizar" : "Minimizar"}
                >
                  {isMinimized ? (
                    <Maximize2 className="h-3 w-3" />
                  ) : (
                    <Minus className="h-3 w-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isMinimized ? "Maximizar" : "Minimizar"}</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-muted"
                  onClick={handleFullscreen}
                  title={isFullscreen ? "Restaurar" : "Tela cheia"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-3 w-3" />
                  ) : (
                    <Square className="h-3 w-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFullscreen ? "Restaurar" : "Tela cheia"}</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleClose}
                  title="Fechar"
                >
                  <X className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fechar</TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        {/* Content */}
        {!isMinimized && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <ReferenceTabs />
          </div>
        )}
      </div>
    </aside>
  );
}

export function ContentLayout({
  title,
  children,
  showStepper = true,
  steps: stepsOverride,
  stepComponents: stepComponentsOverride,
  stepKey = "currentStep",
}: ContentLayoutProps) {
  const sidebar = useSidebar();
  const { settings, setSettings } = sidebar;
  // Stepper sync with global store must be declared before any early return
  const [currentStep, setCurrentStep] = useState(0);
  const projectStore = useProject();
  useEffect(() => {
    if (projectStore.project && typeof (projectStore.project as any)?.[stepKey] === "number") {
      setCurrentStep((projectStore.project as any)[stepKey]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const depth = React.useContext(LayoutDepthContext);
  if (depth > 0) {
    return <>{children}</>;
  }

  const defaultSteps: Step[] = [
    { name: "Maquete", link: "/obraeurudita", timeframe: "Mês 1", description: "Definir conceito, moodboard, roteiro e tratamento" },
    { name: "Gravação", link: "/gravacao", timeframe: "Mês 1", description: "Agendar estúdio e gravar todas as faixas" },
    { name: "Vestuário", link: "/vestuario", timeframe: "Mês 2", description: "Produzir e provar figurinos para vídeo e material de imprensa" },
    { name: "Orçamento e Aluguer", link: "/orcamento", timeframe: "Mês 2", description: "Distribuir verba entre estúdio, equipe, figurino e reserva" },
    { name: "Filmagem", link: "/filmagem", timeframe: "Mês 2", description: "Executar gravação de vídeo" },
    { name: "Fotografia", link: "/fotografia", timeframe: "Mês 2", description: "Fotos" },
    { name: "Edição de Vídeo  ", link: "/videoclipe", timeframe: "Mês 2", description: "After Effects, Premiere, Davinci Resolve & Photoshop" },
    { name: "Contratualização", link: "/contratualizacao", timeframe: "Mês 3", description: "Fechar contratos com artistas, equipe, distribuidores e plataformas" },
    { name: "Direitos Autorais", link: "/direitosautorais", timeframe: "Mês 3", description: "Registrar obras, liberar samples e licenciar sincronizações" },
    { name: "Lançamento", link: "/lancamento", timeframe: "Mês 3", description: "Implementar distribuição digital, PR, marketing e monitorar resultados" },
    ];

  const defaultStepComponents: Record<number, React.ComponentType<any>> = {
    0: MaqueteStep,
    1: GravacaoStep,
    2: VestuarioStep,
    3: OrcamentoStep,
    4: FilmagemStep,
    5: FotografiaStep,
    6: VideoEditChecklist,
    7: ContratualizacaoStep,
    8: DireitosAutoraisStep,
    9: LancamentoStep,
  };

  const steps = stepsOverride ?? defaultSteps;
  const stepComponents = stepComponentsOverride ?? defaultStepComponents;

 

  const ActiveStep = stepComponents[currentStep] ?? (() => null);

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    projectStore.update({ [stepKey]: index } as any);
  };

  return (
    <LayoutDepthContext.Provider value={depth + 1}>
      <TooltipProvider>
      <div className="w-full overflow-hidden transition-all duration-300">
        <Navbar title={title} />
        {/* Right reference sidebar with tabs - Draggable */}
        <DraggableReferenceSidebar />
        
        <AdminPanelLayout>
          <div className="w-full pt-8 pb-8 px-4 mx-auto max-w-[1800px] xl:pr-[440px]">
            <div className="p-4 items-center w-full">
              <div className="w-full">
                {showStepper && (
                  <>
                    <Card className="w-full mb-4">
                      <CardHeader className="items-center">
                        <div className="flex items-center gap-4 w-full">
                          <MultiStepper
                            steps={steps}
                            currentStep={currentStep}
                            onStepClick={handleStepClick}
                          />
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon" className="w-8 h-8">
                                <span className="text-sm">i</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[800px]">
                              <DialogHeader>
                                <DialogTitle>Ciclo Trimestral de Execução</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h3 className="font-semibold mb-2">Mês 1 – Pré-Produção</h3>
                                  <ol className="list-decimal pl-6 space-y-2">
                                    <li><strong>maquete</strong> - Criar arranjos e demos para definir a base sonora.</li>
                                    <li><strong>Contextualização</strong> - Definir conceito, moodboard, roteiro e tratamento.</li>
                                    <li><strong>Versificação</strong> - Finalizar letras e estrutura poética.</li>
                                  </ol>
                                </div>

                                <div>
                                  <h3 className="font-semibold mb-2">Mês 2 – Produção</h3>
                                  <ol className="list-decimal pl-6 space-y-2" start={4}>
                                    <li><strong>Gravação</strong> - Agendar estúdio e gravar todas as faixas.</li>
                                    <li><strong>Vestuário</strong> - Produzir e provar figurinos para vídeo e material de imprensa.</li>
                                    <li><strong>Orçamentalização</strong> - Distribuir verba entre estúdio, equipe, figurino e reserva.</li>
                                    <li><strong>Filmagens</strong> - Executar gravação de vídeo e bastidores.</li>
                                  </ol>
                                </div>

                                <div>
                                  <h3 className="font-semibold mb-2">Mês 3 – Pós-Produção & Lançamento</h3>
                                  <ol className="list-decimal pl-6 space-y-2" start={8}>
                                    <li><strong>Contratualização</strong> - Fechar contratos com artistas, equipe, distribuidores e plataformas.</li>
                                    <li><strong>Direitos Autorais</strong> - Registrar obras, liberar samples e licenciar sincronizações.</li>
                                    <li><strong>Lançamento</strong> - Implementar distribuição digital, PR, marketing e monitorar resultados.</li>
                                  </ol>
                                </div>

                                <div>
                                  <h3 className="font-semibold mb-2">Revisão e Ajustes</h3>
                                  <ul className="list-disc pl-6 space-y-2">
                                    <li>Ao final do trimestre, avaliar KPIs (streams, views, engajamento) e lições aprendidas.</li>
                                    <li>Ajustar o plano do próximo trimestre com base nos resultados e feedback.</li>
                                  </ul>
                                  <p className="mt-2">
                                    Repita este ciclo a cada três meses para manter ritmo, controle orçamentário e capacidade de adaptação rápida.
                                  </p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent className="py-0" />
                    </Card>

                    <ActiveStep />
                  </>
                )}
              </div>
            </div>

            {children}
          </div>
        </AdminPanelLayout>
      </div>
    </TooltipProvider>
    </LayoutDepthContext.Provider>
  );
}
/* ---------------- End Merged ContentLayout ---------------- */

/* ---------------- Maquete Step (Narratologia + Featuring) ---------------- */
const POETIC_FORMS = [
  "Verso livre",
  "Poesia didática",
  "Soneto (petrarquiano)",
  "Soneto (shakespeariano)",
  "Haicai / Haiku",
  "Sestina - 6 palavras a repetirem em terês versos, repetindo em formas diferentes mas sempre as 6 palavras ",
  "Terza rima",
  "Villanela",
  "Ode",
  "Elegia",
  "Égloga / Ídilio",
  "Balada",
  "Épico / Epopeia",
  "Dramático (peça em versos)",
  "Limerick",
  "Pantum / Pantoum",
  "Ghazal",
  "Acróstico",
  "Concreta / Visual",
  "Prosa poética",
  "Cântico / Hino",
  "Ode pindárica",
  "Ode horaciana",
  "Redondilha (maior/menor)",
  "Quadra popular",
];

// Recursos educativos rápidos por forma poética (links do YouTube fornecidos)
const POETIC_FORM_VIDEOS: Record<string, { urls: string[]; note?: string }> = {
  "Verso livre": {
    urls: ["https://www.youtube.com/watch?v=G_UUhcLgsUU"],
    note: "Conceito e exemplos de verso livre vs. forma fixa",
  },
  "Poesia didática": {
    urls: ["https://www.youtube.com/watch?v=VGMnm-QBtXs"],
    note: "Ensino de poesia e dimensão didática",
  },
  "Soneto (petrarquiano)": {
    urls: ["https://www.youtube.com/watch?v=em03jf2CNbQ"],
  },
  "Soneto (shakespeariano)": {
    urls: ["https://www.youtube.com/watch?v=uOng0fR_Zho"],
  },
  "Haicai / Haiku": {
    urls: ["https://www.youtube.com/watch?v=1u1OtmAQX9Q"],
  },
  Sestina: {
    urls: ["https://www.youtube.com/watch?v=sBQfQD5eTTI"],
    note: "Vídeo geral sobre formas fixas (sestina é rara em PT)",
  },
  "Terza rima": {
    urls: ["https://www.youtube.com/watch?v=5ibqf4JRy3s"],
    note: "Rimas encadeadas e prática",
  },
  Villanela: {
    urls: [],
    note: "Forma rara em PT — procurar em EN com legendas",
  },
  Ode: {
    urls: ["https://www.youtube.com/watch?v=73uE6FDHs24"],
  },
  Elegia: {
    urls: ["https://www.youtube.com/watch?v=EfcVtR8n6sA"],
  },
  "Égloga / Ídilio": {
    urls: [
      "https://www.youtube.com/watch?v=RGkvuiO2MfU",
      "https://www.youtube.com/watch?v=9g17mnwHoCg",
    ],
  },
  Balada: {
    urls: ["https://www.youtube.com/watch?v=ssq11l3lrAo"],
  },
  "Épico / Epopeia": {
    urls: ["https://www.youtube.com/watch?v=JBD-hS3OgJc"],
  },
  "Dramático (peça em versos)": {
    urls: ["https://www.youtube.com/watch?v=yIATxMuX6PU"],
  },
  Limerick: {
    urls: ["https://www.youtube.com/watch?v=0u24G8E0q3Q"],
  },
  "Pantum / Pantoum": {
    urls: [],
    note: "Sem vídeo específico em PT — consulte textos de referência",
  },
  Ghazal: {
    urls: [],
    note: "Sem vídeo específico em PT — pesquise traduções e análises",
  },
  Acróstico: {
    urls: ["https://www.youtube.com/watch?v=1XT9jdPMHKk"],
  },
  "Concreta / Visual": {
    urls: ["https://www.youtube.com/watch?v=JF-tsbaE3BU"],
  },
  "Prosa poética": {
    urls: ["https://www.youtube.com/watch?v=DlawHfwmyS4"],
  },
  "Cântico / Hino": {
    urls: ["https://www.youtube.com/watch?v=EVukWdYCmBY"],
  },
  "Ode pindárica": {
    urls: ["https://www.youtube.com/watch?v=yWIdo0sSmi0"],
  },
  "Ode horaciana": {
    urls: ["https://www.youtube.com/watch?v=yWIdo0sSmi0"],
    note: "Referência geral sobre odes",
  },
  "Redondilha (maior/menor)": {
    urls: ["https://www.youtube.com/watch?v=_EeJ1Qlqszw"],
  },
  "Quadra popular": {
    urls: ["https://www.youtube.com/watch?v=lrNGdrZfUVY"],
  },
};

function MaqueteStep() {
  const { project, update } = useProject();
  const strophes = useMemo(() => project?.strophes ?? [], [project?.strophes]);

  const setStropheForm = useCallback((stropheId: string, form: string) => {
    const next = (strophes || []).map((s: any) => (s.id === stropheId ? { ...s, poeticForm: form } : s));
    update({ strophes: next });
  }, [strophes, update]);

  const addStrophe = useCallback(() => {
    const newStrophe = { id: `s-${Date.now()}`, verses: [], description: "", poeticForm: "" } as any;
    const next = [...(strophes || []), newStrophe];
    update({ strophes: next });
  }, [strophes, update]);

  return (
    <ContentLayout title="Maquete">
      <div className="space-y-6">
        <div className="flex items-center justify-end gap-2">
          <FeaturingManager />
        </div>
        <SynopsisCRUD />

        <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Forma poética por estrofe</CardTitle>
            <Button size="sm" onClick={addStrophe}>Adicionar estrofe</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {strophes.length === 0 && (
            <div className="text-sm text-muted-foreground">Ainda não há estrofes neste projeto.</div>
          )}
          {strophes.map((s: any, idx: number) => {
            const resources = s.poeticForm ? POETIC_FORM_VIDEOS[s.poeticForm] : undefined;
            const firstUrl = resources?.urls?.[0];
            return (
              <div key={s.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div className="text-sm font-medium">Estrofe {idx + 1}</div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <Select value={s.poeticForm || ""} onValueChange={(val: string) => setStropheForm(s.id, val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolhe a forma poética" />
                    </SelectTrigger>
                    <SelectContent>
                      {POETIC_FORMS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {firstUrl ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={firstUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Ver vídeo recomendado para ${s.poeticForm}`}
                        >
                          <Button variant="outline" size="icon" className="shrink-0">
                            <Video className="h-4 w-4" />
                          </Button>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ver vídeo recomendado ({s.poeticForm})</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : s.poeticForm ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button variant="outline" size="icon" className="shrink-0" disabled>
                            <Video className="h-4 w-4" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Sem vídeo específico — pesquisar no YouTube</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      </div>
    </ContentLayout>
  );
}
/* ---------------- End Maquete Step ---------------- */

/* ---------------- Admin-Panel helpers ---------------- */
// Footer
function Footer() {
  return (
    <div className="z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-4 md:mx-8 flex h-14 items-center">
        <p className="text-xs md:text-sm leading-loose text-muted-foreground text-left">© PRETOS MUSIC 2025</p>
      </div>
    </div>
  );
}

// User Navigation (avatar dropdown)
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
            <p className="text-sm font-medium leading-none">Diepretty Mercédes</p>
            <p className="text-xs leading-none text-muted-foreground">johndoe@example.com</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/obraeurudita" className="flex items-center">
              <LayoutGrid className="w-4 h-4 mr-3 text-muted-foreground" /> Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/custosfixos" className="flex items-center">
              <LayoutGrid className="w-4 h-4 mr-3 text-muted-foreground" /> Custos&nbsp;Fixos
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
          <LogOut className="w-4 h-4 mr-3 text-muted-foreground" /> Sign&nbsp;out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Sidebar Toggle button
function SidebarToggle({ isOpen, setIsOpen }: { isOpen: boolean | undefined; setIsOpen?: () => void }) {
  return (
    <div className="invisible lg:visible absolute top-[12px] -right-[16px] z-20">
      <Button onClick={() => setIsOpen?.()} className="rounded-md w-8 h-8" variant="outline" size="icon">
        <ChevronLeft className={cn("h-4 w-4 transition-transform ease-in-out duration-700", isOpen === false ? "rotate-180" : "rotate-0")} />
      </Button>
    </div>
  );
}

// Sheet / menu for small screens
function SheetMenu() {
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
        <SheetHeader>
          <Button className="flex justify-center items-center pb-2 pt-1" variant="link" asChild>
            <Link href="/obraeurudita" className="flex items-center gap-2">
              <PanelsTopLeft className="w-6 h-6 mr-1" />
              <SheetTitle className="font-bold text-lg">Brand</SheetTitle>
            </Link>
          </Button>
        </SheetHeader>
        <MenuComponent isOpen />
      </SheetContent>
    </Sheet>
  );
}

// Menu component (rhyme helper)
interface MenuProps { isOpen: boolean | undefined }
function MenuComponent({ isOpen }: MenuProps) {
  // ... (for brevity we invoke original Menu logic by calling getMenuList etc.)
  return <div></div>;
}

// Rimas Sidebar component (local component for rhymes helper - not currently used)
// Removed to avoid conflict with imported Sidebar component

// Admin Panel Layout
function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const sidebarStore = useSidebar();
  if (!sidebarStore) return null;
  const { getOpenState, settings } = sidebarStore;
  return (
    <>
      <Sidebar />
      <main className={cn("min-h-[calc(100vh_-_56px)] bg-zinc-50 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300", !settings.disabled && (!getOpenState() ? "lg:ml-[70px]" : "lg:ml-64"))}>{children}</main>
      <footer className={cn("transition-[margin-left] ease-in-out duration-300", !settings.disabled && (!getOpenState() ? "lg:ml-[90px]" : "lg:ml-72"))}>
        <Footer />
      </footer>
    </>
  );
}

/* ---------------- End Admin-Panel helpers ---------------- */

const Dashboard = () => {
  const router = useRouter();
  const { settings } = useSidebar();
  const [activeTab, setActiveTab] = useState("versos");
  const [strophes, setStrophes] = useState<Strophe[]>([
    {
      id: Date.now().toString(),
      architecture: "Prólogo",
      description:
        "Introdução que apresenta o contexto inicial da obra, preparando o cenário para a narrativa principal.",
      verses: [],
    },
  ]);
  const [songInfo, setSongInfo] = useState<SongInfo>(initialSongInfo);
  const [fullLyrics, setFullLyrics] = useState("");
  const [draggedVerseId, setDraggedVerseId] = useState<string | null>(null);
  const stropheEndRef = useRef<HTMLDivElement>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [modoNietzsche, setModoNietzsche] = useState(false);

  const [trackNames, setTrackNames] = useState<string[]>([
    "Vida Louca",
    "Noite Eterna",
    "Caminhos Cruzados",
    "Luzes da Cidade",
  ]);

  const [projectNames, setProjectNames] = useState<string[]>([
    "Projeto Fênix",
    "Operação Eclipse",
    "Missão Alfa",
    "Código Vermelho",
  ]);

  // --- Global Project Store wiring (persist across routes/refresh) ---
  const project = useProject((s) => s.project);
  const updateProject = useProject((s) => s.update);

  // Hydrate local editor state from global store on mount (only if store has data)
  useEffect(() => {
    if (project?.strophes && project.strophes.length > 0) {
      setStrophes(project.strophes as unknown as Strophe[]);
    }
    if (project?.songInfo && (
      project.songInfo.title || project.songInfo.artist || project.songInfo.producer || (project.songInfo.featuring?.length ?? 0) > 0
    )) {
      setSongInfo(project.songInfo as unknown as SongInfo);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mirror changes to the global store (debounced save happens in the store itself)
  useEffect(() => {
    updateProject({ strophes });
  }, [strophes, updateProject]);

  useEffect(() => {
    updateProject({ songInfo });
  }, [songInfo, updateProject]);

  const [producerNames, setProducerNames] = useState<string[]>([
    "Xando",
    "Oxyn",
    "Bludi",
    "Ramos",
    "Diepretty",
    "Fooliedude",
  ]);

  const [artistNames, setArtistNames] = useState<string[]>(["Diepretty"]);

  const [musicStructure, setMusicStructure] = useState<string[]>([]);

  const getDescription = (name: string, category: any[]) => {
    for (const cat of category) {
      const tech = cat.techniques.find((t: any) => t.name === name);
      if (tech) return tech.description;
    }
    return "";
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    stropheEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [strophes.length]);

  const handleAddStrophe = () => {
    const newStrophe: Strophe = {
      id: Date.now().toString(),
      architecture: "Prólogo",
      description:
        "Introdução que apresenta o contexto inicial da obra, preparando o cenário para a narrativa principal.",
      verses: [],
    };
    setStrophes([...strophes, newStrophe]);
  };

  const handleVerseChange = (
    stropheIndex: number,
    verseIndex: number,
    newVerse: Verse,
  ) => {
    const newStrophes = [...strophes];
    newStrophes[stropheIndex].verses[verseIndex] = newVerse;
    setStrophes(newStrophes);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Verifica se o arrasto é para a estrutura musical
      if (musicStructure.includes(active.id as string)) {
        const oldIndex = musicStructure.indexOf(active.id as string);
        const newIndex = musicStructure.indexOf(over.id as string);
        const newStructure = arrayMove(musicStructure, oldIndex, newIndex);
        setMusicStructure(newStructure);
      }
      // Caso contrário, é para os versos
      else {
        const oldStropheIndex = strophes.findIndex((s) =>
          s.verses.some((v) => v.id === active.id),
        );
        const newStropheIndex = strophes.findIndex((s) =>
          s.verses.some((v) => v.id === over.id),
        );

        const oldVerseIndex = strophes[oldStropheIndex].verses.findIndex(
          (v) => v.id === active.id,
        );
        const newVerseIndex = strophes[newStropheIndex].verses.findIndex(
          (v) => v.id === over.id,
        );

        const newStrophes = [...strophes];
        const movedVerse = newStrophes[oldStropheIndex].verses[oldVerseIndex];

        newStrophes[oldStropheIndex].verses.splice(oldVerseIndex, 1);
        newStrophes[newStropheIndex].verses.splice(
          newVerseIndex,
          0,
          movedVerse,
        );

        setStrophes(newStrophes);
      }
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginBottom = 20;

    doc.setFontSize(18);
    doc.text(
      `${songInfo.artist.toUpperCase()} - ${songInfo.title.toUpperCase()}`,
      10,
      y,
    );
    y += 10;

    if (songInfo.featuring.length > 0) {
      doc.setFontSize(12);
      doc.text(`FEATURING: ${songInfo.featuring.join(", ")}`, 10, y);
      y += 10;
    }

    if (songInfo.producer) {
      doc.text(`PRODUCED BY: ${songInfo.producer.toUpperCase()}`, 10, y);
      y += 10;
    }

    const addPageIfNeeded = () => {
      if (y > pageHeight - marginBottom) {
        doc.addPage();
        y = 20;
      }
    };

    strophes.forEach((strophe, stropheIndex) => {
      addPageIfNeeded();
      doc.setFontSize(14);
      doc.text(`Estrofe ${stropheIndex + 1} (${strophe.architecture})`, 10, y);
      y += 10;

      strophe.verses.forEach((verse) => {
        addPageIfNeeded();

        let line = verse.words
          .map((word) => (word.stressed ? `**${word.text}**` : word.text))
          .join(" ");

        if (verse.adlib) line += ` (${verse.adlib.toUpperCase()})`;

        const words = line.split(" ");
        let x = 15;
        words.forEach((word) => {
          if (word.startsWith("**") && word.endsWith("**")) {
            doc.setFont("helvetica", "bold");
            doc.text(word.replace(/\*\*/g, ""), x, y);
            x += doc.getTextWidth(word.replace(/\*\*/g, "")) + 2;
          } else {
            doc.setFont("helvetica", "normal");
            doc.text(word, x, y);
            x += doc.getTextWidth(word) + 2;
          }
        });
        y += 10;
      });

      y += 10; // space between strophes
    });

    doc.save(
      `${songInfo.artist || "artista"}_${songInfo.title || "musica"}.pdf`,
    );
  };

  const handleAnalyzeMeter = async () => {
    const versesText = strophes
      .flatMap((strophe) => strophe.verses)
      .map((verse) => verse.words.map((word) => word.text).join(" "))
      .join("\n");

    try {
      const result = await analyzeMeter(versesText);
      if (!result) {
        push({ msg: "Erro ao analisar a métrica", kind: "error" });
        return;
      }
      setAnalysisResult(result);
      setShowAnalysis(true);
    } catch (error) {
      console.error("Erro ao analisar a métrica:", error);
      push({ msg: "Erro ao analisar a métrica", kind: "error" });
    }
  };

  const [state, setState] = useState({
    strophes,
    songInfo,
    analysisResult,
    showAnalysis,
    selectedVerses,
    trackNames,
    projectNames,
    producerNames,
    artistNames,
  });

  const debouncedLocalSave = useMemo(
    () =>
      debounce(async (s: any) => {
        await saveProjectLocally(s);
      }, 2000),
    [],
  );

  const debouncedCloudSync = useMemo(
    () =>
      debounce(async (s: any) => {
        const userId = getCurrentUserId();
        if (userId) await syncProjectToCloud(userId, s);
      }, 30000),
    [],
  );

  const { push } = useToastLite();
  useEffect(() => {
    debouncedLocalSave(state);
    debouncedCloudSync(state);

    return () => {
      debouncedLocalSave.cancel();
      debouncedCloudSync.cancel();
    };
  }, [state, debouncedLocalSave, debouncedCloudSync]);

  const handleSaveProject = async () => {
    try {
      const current = useProject.getState().project;
      if (!current) {
        push({ msg: "Nenhum projeto atual", kind: "error" });
        return;
      }
      const toSave = { ...current, strophes, songInfo, updatedAt: new Date().toISOString() };
      const { saveProjectToIndexedDB } = await import("@/lib/db");
      await saveProjectToIndexedDB(toSave);
      
  push({ msg: "Projeto salvo!", kind: "success" });
    } catch (error) {
      console.error("Erro ao salvar projeto:", error);
      push({ msg: "Erro ao salvar projeto.", kind: "error" });
    }
  };

  // Carrega as estrofes ao iniciar o componente
  useEffect(() => {
    const projetoCarregado = carregarProjeto();
    if (projetoCarregado && projetoCarregado.strophes) {
      setStrophes(projetoCarregado.strophes);
    }
  }, []);

  // Salva as estrofes sempre que houver mudança
  useEffect(() => {
    const projetoAtual = {
      strophes: strophes,
      ultimaAtualizacao: new Date().toISOString(),
    };
    salvarProjeto(projetoAtual);
  }, [strophes]);

  const handleNietzscheModeChange = (checked: boolean) => {
    setModoNietzsche(checked);
    if (checked) {
      router.push("/modonieztche"); // Redireciona para a página @modonieztche
    }
  };

  const handleAddMusicSection = (value: string) => {
    if (!musicStructure.includes(value)) {
      setMusicStructure((prev) => [...prev, value]);
    }
  };

  const handleRemoveMusicSection = (value: string) => {
    setMusicStructure((prev) => prev.filter((v) => v !== value));
  };

  const [storyConfig, setStoryConfig] = useState({
    introduction: "",
    elements: "",
    focalization: "",
    structure: "",
  });

  return (
    <ContentLayout title="Versificação">
      <div className="w-full mx-auto max-w-[1800px] px-4">
        {/* Existing Artist/Producer Card */}
        <Card className="w-full mb-6">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="ARTISTA PRINCIPAL"
                    value={songInfo.artist || ""}
                    onChange={(e) =>
                      setSongInfo((prev) => ({
                        ...prev,
                        artist: e.target.value.toUpperCase(),
                      }))
                    }
                    className="text-xl font-bold uppercase border border-gray-300 flex-1"
                  />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Sugestões de Artistas</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2">
                        {artistNames.map((name, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() =>
                                setSongInfo((prev) => ({
                                  ...prev,
                                  artist: name.toUpperCase(),
                                }))
                              }
                            >
                              {name}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() =>
                                setArtistNames((prev) =>
                                  prev.filter((_, i) => i !== index),
                                )
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Input
                        placeholder="Adicionar novo artista"
                        className="mt-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const target = e.target as HTMLInputElement;
                            if (target.value.trim()) {
                              setArtistNames((prev) => [...prev, target.value]);
                              target.value = "";
                            }
                          }
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    placeholder="PRODUTOR MUSICAL"
                    value={songInfo.producer}
                    onChange={(e) =>
                      setSongInfo((prev) => ({
                        ...prev,
                        producer: e.target.value.toUpperCase(),
                      }))
                    }
                    className="text-sm flex-1"
                  />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Sugestões de Produtores</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2">
                        {producerNames.map((name, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() =>
                                setSongInfo((prev) => ({
                                  ...prev,
                                  producer: name.toUpperCase(),
                                }))
                              }
                            >
                              {name}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() =>
                                setProducerNames((prev) =>
                                  prev.filter((_, i) => i !== index),
                                )
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Input
                        placeholder="Adicionar novo produtor"
                        className="mt-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const target = e.target as HTMLInputElement;
                            if (target.value.trim()) {
                              setProducerNames((prev) => [
                                ...prev,
                                target.value,
                              ]);
                              target.value = "";
                            }
                          }
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <Input
                  placeholder="TÍTULO DA MÚSICA"
                  value={songInfo.title}
                  onChange={(e) =>
                    setSongInfo((prev) => ({
                      ...prev,
                      title: e.target.value.toUpperCase(),
                    }))
                  }
                  className="text-xl font-bold uppercase border border-gray-300"
                />
                <div className="flex items-center gap-2 mt-2">
                  <TitleSuggestionsDialog />
                  <HitFrameworkDialog />
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="ml-2">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Sugestões de Títulos</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-bold mb-2">Nomes de Faixas</h3>
                        <div className="space-y-2">
                          {trackNames.map((name, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() =>
                                setSongInfo((prev) => ({
                                  ...prev,
                                  title: name.toUpperCase(),
                                }))
                              }
                            >
                              {name}
                            </Button>
                          ))}
                        </div>
                        <Input
                          placeholder="Adicionar novo nome"
                          className="mt-2"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const target = e.target as HTMLInputElement;
                              if (target.value.trim()) {
                                setTrackNames((prev) => [
                                  ...prev,
                                  target.value,
                                ]);
                                target.value = "";
                              }
                            }
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold mb-2">Nomes de Projetos</h3>
                        <div className="space-y-2">
                          {projectNames.map((name, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() =>
                                setSongInfo((prev) => ({
                                  ...prev,
                                  title: name.toUpperCase(),
                                }))
                              }
                            >
                              {name}
                            </Button>
                          ))}
                        </div>
                        <Input
                          placeholder="Adicionar novo nome"
                          className="mt-2"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const target = e.target as HTMLInputElement;
                              if (target.value.trim()) {
                                setProjectNames((prev) => [
                                  ...prev,
                                  target.value,
                                ]);
                                target.value = "";
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              
              </div>

              <div className="flex items-center justify-between">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="narratologia">Narratologia</TabsTrigger>
                    <TabsTrigger value="versos">Versificação</TabsTrigger>
                    <TabsTrigger value="cinematografia">
                      Cinematografia
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex items-center gap-2">
                  <Label htmlFor="modo-nietzsche">Modo Nietzsche</Label>
                  <Switch
                    id="modo-nietzsche"
                    checked={modoNietzsche}
                    onCheckedChange={handleNietzscheModeChange}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        

        {/* Existing Music Structure Card */}
        <Card className="w-full mb-6">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-bold">Estrutura Musical</h3>

              {/* Selected Sections */}
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={musicStructure}
                  strategy={horizontalListSortingStrategy}
                >
                  <div className="flex flex-wrap gap-2 p-2 border rounded">
                    {musicStructure.map((value, index) => (
                      <SortableMusicStructureItem
                        key={value}
                        id={value}
                        value={value}
                      />
                    ))}
                    {musicStructure.length === 0 && (
                      <p className="text-gray-500">Adicione seções abaixo</p>
                    )}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Available Sections */}
              <div className="flex gap-2 overflow-x-auto p-2">
                {musicStructureOptions.map((option) => (
                  <Tooltip key={option.value}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          musicStructure.includes(option.value)
                            ? "default"
                            : "outline"
                        }
                        onClick={() => {
                          if (musicStructure.includes(option.value)) {
                            handleRemoveMusicSection(option.value);
                          } else {
                            handleAddMusicSection(option.value);
                          }
                        }}
                        className="rounded-full px-4 py-2 whitespace-nowrap"
                      >
                        {option.label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{option.description}</p>
                      <p className="text-sm text-gray-600">
                        Exemplo: {option.example}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* ---------- RENDERIZAÇÃO CONDICIONADA DAS ABAS ---------- */}
        {activeTab === "narratologia" && (
          <NarratologiaTab />
        )}

        {activeTab === "versos" && (
          <div className="space-y-6 w-full">
            {strophes.map((strophe, stropheIndex) => (
              <Card key={strophe.id} className="p-6 w-full">
                <div className="flex justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold">{stropheIndex + 1}</h3>
                    <div className="flex gap-4">
                      {/* DramArq Select */}
                      <select
                        value={strophe.architecture}
                        onChange={(e) => {
                          const newStrophes = [...strophes];
                          newStrophes[stropheIndex].architecture =
                            e.target.value;
                          setStrophes(newStrophes);
                        }}
                        className="p-2 border rounded"
                      >
                        {dramArqOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.value}
                            <Input
                              size={14}
                              className="ml-2"
                              title={opt.description}
                            />
                          </option>
                        ))}
                      </select>
                            {/* Removed duplicate AdlibsDialog at strophe level to avoid confusion; adlibs are set per-verse now */}

                      {/* Three Act Structure Select */}
                      <select
                        value={strophe.threeAct || ""}
                        onChange={(e) => {
                          const newStrophes = [...strophes];
                          newStrophes[stropheIndex].threeAct = e.target.value;
                          setStrophes(newStrophes);
                        }}
                        className="p-2 border rounded"
                      >
                        <option value="">Estrutura em 3 Atos</option>
                        {threeActStructure.map((act) => (
                          <optgroup key={act.category} label={act.category}>
                            {act.techniques.map((tech) => (
                              <option key={tech.name} value={tech.name}>
                                {tech.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>

                      {/* Music Section Select */}
                      <select
                        value={strophe.musicSection || ""} // Usando strophe.musicSection em vez de strophe.verses[0]?.musicSection
                        onChange={(e) => {
                          const newStrophes = [...strophes];
                          newStrophes[stropheIndex].musicSection =
                            e.target.value; // Atualizando a seção musical na estrofe
                          setStrophes(newStrophes);
                        }}
                        className="p-2 border rounded"
                      >
                        <option value="">Seção Musical</option>
                        {musicStructure.map((section) => (
                          <option key={section} value={section}>
                            {
                              musicStructureOptions.find(
                                (opt) => opt.value === section,
                              )?.label
                            }
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      setStrophes(strophes.filter((_, i) => i !== stropheIndex))
                    }
                  >
                    Remover Estrofe
                  </Button>
                </div>

                {strophe.architecture === "Episódios" && (
                  <div className="mb-4">
                    <Label>Subcategoria do Episódio</Label>
                    <select
                      value={strophe.architectureDesc || ""}
                      onChange={(e) => {
                        const newStrophes = [...strophes];
                        newStrophes[stropheIndex].architectureDesc =
                          e.target.value;
                        setStrophes(newStrophes);
                      }}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Selecione uma subcategoria</option>
                      {dramArqOptions
                        .find((opt) => opt.value === "Episódios")
                        ?.subtypes?.map((subtype) => (
                          <option key={subtype.value} value={subtype.value}>
                            {subtype.value}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-sm font-semibold">
                    {strophe.architecture === "Episódios" &&
                    strophe.architectureDesc
                      ? dramArqOptions
                          .find((opt) => opt.value === "Episódios")
                          ?.subtypes?.find(
                            (sub) => sub.value === strophe.architectureDesc,
                          )?.instruction
                      : dramArqOptions.find(
                          (opt) => opt.value === strophe.architecture,
                        )?.instruction}
                  </p>
                  {strophe.threeAct && (
                    <p className="text-sm font-semibold mt-2">
                      {
                        threeActStructure
                          .flatMap((act) => act.techniques)
                          .find((tech) => tech.name === strophe.threeAct)
                          ?.description
                      }
                    </p>
                  )}
                  {strophe.musicSection && ( // Usando strophe.musicSection em vez de strophe.verses[0]?.musicSection
                    <p className="text-sm font-semibold mt-2">
                      {
                        musicStructureOptions.find(
                          (opt) => opt.value === strophe.musicSection,
                        )?.description
                      }
                    </p>
                  )}
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  onDragStart={({ active }) =>
                    setDraggedVerseId(active.id as string)
                  }
                >
                  <SortableContext
                    items={strophe.verses.map((v) => v.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {strophe.verses.map((verse, verseIndex) => (
                      <SortableVerse
                        key={verse.id}
                        verse={verse}
                        stropheIndex={stropheIndex}
                        verseIndex={verseIndex}
                        onVerseChange={(newVerse) =>
                          handleVerseChange(stropheIndex, verseIndex, newVerse)
                        }
                        onRemove={() => {
                          const newStrophes = [...strophes];
                          newStrophes[stropheIndex].verses.splice(
                            verseIndex,
                            1,
                          );
                          setStrophes(newStrophes);
                        }}
                        onDragStart={setDraggedVerseId}
                        modoNietzsche={modoNietzsche}
                        musicStructure={musicStructure} // Passando a prop musicStructure
                      />
                    ))}
                  </SortableContext>
                  <DragOverlay dropAnimation={defaultDropAnimation}>
                    {draggedVerseId ? (
                      <div className="opacity-50 border p-4 rounded-lg bg-white dark:bg-gray-800">
                        {strophes
                          .flatMap((s) => s.verses)
                          .find((v) => v.id === draggedVerseId)
                          ?.words.map((w) => w.text)
                          .join(" ")}
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>

                <div className="mt-4 flex gap-4">
                  <input
                    type="text"
                    placeholder="Digite o verso e pressione Enter (3x para nova estrofe)"
                    className="border p-2 rounded flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const target = e.target as HTMLInputElement;
                        const value = target.value.trim();

                        // Verifica se o usuário pressionou Enter 3 vezes
                        if (value === "") {
                          const enterCount = (target.dataset.enterCount ||
                            0) as number;
                          if (enterCount >= 2) {
                            handleAddStrophe();
                            target.dataset.enterCount = "0";
                            return;
                          }
                          target.dataset.enterCount = (
                            enterCount + 1
                          ).toString();
                          return;
                        }

                        // Adiciona novo verso
                        const words = value
                          .split(" ")
                          .map((text) => ({ text: text.toUpperCase() }));
                        const newStrophes = [...strophes];
                        newStrophes[stropheIndex].verses.push({
                          id: Date.now().toString(),
                          words,
                          tag: "A",
                          cameraSettings: {
                            shotType: "eyeLevel",
                            movement: "pan",
                            resolution: "4k",
                            stabilization: "tripod",
                            location: "",
                            sceneLabel: "",
                          },
                        });
                        setStrophes(newStrophes);
                        target.value = "";
                        target.dataset.enterCount = "0";
                      }
                    }}
                  />

                  {/* Botão para adicionar nova estrofe */}
                  <Button
                    onClick={handleAddStrophe}
                    variant="outline"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nova Estrofe
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        Adicionar Letra Completa
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Inserir Letra Completa</DialogTitle>
                      </DialogHeader>
                      <textarea
                        value={fullLyrics}
                        onChange={(e) => setFullLyrics(e.target.value)}
                        className="w-full h-64 p-2 border rounded"
                        placeholder="Separe estrofes com linhas vazias"
                      />
                      <Button
                        onClick={() => {
                          const groups = fullLyrics.split("\n\n");
                          const ts = Date.now();
                          const newStrophes = groups.map((group, gIdx) => ({
                            id: `${ts}_${gIdx}`,
                            architecture: "Prólogo",
                            description: "Estrofe importada via 'Adicionar Letra Completa'",
                            verses: group
                              .split("\n")
                              .filter((l) => l.trim())
                              .map((line, vIdx) => ({
                                id: `${ts}_${gIdx}_${vIdx}`,
                                words: line
                                  .split(" ")
                                  .map((text) => ({ text: text.toUpperCase() })),
                                tag: ["A", "B", "C", "D"][
                                  Math.floor(Math.random() * 4)
                                ],
                                cameraSettings: {
                                  shotType: "eyeLevel",
                                  movement: "pan",
                                  resolution: "4k",
                                  stabilization: "tripod",
                                  location: "",
                                  sceneLabel: "",
                                },
                              })),
                          }));
                          setStrophes([...strophes, ...newStrophes]);
                          setFullLyrics("");
                        }}
                      >
                        Aplicar
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
                <div ref={stropheEndRef} />
              </Card>
            ))}
          </div>
        )}

        {activeTab === "cinematografia" && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <h3 className="text-xl font-bold">
                  Configurações Gerais do Projeto
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Rácio de Aspeto</Label>
                    <select className="w-full p-2 border rounded">
                      <option value="16:9">16:9 (Widescreen)</option>
                      <option value="1.85:1">1.85:1</option>
                      <option value="2.39:1">2.39:1</option>
                      <option value="4:3">4:3 (Fullscreen)</option>
                    </select>
                  </div>
                  <div>
                    <Label>Espaço de Cor e LUTs</Label>
                    <select className="w-full p-2 border rounded">
                      <option value="rec709">Rec.709</option>
                      <option value="logc">Log-C</option>
                      <option value="raw">RAW</option>
                    </select>
                  </div>
                 
                  <div>
                    <Label>Frame Rate Base</Label>
                    <select className="w-full p-2 border rounded">
                      <option value="24">24 fps</option>
                      <option value="25">25 fps</option>
                      <option value="60">60 fps</option>
                      <option value="120">120 fps</option>
                    </select>
                  </div>

                  <div>
                    <Label>Qualidade e Resolução</Label>
                    <select className="w-full p-2 border rounded">
                      <option value="4k">4K (3840x2160)</option>
                      <option value="2k">2K (2048x1080)</option>
                      <option value="1080p">Full HD (1920x1080)</option>
                      <option value="720p">HD (1280x720)</option>
                    </select>
                  </div>

                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {strophes
                .flatMap((strophe) => strophe.verses)
                .map((verse, index) => (
                  <Card
                    key={verse.id}
                    className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900"
                  >
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label>Mídia de Referência</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-48 flex items-center justify-center">
                          {verse.media ? (
                            verse.media instanceof File ? (
                              verse.media.type.startsWith("video") ? (
                                <video controls className="max-h-44">
                                  <source
                                    src={URL.createObjectURL(verse.media)}
                                  />
                                </video>
                              ) : (
                                <Image
                                  src={URL.createObjectURL(verse.media)}
                                  alt="Mídia de referência"
                                  width={300}
                                  height={176}
                                  className="max-h-44"
                                  unoptimized
                                />
                              )
                            ) : null
                          ) : (
                            <span className="text-gray-500">
                              Arraste arquivo aqui
                            </span>
                          )}
                          <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                const newStrophes = [...strophes];
                                const verseIndex = newStrophes
                                  .flatMap((s) => s.verses)
                                  .findIndex((v) => v.id === verse.id);
                                newStrophes.flatMap((s) => s.verses)[
                                  verseIndex
                                ].media = e.target.files![0];
                                setStrophes(newStrophes);
                              }
                            }}
                            className="hidden"
                            id={`media-${verse.id}`}
                          />
                          <label
                            htmlFor={`media-${verse.id}`}
                            className="cursor-pointer p-2 hover:bg-gray-100 rounded"
                          >
                            <Video size={24} />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label>Configurações Profissionais</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Tipo de Plano</Label>
                              <select
                                value={verse.cameraSettings?.shotType}
                                onChange={(e) => {
                                  const newStrophes = [...strophes];
                                  const verseIndex = newStrophes
                                    .flatMap((s) => s.verses)
                                    .findIndex((v) => v.id === verse.id);
                                  newStrophes.flatMap((s) => s.verses)[
                                    verseIndex
                                  ].cameraSettings!.shotType = e.target.value;
                                  setStrophes(newStrophes);
                                }}
                                className="w-full p-2 border rounded"
                              >
                                <option value="plano_aberto">
                                  Plano aberto (full body) para ambientação
                                </option>
                                <option value="plano_medio">
                                  Plano médio (torso/quadril) para ação e
                                  movimentação
                                </option>
                                <option value="close_up">
                                  Close-up (rosto/detalhe) para expressão e
                                  emoção
                                </option>
                              </select>
                            </div>

                            <div>
                              <Label>Movimento de Câmera</Label>
                              <select
                                value={verse.cameraSettings?.cameraMovement}
                                onChange={(e) => {
                                  const newStrophes = [...strophes];
                                  const verseIndex = newStrophes
                                    .flatMap((s) => s.verses)
                                    .findIndex((v) => v.id === verse.id);
                                  newStrophes.flatMap((s) => s.verses)[
                                    verseIndex
                                  ].cameraSettings!.cameraMovement =
                                    e.target.value;
                                  setStrophes(newStrophes);
                                }}
                                className="w-full p-2 border rounded"
                              >
                                <option value="pan_tilt">
                                  Pan/tilt para revelar detalhes
                                </option>
                                <option value="travelling">
                                  Travelling/dolly para seguir personagens
                                </option>
                                <option value="steadicam">
                                  Steadicam/gimbal para movimentos fluidos
                                </option>
                                <option value="zoom">
                                  Zoom suave ou dolly-zoom para efeito dramático
                                </option>
                              </select>
                            </div>

                            <div>
                              <Label>Cobertura e Ambiente</Label>
                              <Input
                                placeholder="Exterior (EXT) vs Interior (INT)"
                                value={verse.cameraSettings?.coverage || ""}
                                onChange={(e) => {
                                  const newStrophes = [...strophes];
                                  const verseIndex = newStrophes
                                    .flatMap((s) => s.verses)
                                    .findIndex((v) => v.id === verse.id);
                                  newStrophes.flatMap((s) => s.verses)[
                                    verseIndex
                                  ].cameraSettings!.coverage = e.target.value;
                                  setStrophes(newStrophes);
                                }}
                                className="w-full"
                              />
                            </div>

                            <div>
                              <Label>Elenco e Personagens</Label>
                              <Input
                                placeholder="Número e papel de cada personagem"
                                value={verse.cameraSettings?.cast || ""}
                                onChange={(e) => {
                                  const newStrophes = [...strophes];
                                  const verseIndex = newStrophes
                                    .flatMap((s) => s.verses)
                                    .findIndex((v) => v.id === verse.id);
                                  newStrophes.flatMap((s) => s.verses)[
                                    verseIndex
                                  ].cameraSettings!.cast = e.target.value;
                                  setStrophes(newStrophes);
                                }}
                                className="w-full"
                              />
                            </div>

                            <div>
                              <Label>Adereços e Figurinos</Label>
                              <Input
                                placeholder="Lista de props e figurinos"
                                value={
                                  verse.cameraSettings?.propsCostumes || ""
                                }
                                onChange={(e) => {
                                  const newStrophes = [...strophes];
                                  const verseIndex = newStrophes
                                    .flatMap((s) => s.verses)
                                    .findIndex((v) => v.id === verse.id);
                                  newStrophes.flatMap((s) => s.verses)[
                                    verseIndex
                                  ].cameraSettings!.propsCostumes =
                                    e.target.value;
                                  setStrophes(newStrophes);
                                }}
                                className="w-full"
                              />
                            </div>

                            <div>
                              <Label>Ritmo e Estilo</Label>
                              <select
                                value={verse.cameraSettings?.rhythmStyle}
                                onChange={(e) => {
                                  const newStrophes = [...strophes];
                                  const verseIndex = newStrophes
                                    .flatMap((s) => s.verses)
                                    .findIndex((v) => v.id === verse.id);
                                  newStrophes.flatMap((s) => s.verses)[
                                    verseIndex
                                  ].cameraSettings!.rhythmStyle =
                                    e.target.value;
                                  setStrophes(newStrophes);
                                }}
                                className="w-full p-2 border rounded"
                              >
                                <option value="slow_motion">
                                  Slow motion (60-120 fps)
                                </option>
                                <option value="speed_ramp">
                                  Speed ramp (variação de velocidade)
                                </option>
                                <option value="visual_poetry">
                                  Poesia visual (composições simétricas)
                                </option>
                                <option value="force_demo">
                                  Demonstração de força (planos sequência)
                                </option>
                              </select>
                            </div>

                            <div>
                              <Label>Tipo de Cena</Label>
                              <select
                                value={verse.cameraSettings?.sceneType}
                                onChange={(e) => {
                                  const newStrophes = [...strophes];
                                  const verseIndex = newStrophes
                                    .flatMap((s) => s.verses)
                                    .findIndex((v) => v.id === verse.id);
                                  newStrophes.flatMap((s) => s.verses)[
                                    verseIndex
                                  ].cameraSettings!.sceneType = e.target.value;
                                  setStrophes(newStrophes);
                                }}
                                className="w-full p-2 border rounded"
                              >
                                <option value="dialogo">
                                  Diálogo (master, over-the-shoulder)
                                </option>
                                <option value="luta">
                                  Luta/ação (planos dinâmicos)
                                </option>
                                <option value="demonstracao">
                                  Demonstração (close-ups e ângulos dramáticos)
                                </option>
                              </select>
                            </div>

                            <div>
                              <Label>ISO</Label>
                              <Input
                                type="number"
                                placeholder="Ex: 100"
                                value={verse.cameraSettings?.iso || ""}
                                onChange={(e) => {
                                  const newStrophes = [...strophes];
                                  const verseIndex = newStrophes
                                    .flatMap((s) => s.verses)
                                    .findIndex((v) => v.id === verse.id);
                                  newStrophes.flatMap((s) => s.verses)[
                                    verseIndex
                                  ].cameraSettings!.iso = e.target.value;
                                  setStrophes(newStrophes);
                                }}
                                className="w-full"
                              />
                            </div>

                            <div>
                              <Label>Velocidade do Obturador</Label>
                              <Input
                                placeholder="Ex: 1/60"
                                value={verse.cameraSettings?.shutterSpeed || ""}
                                onChange={(e) => {
                                  const newStrophes = [...strophes];
                                  const verseIndex = newStrophes
                                    .flatMap((s) => s.verses)
                                    .findIndex((v) => v.id === verse.id);
                                  newStrophes.flatMap((s) => s.verses)[
                                    verseIndex
                                  ].cameraSettings!.shutterSpeed =
                                    e.target.value;
                                  setStrophes(newStrophes);
                                }}
                                className="w-full"
                              />
                            </div>

                            <div>
                              <Label>Filtros ND</Label>
                              <select
                                value={verse.cameraSettings?.ndFilter || ""}
                                onChange={(e) => {
                                  const newStrophes = [...strophes];
                                  const verseIndex = newStrophes
                                    .flatMap((s) => s.verses)
                                    .findIndex((v) => v.id === verse.id);
                                  newStrophes.flatMap((s) => s.verses)[
                                    verseIndex
                                  ].cameraSettings!.ndFilter = e.target.value;
                                  setStrophes(newStrophes);
                                }}
                                className="w-full p-2 border rounded"
                              >
                                <option value="0.3">0.3 (1 stop)</option>
                                <option value="0.6">0.6 (2 stops)</option>
                                <option value="0.9">0.9 (3 stops)</option>
                                <option value="1.2">1.2 (4 stops)</option>
                              </select>
                            </div>

                            <div>
                              <Label>INT/EXT</Label>
                              <select
                                value={verse.cameraSettings?.intExt || ""}
                                onChange={(e) => {
                                  const newStrophes = [...strophes];
                                  const verseIndex = newStrophes
                                    .flatMap((s) => s.verses)
                                    .findIndex((v) => v.id === verse.id);
                                  newStrophes.flatMap((s) => s.verses)[
                                    verseIndex
                                  ].cameraSettings!.intExt = e.target.value;
                                  setStrophes(newStrophes);
                                }}
                                className="w-full p-2 border rounded"
                              >
                                <option value="interior">Interior</option>
                                <option value="exterior">Exterior</option>
                              </select>
                            </div>

                            <div>
                              <Label>Personagens</Label>
                              <Input
                                placeholder="Número, gênero, idades"
                                value={verse.cameraSettings?.characters || ""}
                                onChange={(e) => {
                                  const newStrophes = [...strophes];
                                  const verseIndex = newStrophes
                                    .flatMap((s) => s.verses)
                                    .findIndex((v) => v.id === verse.id);
                                  newStrophes.flatMap((s) => s.verses)[
                                    verseIndex
                                  ].cameraSettings!.characters = e.target.value;
                                  setStrophes(newStrophes);
                                }}
                                className="w-full"
                              />
                            </div>

                            <div>
                              <Label>Props</Label>
                              <Input
                                placeholder="Lista de adereços"
                                value={verse.cameraSettings?.props || ""}
                                onChange={(e) => {
                                  const newStrophes = [...strophes];
                                  const verseIndex = newStrophes
                                    .flatMap((s) => s.verses)
                                    .findIndex((v) => v.id === verse.id);
                                  newStrophes.flatMap((s) => s.verses)[
                                    verseIndex
                                  ].cameraSettings!.props = e.target.value;
                                  setStrophes(newStrophes);
                                }}
                                className="w-full"
                              />
                            </div>

                            <div>
                              <Label>Estilo e Ritmo</Label>
                              <select
                                value={verse.cameraSettings?.style || ""}
                                onChange={(e) => {
                                  const newStrophes = [...strophes];
                                  const verseIndex = newStrophes
                                    .flatMap((s) => s.verses)
                                    .findIndex((v) => v.id === verse.id);
                                  newStrophes.flatMap((s) => s.verses)[
                                    verseIndex
                                  ].cameraSettings!.style = e.target.value;
                                  setStrophes(newStrophes);
                                }}
                                className="w-full p-2 border rounded"
                              >
                                <option value="slow motion">Slow Motion</option>
                                <option value="speed run">Speed Run</option>
                                <option value="visual poetry">
                                  Visual Poetry
                                </option>
                                <option value="demonstracao">
                                  Demonstração de Força Humana
                                </option>
                              </select>
                            </div>

                            <div>
                              <Label>Objetivo em 3 Palavras</Label>
                              <Input
                                placeholder="Ex: Amor, Paixão, Dor"
                                value={verse.cameraSettings?.objective || ""}
                                onChange={(e) => {
                                  const newStrophes = [...strophes];
                                  const verseIndex = newStrophes
                                    .flatMap((s) => s.verses)
                                    .findIndex((v) => v.id === verse.id);
                                  newStrophes.flatMap((s) => s.verses)[
                                    verseIndex
                                  ].cameraSettings!.objective = e.target.value;
                                  setStrophes(newStrophes);
                                }}
                                className="w-full"
                              />
                            </div>

                            <div>
                              <Label>Tags de Destaque</Label>
                              <Input
                                placeholder="Ex: #HighContrast #SlowMotion"
                                value={verse.cameraSettings?.tags || ""}
                                onChange={(e) => {
                                  const newStrophes = [...strophes];
                                  const verseIndex = newStrophes
                                    .flatMap((s) => s.verses)
                                    .findIndex((v) => v.id === verse.id);
                                  newStrophes.flatMap((s) => s.verses)[
                                    verseIndex
                                  ].cameraSettings!.tags = e.target.value;
                                  setStrophes(newStrophes);
                                }}
                                className="w-full"
                              />
                            </div>

                            <div>
                              <Label>Efeitos Especiais</Label>
                              <select
                                value={
                                  verse.cameraSettings?.specialEffects || ""
                                }
                                onChange={(e) => {
                                  const newStrophes = [...strophes];
                                  const verseIndex = newStrophes
                                    .flatMap((s) => s.verses)
                                    .findIndex((v) => v.id === verse.id);
                                  newStrophes.flatMap((s) => s.verses)[
                                    verseIndex
                                  ].cameraSettings!.specialEffects =
                                    e.target.value;
                                  setStrophes(newStrophes);
                                }}
                                className="w-full p-2 border rounded"
                              >
                                <option value="levitacao">Levitação</option>
                                <option value="duplicacao">
                                  Duplicação de Personagens
                                </option>
                                <option value="reverse">Reverse Motion</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label>Localização</Label>
                          <Input
                            value={verse.cameraSettings?.location}
                            onChange={(e) => {
                              const newStrophes = [...strophes];
                              const verseIndex = newStrophes
                                .flatMap((s) => s.verses)
                                .findIndex((v) => v.id === verse.id);
                              newStrophes.flatMap((s) => s.verses)[
                                verseIndex
                              ].cameraSettings!.location = e.target.value;
                              setStrophes(newStrophes);
                            }}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <Label>Versos Relacionados</Label>
                          <div className="flex flex-wrap gap-2">
                            {strophes
                              .flatMap((strophe) => strophe.verses)
                              .map((_, vIndex) => (
                                <Button
                                  key={vIndex}
                                  variant={
                                    verse.cameraSettings?.relatedVerses?.includes(
                                      vIndex + 1,
                                    )
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() => {
                                    const newStrophes = [...strophes];
                                    const verseIndex = newStrophes
                                      .flatMap((s) => s.verses)
                                      .findIndex((v) => v.id === verse.id);

                                    const relatedVerses =
                                      newStrophes.flatMap((s) => s.verses)[
                                        verseIndex
                                      ].cameraSettings?.relatedVerses || [];

                                    newStrophes.flatMap((s) => s.verses)[
                                      verseIndex
                                    ].cameraSettings!.relatedVerses =
                                      relatedVerses.includes(vIndex + 1)
                                        ? relatedVerses.filter(
                                            (v) => v !== vIndex + 1,
                                          )
                                        : [...relatedVerses, vIndex + 1];

                                    setStrophes(newStrophes);
                                  }}
                                  size="sm"
                                  className="text-xs px-2 py-1"
                                >
                                  {vIndex + 1}
                                </Button>
                              ))}
                          </div>
                        </div>

                        <div>
                          <Label>
                             da Cena</Label>
                          <Input
                            placeholder="Descreva brevemente a cena"
                            value={verse.cameraSettings?.sceneLabel || ""}
                            onChange={(e) => {
                              const newStrophes = [...strophes];
                              const verseIndex = newStrophes
                                .flatMap((s) => s.verses)
                                .findIndex((v) => v.id === verse.id);
                              newStrophes.flatMap((s) => s.verses)[
                                verseIndex
                              ].cameraSettings!.sceneLabel = e.target.value;
                              setStrophes(newStrophes);
                            }}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                      <p className="text-sm font-semibold">
                        Verso {index + 1}:
                      </p>
                      <p className="uppercase">
                        {verse.words.map((word) => word.text).join(" ")}
                        {verse.adlib && (
                          <span className="text-gray-500">
                            {" "}
                            ({verse.adlib})
                          </span>
                        )}
                      </p>
                    </div>
                  </Card>
                ))}
            </div>
          </>
        )}

        <Card className="sticky bottom-0 mt-6">
          <CardContent className="p-4 flex justify-between">
            <div className="flex gap-4">
              <Button
                onClick={handleAnalyzeMeter}
                variant="secondary"
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Analisar Métrica
              </Button>

              {showAnalysis && (
                <Button
                  onClick={() => {
                    setShowAnalysis(false);
                    setAnalysisResult(null);
                  }}
                  variant="destructive"
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Ocultar Métrica
                </Button>
              )}

              <PreviewModal
                verses={strophes
                  .flatMap((strophe) => strophe.verses)
                  .map((verse) =>
                    verse.words.map(
                      (word) =>
                        ({ text: word.text, color: word.customColor }) as Word,
                    ),
                  )}
              />

              <Button
                onClick={exportToPDF}
                variant="secondary"
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Exportar PDF
              </Button>

              <Button
                variant="secondary"
                className="gap-2"
                onClick={() =>
                  (window.location.href =
                    "http://localhost:3000/cinematografia")
                }
              >
                <Video className="h-4 w-4" />
                Planear Cinematografia
              </Button>

              {activeTab === "cinematografia" && (
                <Button
                  onClick={() => exportStoryboard(strophes, songInfo)}
                  variant="outline"
                >
                  <Video className="mr-2" /> Exportar Storyboard
                </Button>
              )}

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
                    Pré-visualização Completa
                  </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="space-y-6">
                    {strophes.map((strophe, index) => (
                      <div key={index} className="border-b pb-6 last:border-b-0">
                        <h3 className="text-xl font-bold mb-4 text-center">
                          Estrofe {index + 1} ({strophe.architecture})
                        </h3>
                        {strophe.verses.map((verse, vIndex) => (
                          <div key={vIndex} className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="font-bold uppercase text-lg leading-relaxed break-words">
                              {verse.words.map((word, wordIndex) => (
                                <span
                                  key={wordIndex}
                                  style={{ color: word.customColor }}
                                  className={word.stressed ? "font-black" : ""}
                                >
                                  {word.text}{" "}
                                </span>
                              ))}
                              {verse.adlib && (
                                <span className="text-gray-500 italic">
                                  ({verse.adlib})
                                </span>
                              )}
                            </p>
                            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              <p>
                                <span className="font-semibold">Voz:</span>{" "}
                                {
                                  voiceOptions.find(
                                    (v) => v.value === verse.voiceType,
                                  )?.label || "Não definida"
                                }
                              </p>
                              <p>
                                <span className="font-semibold">Figura:</span> {verse.figura || "Nenhuma"}
                              </p>
                              {verse.tag && (
                                <p>
                                  <span className="font-semibold">Tag:</span> {verse.tag}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {showAnalysis && analysisResult && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Análise Métrica</h3>
                {analysisResult.original_lines.map(
                  (line: string, idx: number) => (
                    <div key={idx} className="p-3 border rounded">
                      <p className="text-sm font-semibold">
                        Linha {idx + 1}: {line}
                        <span className="ml-2 text-gray-600">
                          (Total de sílabas:{" "}
                          {analysisResult.word_details[idx].total_syllables})
                        </span>
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {analysisResult.word_details[idx].details.map(
                          (
                            detail: {
                              word: string;
                              syllable_breakdown: string;
                              scansion: string;
                              syllable_count: number;
                            },
                            wIdx: number,
                          ) => (
                            <div
                              key={wIdx}
                              className="text-xs p-2 border rounded bg-gray-50"
                            >
                              <div className="font-medium">{detail.word}</div>
                              <div className="font-mono text-gray-600">
                                {detail.syllable_breakdown
                                  .split("-")
                                  .map((syllable, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className={
                                        detail.scansion[sIdx] === "1"
                                          ? "font-extrabold"
                                          : "font-normal"
                                      }
                                    >
                                      {syllable}
                                      {sIdx <
                                      detail.syllable_breakdown.split("-")
                                        .length -
                                        1
                                        ? "-"
                                        : ""}
                                    </span>
                                  ))}{" "}
                                ({detail.scansion})
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ContentLayout>
  );
};

export default Dashboard;
