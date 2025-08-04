"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import ControlRoomSidebar from "@/components/control-room-sider";
import Metronome from "@/components/admin-panel/estrofes/metronome";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

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
  Image,
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

import NarratologiaTab from "@/components/narratologia-tab";

import AccountStep from "@/steps/account";
import ContratualizacaoStep from "@/steps/contratualizacao";
import CustosFixosStep from "@/steps/custosfixos";
import DireitosAutoraisStep from "@/steps/direitosautorais";
import FilmagemStep from "@/steps/filmagem";
import FotografiaStep from "@/steps/fotografia";
import GravacaoStep from "@/steps/gravacao";
import LancamentoStep from "@/steps/lancamento";
import MaqueteStep from "@/steps/maquete";
import MonetizacaoStep from "@/steps/monetizacao";
import NarratologiaStep from "@/steps/narratologia";
import OrcamentoStep from "@/steps/orcamento";
import VestuarioStep from "@/steps/vestuario";


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

interface LiteraryFigure {
  name: string;
  description: string;
  examples: string[];
}

const literaryFigures: LiteraryFigure[] = [
  {
    name: "Metáfora",
    description: "Comparação implícita entre duas coisas.",
    examples: ["A vida é um sonho.", "O sol sorriu para nós."],
  },
  {
    name: "Símile",
    description: "Comparação explícita usando 'como'.",
    examples: ["Ele é forte como um touro.", "E chora, e grita, e corre, e cai."],
  },
  {
    name: "Hipérbole",
    description: "Exagero para enfatizar uma ideia.",
    examples: ["Estou morrendo de fome.", "Menos é mais."],
  },
  {
    name: "Ironia",
    description: "Dizer o oposto do que se quer expressar.",
    examples: ["Que dia lindo! (num dia chuvoso)", "Ah, que bela é a tua hipocrisia vestida de ouro."],
  },
  {
    name: "Aliteração",
    description: "Repetição de sons consonantais.",
    examples: ["O rato roeu a roupa do rei de Roma.", "Chove sobre a cidade, chove sobre os campos."],
  },
  {
    name: "Prosopopeia",
    description: "Atribuir características humanas a seres inanimados.",
    examples: ["O sol sorriu para nós.", "O rei do pop (Michael Jackson)."],
  },
  {
    name: "Onomatopeia",
    description: "Palavras que imitam sons.",
    examples: ["O relógio faz tic-tac.", "PSSSSH!", "WHOOSH!", "FUMO!", "VAPOR!", "NÉVOA!"],
  },
  {
    name: "Eufemismo",
    description: "Suavização de uma expressão.",
    examples: ["Ele partiu para um lugar melhor.", "E chora, e grita, e corre, e cai."],
  },
  {
    name: "Antítese",
    description: "Contraposição de ideias.",
    examples: ["É um mar de rosas, mas também um deserto de espinhos.", "Menos é mais."],
  },
  {
    name: "Paradoxo",
    description: "Ideias opostas que geram reflexão.",
    examples: ["Menos é mais.", "É um mar de rosas, mas também um deserto de espinhos."],
  },
  {
    name: "Quiasmo",
    description: "Inversão na ordem das palavras ou ideias em frases paralelas.",
    examples: ["Devo viver para comer ou comer para viver?", "Menos é mais."],
  },
  {
    name: "Anáfora",
    description: "Repetição de uma palavra ou expressão no início de frases ou versos.",
    examples: ["Chove sobre a cidade, chove sobre os campos.", "Menos é mais."],
  },
  {
    name: "Assíndeto",
    description: "Omissão de conjunções.",
    examples: ["Vim, vi, venci.", "Menos é mais."],
  },
  {
    name: "Polissíndeto",
    description: "Uso excessivo de conjunções.",
    examples: ["E chora, e grita, e corre, e cai.", "Menos é mais."],
  },
  {
    name: "Metonímia",
    description: "Substituição por proximidade de sentido.",
    examples: ["Bebi um copo.", "Menos é mais."],
  },
  {
    name: "Sinestesia",
    description: "Mistura de sensações de sentidos diferentes.",
    examples: ["Ouvi um cheiro doce.", "Menos é mais."],
  },
  {
    name: "Gradação",
    description: "Sequência crescente ou decrescente de ideias.",
    examples: ["Chorei, lamentei, desesperei.", "Menos é mais."],
  },
  {
    name: "Pleonasmo",
    description: "Uso de palavras redundantes para reforçar a ideia.",
    examples: ["Subir para cima.", "Menos é mais."],
  },
  {
    name: "Elipse",
    description: "Omissão de um termo facilmente subentendido.",
    examples: ["Na sala, apenas dois alunos.", "Menos é mais."],
  },
  {
    name: "Zeugma",
    description: "Omissão de um termo já mencionado anteriormente.",
    examples: ["Eu gosto de café; ela, de chá.", "Menos é mais."],
  },
  {
    name: "Catacrese",
    description: "Metáfora desgastada ou comum no uso cotidiano.",
    examples: ["Pé da mesa.", "Menos é mais."],
  },
  {
    name: "Antonomásia",
    description: "Uso de uma característica ou título no lugar do nome.",
    examples: ["O Rei do Pop (Michael Jackson).", "Menos é mais."],
  },
  {
    name: "Apóstrofe",
    description: "Chamamento enfático a uma pessoa ou coisa.",
    examples: ["Ó deuses, escutem meu clamor!", "Menos é mais."],
  },
  {
    name: "Paranomásia",
    description: "Uso de palavras com sons parecidos, mas significados diferentes.",
    examples: ["Conhecer para crescer.", "Menos é mais."],
  },
  {
    name: "Hipérbato",
    description: "Inversão da ordem lógica das palavras na frase.",
    examples: ["De tudo, ao meu amor serei atento.", "Menos é mais."],
  },
  {
    name: "Perífrase",
    description: "Uso de várias palavras para se referir a algo ou alguém.",
    examples: ["A cidade maravilhosa (Rio de Janeiro).", "Menos é mais."],
  },
];

