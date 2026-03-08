/**
 * Centralized Process Configuration System
 * Master configuration for all processes in the application
 * Enables dynamic page creation and routing
 */

import { 
  Music, 
  CalendarClock, 
  ShoppingBag, 
  MapPin, 
  HandCoins, 
  Clapperboard, 
  BookOpenText, 
  Store,
  LucideIcon,
  Mic,
  Piano,
  Drum,
  Sparkles,
  Heart,
  Shirt,
  Dumbbell,
  Palette,
  Share2,
  Calendar,
  Volume2,
  Guitar,
  Brain,
  Repeat,
  ShoppingCart
} from "lucide-react";
import { getIconName, getIconByName } from "./icon-helper";

export type ProcessType = 
  | "music" 
  | "espetaculos-ao-vivo"
  | "merch" 
  | "sponsorship" 
  | "sync" 
  | "audiovisual" 
  | "education" 
  | "literature" 
  | "beatstore"
  | "playbook"
  | "superstar"
  | "ideologies"
  | "habit-stacking"
  | "grocery"
  | "custom"
  | "event"  // Legacy support - redirects to espetaculos-ao-vivo
  | "tour";  // Legacy support - redirects to espetaculos-ao-vivo

export interface ProcessConfig {
  id: string;
  type: ProcessType;
  label: string;
  href: string;
  section: string;
  icon: LucideIcon;
  description: string;
  enabled: boolean;
  order: number;
  // Database configuration
  dbStore?: string;
  // Component paths
  componentPath?: string;
  // Features
  features: {
    save: boolean;
    export: boolean;
    share: boolean;
    templates: boolean;
    analytics: boolean;
  };
  // Metadata
  metadata?: {
    color?: string;
    category?: string;
    tags?: string[];
    group?: string; // Para agrupamento visual na sidebar
  };
}