const verseFunctions = [
  {
    name: "Afirmação",
    description: "Declara algo como verdadeiro. Ex: 'Eu sou o fogo que queima sem cessar.'",
  },
  {
    name: "Ato",
    description: "Expressa ação, movimento ou mudança. Ex: 'Levanto-me contra o silêncio.'",
  },
  {
    name: "Desejo",
    description: "Revela vontade ou intenção. Ex: 'Quero rasgar o céu com gritos de guerra.'",
  },
  {
    name: "Negação",
    description: "Recusa, rejeição, oposição. Ex: 'Não sou a sombra que vocês pensam.'",
  },
  {
    name: "Pergunta",
    description: "Interrogativa, direta ou retórica. Ex: 'Quem sou eu diante do abismo?'",
  },
  {
    name: "Profecia",
    description: "Anuncia o que virá, com peso visionário. Ex: 'O dia da queda virá ao som dos tambores.'",
  },
  {
    name: "Declaração de guerra",
    description: "Confronto direto, aviso. Ex: 'Rompo pactos, ergo muralhas.'",
  },
  {
    name: "Confissão",
    description: "Exposição íntima ou revelação. Ex: 'Carrego pecados em cada palavra.'",
  },
  {
    name: "Evocação",
    description: "Chama ou invoca algo/alguém. Ex: 'Venham, espíritos da noite eterna.'",
  },
  {
    name: "Desabafo",
    description: "Descarga emocional ou mental. Ex: 'Estou farto das máscaras e jogos.'",
  },
  {
    name: "Crítica / Ataque",
    description: "Julgamento ou acusação. Ex: 'Vocês se arrastam na lama e chamam isso de trono.'",
  },
  {
    name: "Manifesto / Declaração ideológica",
    description: "Posição política, social ou espiritual. Ex: 'A ordem será destruída pela verdade nua.'",
  },
  {
    name: "Autodefinição",
    description: "Construção da própria identidade. Ex: 'Sou lâmina, sou código, sou negação do caos.'",
  },
  {
    name: "Chamado / Convocação",
    description: "Incitação, liderança. Ex: 'Ergam-se os que ainda têm alma.'",
  },
  {
    name: "Maldição / Benção",
    description: "Desejo de ruína ou proteção. Ex: 'Que tua mentira te devore por dentro.'",
  },
  {
    name: "Juramento / Promessa",
    description: "Compromisso selado. Ex: 'Juro nunca mais me calar.'",
  },
  {
    name: "Despedida / Corte",
    description: "Fim de algo, separação. Ex: 'Este é o último eco do que fomos.'",
  },
  {
    name: "Instrução / Ordem",
    description: "Comando ou direção. Ex: 'Fechem os olhos. Escutem o sangue.'",
  },
  {
    name: "Ironia / Sarcasmo",
    description: "Duplo sentido, crítica disfarçada. Ex: 'Ah, que bela é a tua hipocrisia vestida de ouro.'",
  },
  {
    name: "Provocação / Desafio",
    description: "Convite ao confronto. Ex: 'Se és rei, então lute por tua coroa.'",
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
    description: "Introdução poética que prepara o leitor para o que está por vir",
    instruction: "Use esta estrofe para criar uma atmosfera e sugerir os temas que serão desenvolvidos, como uma abertura musical que antecipa a sinfonia.",
  },
  {
    value: "Prólogo",
    description: "Introdução que apresenta o contexto inicial da obra",
    instruction: "Nesta estrofe, estabeleça o cenário e apresente os personagens principais.",
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
        description: "O herói é introduzido e ganha destaque, mostrando suas qualidades e ambições iniciais.",
        instruction: "Apresente o protagonista e estabeleça seus objetivos iniciais.",
      },
      {
        value: "Erro trágico (hamartia)",
        description: "O herói comete um erro crucial, muitas vezes por orgulho ou ignorância, que inicia a reviravolta.",
        instruction: "Mostre o momento crucial onde o herói comete um erro que altera o curso da história.",
      },
      {
        value: "Virada de fortuna (peripeteia)",
        description: "Ocorre uma mudança drástica na sorte do herói, geralmente de boa para má, intensificando o conflito.",
        instruction: "Descreva a reviravolta que muda completamente a situação do herói.",
      },
      {
        value: "Queda (catástrofe)",
        description: "O herói enfrenta as consequências de seus erros, levando a sofrimento e, frequentemente, à morte.",
        instruction: "Mostre as consequências dramáticas dos erros do herói.",
      },
      {
        value: "Reconhecimento (anagnórise)",
        description: "O herói ou outros personagens ganham um entendimento crítico da situação, reconhecendo verdades antes ocultas.",
        instruction: "Descreva o momento de revelação e compreensão da verdade.",
      },
    ],
  },
  {
    value: "Êxodo",
    description: "Conclusão da história",
    instruction: "Resolva os conflitos e encerre a narrativa de forma satisfatória.",
  },
  {
    value: "Epílogo",
    description: "Texto final que complementa ou encerra a obra",
    instruction: "Forneça uma reflexão final ou mostre as consequências da história.",
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
        description: "Pensamentos ou sentimentos do personagem expressos em sua mente.",
      },
      {
        name: "Stream of consciousness",
        description: "Corrente contínua de pensamento não filtrado.",
      },
      {
        name: "Narrador omnisciente",
        description: "Conhecimento de todos os pensamentos e ações dos personagens.",
      },
      {
        name: "Narrador limitado",
        description: "Conhecimento apenas do que o personagem principal sabe.",
      },
      {
        name: "Narrador em terceira pessoa",
        description: "Narrativa em terceira pessoa, distanciando o leitor dos personagens.",
      },
      {
        name: "Narrador em primeira pessoa",
        description: "Narrativa em primeira pessoa, envolvendo o leitor nos pensamentos do personagem.",
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
        description: "Ausência de um narrador explícito, deixando o leitor interpretar a história.",
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
    description: "Quando o artista comenta a própria letra ou processo criativo.",
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
        description: "A persona é uma voz fictícia, não corresponde ao 'eu' real do autor.",
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
        description: "Embora comum na poesia, também aparece em romances, contos e outros géneros.",
      },
      {
        name: "Simples ou complexa",
        description: "Pode ser uma caracterização direta ou uma construção profunda e multifacetada.",
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
        description: "Apresenta os personagens principais e o contexto da história.",
      },
      {
        name: "Conflito central",
        description: "Estabelece o problema ou desafio que impulsiona a narrativa.",
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
          className={`px-1 uppercase font-bold text-sm ${(word as any).stressed ? "font-black" : ""}`}
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
  const bgColorMapping = {
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
        <button onClick={onRemove} className="text-red-500">
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
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-10">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sugestões de Adlibs</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              {adlibCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-bold">{category.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {category.adlibs.map((adlib, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => onVerseChange({ ...verse, adlib })}
                      >
                        {adlib}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Input
              placeholder="Adicionar novo adlib"
              className="mt-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const target = e.target as HTMLInputElement;
                  if (target.value.trim()) {
                    adlibCategories[3].adlibs.push(target.value.toUpperCase());
                    target.value = "";
                  }
                }
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Componentes de seleção sempre visíveis */}
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <select
            value={verse.voiceType}
            onChange={(e) =>
              onVerseChange({ ...verse, voiceType: e.target.value })
            }
            className="p-2 border rounded text-sm flex-1 min-w-[120px]"
            style={{ width: `${verse.voiceType?.length * 8 + 100}px` }}
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
            style={{ width: `${verse.figura?.length * 8 + 100}px` }}
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
            style={{ width: `${verse.function?.length * 8 + 100}px` }}
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
            style={{ width: `${verse.technique?.length * 8 + 100}px` }}
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
            style={{ width: `${verse.metaTool?.length * 8 + 100}px` }}
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
            style={{ width: `${verse.persona?.length * 8 + 100}px` }}
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
            style={{ width: `${verse.threeAct?.length * 8 + 100}px` }}
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
    const response = await fetch("http://localhost:5000/analyze", {
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
  
  for (const [index, verse] of versesFlat.entries()) {
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
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === "audio/wav" || file.type === "audio/mpeg")) {
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
    }
  };

  return (
    <header className="sticky top-0 z-10 h-[89px] w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="mx-4 sm:mx-8 flex items-center justify-between">
        <div id="borda-esquerda" className="border border-transparent h-[59px] w-[141px] rounded-lg">
          <div id="borda-titulo" className="border border-transparent h-[39px] w-[121px] rounded-lg ml-18 mt-2.5">
            <div className="items-center ml-8">
              <h1 className="font-extrabold font-arial text-3xl tracking-tighter -m-1 italic">
                PRETOS
                <h1 className="text-lg -mt-4 italic tracking-widest">MUSIC</h1>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-1 justify-center">
          <div className="border h-[89px] w-full max-w-[1556px] rounded-lg flex">
            <div className="flex-1 p-4">
              <div className="flex items-center justify-center gap-4">
                {/* Audio Upload Section */}
                <div className="w-[120px] p-2 flex flex-col items-center justify-center rounded-lg bg-background/50 backdrop-blur">
                  <div className="relative w-full">
                    <input
                      type="file"
                      accept=".wav,.mp3"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center">
                      Upload
                    </div>
                  </div>
                </div>

                {/* Audio Player Section */}
                <div className="flex-1 min-w-[400px] mx-2 rounded-lg p-2 mt-2 bg-background/50 backdrop-blur">
                  <div className="flex flex-col gap-1 w-full">
                    {/* File Name Display */}
                    {audioFile && (
                      <div className="text-sm font-medium text-center truncate">
                        {audioFile.name}
                      </div>
                    )}

                    <div className="flex items-center gap-1 w-full">
                      <audio ref={audioRef} src={audioUrl || ""} controls className="w-full h-8" />
                      <button onClick={() => audioRef.current?.play()} className="p-1 bg-green-500 text-white rounded-lg hover:bg-green-600">
                        ▶️
                      </button>
                      <button onClick={() => audioRef.current?.pause()} className="p-1 bg-red-500 text-white rounded-lg hover:bg-red-600">
                        ⏸️
                      </button>
                      <button
                        onClick={() => {
                          if (audioRef.current) {
                            audioRef.current.currentTime = 0;
                            audioRef.current.play();
                          }
                        }}
                        className="p-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                      >
                        ⏮️
                      </button>
                    </div>
                  </div>
                </div>

                {/* Metronome Section */}
                <div className="w-[120px] p-2 rounded-lg bg-background/50 backdrop-blur">
                  <Metronome />
                </div>
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
/* ------------------ Merged ContentLayout ------------------ */
interface ContentLayoutProps {
  title: string;
  children: React.ReactNode;
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
        <Tooltip className="-ml-6">
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

export function ContentLayout({ title, children }: ContentLayoutProps) {
  const sidebar = useSidebar();
  const { settings, setSettings } = sidebar;

  const depth = React.useContext(LayoutDepthContext);
  if (depth > 0) {
    return <>{children}</>;
  }

  const steps: Step[] = [
    { name: "Obra Eurúdita", link: "/obraeurudita", timeframe: "Mês 1", description: "Definir conceito, moodboard, roteiro e tratamento" },
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

  const stepComponents: Record<number, React.ComponentType<any>> = {
    0: () => null,
    1: GravacaoStep,
    2: VestuarioStep,
    3: OrcamentoStep,
    4: FilmagemStep,
    5: FotografiaStep,
    6: MaqueteStep,
    7: ContratualizacaoStep,
    8: DireitosAutoraisStep,
    9: LancamentoStep,
  };



  const [currentStep, setCurrentStep] = useState(0);

  const ActiveStep = stepComponents[currentStep] ?? (() => null);

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  return (
    <LayoutDepthContext.Provider value={depth + 1}>
      <TooltipProvider>
      <div className="w-full overflow-hidden transition-all duration-300">
        <Navbar title={title} />
        
        <AdminPanelLayout>
          <div className="w-full pt-8 pb-8 px-4 mx-auto max-w-[1800px]">
            <div className="p-4 items-center w-full">
              <div className="w-full">
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
                            <p>
                              Cada trimestre funciona como um sprint de 3 meses, passando por pré-produção, produção e pós-produção/liberação.
                            </p>
                            
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

                <Card className="mb-6 w-full">
                  <CardContent className="pt-6">
                    <div className="flex gap-6">
                      <Tabs defaultValue="controls" className="w-full">
                        <TabsList>
                          <TabsTrigger value="controls">Controles</TabsTrigger>
                          <TabsTrigger value="settings">Configurações</TabsTrigger>
                        </TabsList>

                        <div className="pt-4 flex gap-6">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="is-hover-open"
                                  checked={settings.isHoverOpen}
                                  onCheckedChange={(x) => setSettings({ isHoverOpen: x })}
                                />
                                <Label htmlFor="is-hover-open">Abertura Sutil</Label>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ativa a exibição suave da sidebar ao passar o mouse</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="disable-sidebar"
                                  checked={settings.disabled}
                                  onCheckedChange={(x) => setSettings({ disabled: x })}
                                />
                                <Label htmlFor="disable-sidebar">Desativar Sidebar</Label>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Esconde completamente a sidebar</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </Tabs>
                    </div>
                  </CardContent>
                </Card>
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
  return <div>/* TODO copy full Menu implementation here */</div>;
}

// Sidebar component
function Sidebar() {
  const [filter, setFilter] = useState("");
  const [results, setResults] = useState<{ syllable: string; count: number; words: string[] }[]>([]);
  const sidebarStore = useSidebar();
  if (!sidebarStore) return null;
  const { isOpen, toggleOpen, getOpenState, setIsHover, settings } = sidebarStore;
  const filterWords = (letter: string) => {
    const mock = [
      { syllable: "sa", count: 15, words: ["saber", "saco", "sagaz"] },
      { syllable: "se", count: 8, words: ["selva", "seda", "seguro"] },
      { syllable: "si", count: 5, words: ["sinal", "sino"] },
    ];
    setResults(mock);
  };

  return (
    <aside className={cn("fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300", !getOpenState() ? "w-[90px]" : "w-96", settings.disabled && "hidden")}>    
      <SidebarToggle isOpen={isOpen} setIsOpen={toggleOpen} />
      <div onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)} className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800">
        <input type="text" value={filter} onChange={(e) => { setFilter(e.target.value); filterWords(e.target.value); }} placeholder="Filtrar por letra..." className="w-full p-2 border rounded mb-4" />
        {results.map((r, i) => (
          <div key={i} className={cn("mb-2 p-2 border rounded transition-all duration-300", r.words.length > 0 ? "h-auto" : "h-10")}> <div className="font-bold">{r.syllable} ({r.count})</div>{r.words.length > 0 && (<div className="mt-2">{r.words.map((w, idx) => (<span key={idx} className="mr-2">{w}</span>))}</div>)} </div>
        ))}
        <Button className={cn("transition-transform ease-in-out duration-300 mb-1", !getOpenState() ? "translate-x-1" : "translate-x-0")} variant="link" asChild>
          <Link href="/obraeurudita" className="flex items-center gap-2"><PanelsTopLeft className="w-6 h-6 mr-1" /><h1 className={cn("font-bold text-lg whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300", !getOpenState() ? "-translate-x-96 opacity-0 hidden" : "translate-x-0 opacity-100")}>Rimas</h1></Link>
        </Button>
        <MenuComponent isOpen={getOpenState()} />
      </div>
    </aside>
  );
}

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
      setAnalysisResult(result);
      setShowAnalysis(true);
    } catch (error) {
      console.error("Erro ao analisar a métrica:", error);
      alert("Erro ao analisar a métrica");
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

  const debouncedLocalSave = debounce(async (state) => {
    await saveProjectLocally(state);
  }, 2000);

  const debouncedCloudSync = debounce(async (state) => {
    const user = auth.currentUser;
    if (user) await syncProjectToCloud(user.uid, state);
  }, 30000);

  useEffect(() => {
    debouncedLocalSave(state);
    debouncedCloudSync(state);

    return () => {
      debouncedLocalSave.cancel();
      debouncedCloudSync.cancel();
    };
  }, [state]);

  const handleSaveProject = async () => {
    try {
      const projectId = Date.now().toString(); // Ou use um ID específico
      const projectData = {
        strophes,
        songInfo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const success = await saveProjectToFirebase(projectId, projectData);

      if (success) {
        alert("Projeto salvo com sucesso!");
      } else {
        alert("Erro ao salvar projeto.");
      }
    } catch (error) {
      console.error("Erro ao salvar projeto:", error);
      alert("Erro ao salvar projeto.");
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
                <div className="flex flex-wrap gap-2">
                  {featuringOptions.map((artist) => (
                    <Button
                      key={artist}
                      variant={
                        songInfo.featuring.includes(artist)
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        setSongInfo((prev) => ({
                          ...prev,
                          featuring: prev.featuring.includes(artist)
                            ? prev.featuring.filter((a) => a !== artist)
                            : [...prev.featuring, artist],
                        }))
                      }
                      size="sm"
                    >
                      {artist}
                    </Button>
                  ))}
                </div>
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

        {/* New Story Types Configuration Card */}
        <Card className="w-[1732px] mb-6 shadow-md rounded-lg">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4">
              {/* Introduction Section */}
              <div className="flex flex-col">
                <h3 className="text-xl font-semibold mb-2">Introdução</h3>
                <div className="text-sm">
                  <select
                    className="w-full p-2 border rounded mb-2"
                    value={storyConfig.introduction}
                    onChange={(e) =>
                      setStoryConfig({
                        ...storyConfig,
                        introduction: e.target.value,
                      })
                    }
                  >
                    <option value="">Selecione o tipo de introdução</option>
                    <option value="in_medias_res">In medias res</option>
                    <option value="exposicao">Exposição gradual</option>
                    <option value="dialogo">Diálogo inicial</option>
                    <option value="descricao">Descrição do cenário</option>
                  </select>
                  {storyConfig.introduction && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <p className="text-gray-600">
                        Selecionado: {storyConfig.introduction}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Elements Section */}
              <div className="flex flex-col">
                <h3 className="text-xl font-semibold mb-2">Elementos</h3>
                <div className="text-sm">
                  <select
                    className="w-full p-2 border rounded mb-2"
                    value={storyConfig.elements}
                    onChange={(e) =>
                      setStoryConfig({
                        ...storyConfig,
                        elements: e.target.value,
                      })
                    }
                  >
                    <option value="">Selecione os elementos principais</option>
                    <option value="personagens">Personagens complexos</option>
                    <option value="ambiente">Ambiente detalhado</option>
                    <option value="objetos">Objetos simbólicos</option>
                    <option value="conflito">Conflito central</option>
                  </select>
                  {storyConfig.elements && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <p className="text-gray-600">
                        Selecionado: {storyConfig.elements}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Focalization Section */}
              <div className="flex flex-col">
                <h3 className="text-xl font-semibold mb-2">Focalização</h3>
                <div className="text-sm">
                  <select
                    className="w-full p-2 border rounded mb-2"
                    value={storyConfig.focalization}
                    onChange={(e) =>
                      setStoryConfig({
                        ...storyConfig,
                        focalization: e.target.value,
                      })
                    }
                  >
                    <option value="">Selecione a perspectiva</option>
                    <option value="primeira_pessoa">Primeira pessoa</option>
                    <option value="terceira_pessoa">Terceira pessoa</option>
                    <option value="onisciente">Onisciente</option>
                    <option value="limitada">Onisciência limitada</option>
                  </select>
                  {storyConfig.focalization && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <p className="text-gray-600">
                        Selecionado: {storyConfig.focalization}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Structure Section */}
              <div className="flex flex-col">
                <h3 className="text-xl font-semibold mb-2">Estrutura</h3>
                <div className="text-sm">
                  <select
                    className="w-full p-2 border rounded mb-2"
                    value={storyConfig.structure}
                    onChange={(e) =>
                      setStoryConfig({
                        ...storyConfig,
                        structure: e.target.value,
                      })
                    }
                  >
                    <option value="">Selecione a estrutura</option>
                    <option value="linear">Linear</option>
                    <option value="nao_linear">Não-linear</option>
                    <option value="circular">Circular</option>
                    <option value="fragmentada">Fragmentada</option>
                  </select>
                  {storyConfig.structure && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <p className="text-gray-600">
                        Selecionado: {storyConfig.structure}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
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
                            <Info
                              size={14}
                              className="ml-2"
                              title={opt.description}
                            />
                          </option>
                        ))}
                      </select>

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
                    <Label>Formato de Gravação e Codecs</Label>
                    <div className="flex gap-2">
                      <select className="w-1/2 p-2 border rounded">
                        <option value="prores">ProRes</option>
                        <option value="redcode">REDCODE</option>
                        <option value="braw">BRAW</option>
                      </select>
                      <Input placeholder="Bitrate" className="w-1/2" />
                    </div>
                  </div>
                  <div>
                    <Label>Frame Rate Base</Label>
                    <select className="w-full p-2 border rounded">
                      <option value="24">24 fps</option>
                      <option value="25">25 fps</option>
                      <option value="60">60 fps</option>
                    </select>
                  </div>
                  <div>
                    <Label>Gestão de Dados (DIT)</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Workflow" className="w-1/2" />
                      <Input placeholder="Backups" className="w-1/2" />
                    </div>
                  </div>
                  <div>
                    <Label>Monitorização e Calibração</Label>
                    <div className="flex gap-2">
                      <select className="w-1/2 p-2 border rounded">
                        <option value="hdr">HDR</option>
                        <option value="scopes">Scopes</option>
                      </select>
                      <Input placeholder="Visor de Câmara" className="w-1/2" />
                    </div>
                  </div>
                  <div>
                    <Label>Segurança e Logística</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Geradores" className="w-1/2" />
                      <Input placeholder="Cablagem" className="w-1/2" />
                    </div>
                  </div>
                  <div>
                    <Label>Continuidade e Referências Visuais</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Script Photos" className="w-1/2" />
                      <Input placeholder="Moodboards" className="w-1/2" />
                    </div>
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
                                <img
                                  src={URL.createObjectURL(verse.media)}
                                  className="max-h-44"
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
                variant="primary"
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