export const PROCESSES_CONFIG: ProcessConfig[] = [
  {
    id: "music",
    type: "music",
    label: "Música e Videoclipe",
    href: "/obraeurudita",
    section: "Processo 1",
    icon: Music,
    description: "Criação e produção de música e videoclipes",
    enabled: true,
    order: 1,
    dbStore: "projects",
    componentPath: "/app/(demo)/obraeurudita/page.tsx",
    features: {
      save: true,
      export: true,
      share: true,
      templates: true,
      analytics: true,
    },
    metadata: {
      color: "indigo",
      category: "criação",
      tags: ["música", "videoclipe", "produção"],
      group: "Produção",
    },
  },
  {
    id: "espetaculos-ao-vivo",
    type: "espetaculos-ao-vivo",
    label: "Espetáculos ao Vivo",
    href: "/espetaculos-ao-vivo",
    section: "Processo 2 & 4",
    icon: CalendarClock,
    description: "Planeamento completo de concertos, eventos e digressões",
    enabled: true,
    order: 2,
    dbStore: "events",
    componentPath: "/app/(demo)/espetaculos-ao-vivo/page.tsx",
    features: {
      save: true,
      export: true,
      share: true,
      templates: true,
      analytics: true,
    },
    metadata: {
      color: "blue",
      category: "eventos",
      tags: ["concerto", "evento", "digressão", "tour", "planeamento"],
      group: "Produção",
    },
  },
  {
    id: "merch",
    type: "merch",
    label: "Merchandise",
    href: "/dashboard/merch",
    section: "Processo 3",
    icon: ShoppingBag,
    description: "Gestão de merchandise e produtos",
    enabled: true,
    order: 3,
    dbStore: "merch",
    features: {
      save: true,
      export: true,
      share: false,
      templates: true,
      analytics: true,
    },
    metadata: {
      color: "green",
      category: "negócio",
      tags: ["merch", "produtos", "vendas"],
      group: "Negócio",
    },
  },
  {
    id: "sponsorship",
    type: "sponsorship",
    label: "Patrocínios & Apoios",
    href: "/sponsoships",
    section: "Processo 7",
    icon: HandCoins,
    description: "Gestão de patrocínios e apoios",
    enabled: true,
    order: 7,
    dbStore: "sponsorships",
    features: {
      save: true,
      export: true,
      share: true,
      templates: true,
      analytics: true,
    },
    metadata: {
      color: "yellow",
      category: "negócio",
      tags: ["patrocínio", "apoio", "financiamento"],
      group: "Negócio",
    },
  },
  {
    id: "sync",
    type: "sync",
    label: "Sync Licensing",
    href: "/sync",
    section: "Processo 11",
    icon: Clapperboard,
    description: "Licenciamento de sincronização",
    enabled: true,
    order: 11,
    dbStore: "sync",
    features: {
      save: true,
      export: true,
      share: false,
      templates: true,
      analytics: false,
    },
    metadata: {
      color: "orange",
      category: "licenciamento",
      tags: ["sync", "licenciamento", "direitos"],
      group: "Negócio",
    },
  },
  {
    id: "audiovisual",
    type: "audiovisual",
    label: "Serviços de Audiovisual",
    href: "/audiovisual",
    section: "Processo 9",
    icon: Clapperboard,
    description: "Negócio de serviços de produção audiovisual (produção paga)",
    enabled: true,
    order: 9,
    dbStore: "audiovisual",
    features: {
      save: true,
      export: true,
      share: true,
      templates: true,
      analytics: true,
    },
    metadata: {
      color: "red",
      category: "negócio",
      tags: ["audiovisual", "negócio", "produção-paga", "serviços", "vídeo"],
      group: "Negócio",
    },
  },
  {
    id: "education",
    type: "education",
    label: "Academia",
    href: "/processos/education",
    section: "Processo 10",
    icon: BookOpenText,
    description: "Conteúdos educacionais e formação",
    enabled: true,
    order: 10,
    dbStore: "education",
    features: {
      save: true,
      export: true,
      share: true,
      templates: true,
      analytics: false,
    },
    metadata: {
      color: "teal",
      category: "educação",
      tags: ["educação", "formação", "academia"],
      group: "Educação",
    },
  },
  {
    id: "literature",
    type: "literature",
    label: "Escrita Literária",
    href: "/creation",
    section: "Processo 11",
    icon: BookOpenText,
    description: "Criação literária e escrita",
    enabled: true,
    order: 11,
    dbStore: "literature",
    features: {
      save: true,
      export: true,
      share: true,
      templates: true,
      analytics: false,
    },
    metadata: {
      color: "pink",
      category: "criação",
      tags: ["literatura", "escrita", "livros"],
      group: "Produção",
    },
  },
  {
    id: "beatstore",
    type: "beatstore",
    label: "Beatstore",
    href: "/processos/beatselling",
    section: "Processo 12",
    icon: Store,
    description: "Venda de beats e instrumentais",
    enabled: true,
    order: 12,
    dbStore: "beats",
    features: {
      save: true,
      export: false,
      share: false,
      templates: false,
      analytics: true,
    },
    metadata: {
      color: "cyan",
      category: "negócio",
      tags: ["beats", "venda", "instrumentais"],
      group: "Negócio",
    },
  },
  // NOVAS SEÇÕES - Playbook
  {
    id: "playbook",
    type: "playbook",
    label: "Playbook",
    href: "/playbook",
    section: "Produção",
    icon: Mic,
    description: "Gear essencial, piano videos e drum kits",
    enabled: true,
    order: 20,
    dbStore: "playbook",
    features: {
      save: true,
      export: true,
      share: false,
      templates: false,
      analytics: false,
    },
    metadata: {
      color: "violet",
      category: "produção",
      tags: ["gear", "equipamento", "recursos"],
      group: "Playbook",
    },
  },
  // NOVAS SEÇÕES - Superstar Management
  {
    id: "superstar",
    type: "superstar",
    label: "Superstar Management",
    href: "/superstar",
    section: "Desenvolvimento",
    icon: Sparkles,
    description: "Beauty, fashion, fitness, branding e desenvolvimento artístico",
    enabled: true,
    order: 21,
    dbStore: "superstar",
    features: {
      save: true,
      export: true,
      share: false,
      templates: false,
      analytics: false,
    },
    metadata: {
      color: "rose",
      category: "desenvolvimento",
      tags: ["beauty", "fashion", "branding"],
      group: "Desenvolvimento Artístico",
    },
  },
  // NOVAS SEÇÕES - Ideologias
  {
    id: "ideologies",
    type: "ideologies",
    label: "Ideologias & Simbolismos",
    href: "/ideologies",
    section: "Desenvolvimento",
    icon: Brain,
    description: "Sistema de ideologias políticas e filosóficas para arte",
    enabled: true,
    order: 22,
    dbStore: "ideologies",
    features: {
      save: true,
      export: true,
      share: false,
      templates: false,
      analytics: false,
    },
    metadata: {
      color: "amber",
      category: "desenvolvimento",
      tags: ["ideologia", "filosofia", "simbolismo"],
      group: "Desenvolvimento Artístico",
    },
  },
  // Habit Stacking - Sistema de hábitos baseado em Atomic Habits
  {
    id: "habit-stacking",
    type: "habit-stacking",
    label: "Habit Stacking",
    href: "/habit-stacking",
    section: "Desenvolvimento",
    icon: Repeat,
    description: "Sistema de gestão de hábitos baseado no método Atomic Habits",
    enabled: true,
    order: 23,
    dbStore: "habitStacking",
    features: {
      save: true,
      export: true,
      share: false,
      templates: true,
      analytics: true,
    },
    metadata: {
      color: "emerald",
      category: "desenvolvimento",
      tags: ["hábitos", "produtividade", "atomic-habits", "desenvolvimento-pessoal"],
      group: "Desenvolvimento Artístico",
    },
  },
  // Grocery Shopping - Lista de compras com orçamento semanal
  {
    id: "grocery",
    type: "grocery",
    label: "Lista de Compras",
    href: "/grocery",
    section: "Desenvolvimento",
    icon: ShoppingCart,
    description: "Orçamento semanal de compras - Millionaire Next Door style",
    enabled: true,
    order: 24,
    features: {
      save: true,
      export: true,
      share: false,
      templates: true,
      analytics: true,
    },
    metadata: {
      color: "green",
      category: "desenvolvimento",
      tags: ["compras", "orçamento", "disciplina", "finanças"],
      group: "Desenvolvimento Artístico",
    },
  },
];

/**
 * Get process by ID
 */
export function getProcessById(id: string): ProcessConfig | undefined {
  return PROCESSES_CONFIG.find(p => p.id === id);
}

/**
 * Get process by type
 */
export function getProcessByType(type: ProcessType): ProcessConfig | undefined {
  return PROCESSES_CONFIG.find(p => p.type === type);
}

/**
 * Get all enabled processes
 */
export function getEnabledProcesses(): ProcessConfig[] {
  return PROCESSES_CONFIG
    .filter(p => p.enabled)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get processes by category
 */
export function getProcessesByCategory(category: string): ProcessConfig[] {
  return PROCESSES_CONFIG.filter(p => p.metadata?.category === category);
}

/**
 * Add custom process dynamically
 * Also saves to localStorage for persistence
 */
export function addCustomProcess(config: Omit<ProcessConfig, "id" | "type"> & { id: string; type?: ProcessType }): ProcessConfig {
  const newProcess: ProcessConfig = {
    ...config,
    type: config.type || "custom",
    id: config.id,
  };
  
  PROCESSES_CONFIG.push(newProcess);
  PROCESSES_CONFIG.sort((a, b) => a.order - b.order);
  
  // Save to localStorage for persistence
  // Note: We need to serialize the icon name, not the component
  try {
    const customProcesses = JSON.parse(localStorage.getItem("customProcesses") || "[]");
    const iconName = getIconName(config.icon);
    
    const serializedProcess = {
      ...newProcess,
      iconName, // Store icon name instead of component
      icon: undefined, // Remove icon component
    };
    
    customProcesses.push(serializedProcess);
    localStorage.setItem("customProcesses", JSON.stringify(customProcesses));
  } catch (error) {
    console.error("Error saving custom process to localStorage:", error);
  }
  
  return newProcess;
}

/**
 * Load custom processes from localStorage
 */
export function loadCustomProcesses(): ProcessConfig[] {
  try {
    const customProcesses = JSON.parse(localStorage.getItem("customProcesses") || "[]");
    
    return customProcesses.map((process: any) => {
      if (process.iconName) {
        return {
          ...process,
          icon: getIconByName(process.iconName),
        };
      }
      return {
        ...process,
        icon: getIconByName("Settings"), // Default icon
      };
    });
  } catch (error) {
    console.error("Error loading custom processes:", error);
    return [];
  }
}

/**
 * Initialize custom processes on app load
 */
export function initializeCustomProcesses(): void {
  const customProcesses = loadCustomProcesses();
  customProcesses.forEach(process => {
    // Check if already exists
    if (!PROCESSES_CONFIG.find(p => p.id === process.id)) {
      PROCESSES_CONFIG.push(process);
    }
  });
  PROCESSES_CONFIG.sort((a, b) => a.order - b.order);
}

/**
 * Update process configuration
 */
export function updateProcess(id: string, updates: Partial<ProcessConfig>): ProcessConfig | null {
  const index = PROCESSES_CONFIG.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  PROCESSES_CONFIG[index] = { ...PROCESSES_CONFIG[index], ...updates };
  return PROCESSES_CONFIG[index];
}

/**
 * Get sidebar items from processes config
 * Returns items grouped by metadata.group for better organization
 */
export function getSidebarItems() {
  // Initialize custom processes on first call
  if (typeof window !== "undefined") {
    initializeCustomProcesses();
  }
  
  return getEnabledProcesses().map(p => ({
    label: p.label,
    href: p.href,
    section: p.section,
    icon: p.icon,
    group: p.metadata?.group,
  }));
}

/**
 * Get sidebar items grouped by category/group
 */
export function getSidebarItemsGrouped() {
  const items = getSidebarItems();
  const grouped: Record<string, typeof items> = {};
  
  items.forEach(item => {
    const group = item.group || "Produção";
    if (!grouped[group]) {
      grouped[group] = [];
    }
    grouped[group].push(item);
  });
  
  return grouped;
}

