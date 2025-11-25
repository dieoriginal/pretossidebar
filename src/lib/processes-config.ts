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
  LucideIcon 
} from "lucide-react";
import { getIconName, getIconByName } from "./icon-helper";

export type ProcessType = 
  | "music" 
  | "event" 
  | "merch" 
  | "tour" 
  | "sponsorship" 
  | "sync" 
  | "audiovisual" 
  | "education" 
  | "literature" 
  | "beatstore"
  | "custom";

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
    },
  },
  {
    id: "event",
    type: "event",
    label: "Concerto",
    href: "/events",
    section: "Processo 2",
    icon: CalendarClock,
    description: "Planeamento completo de concertos e eventos",
    enabled: true,
    order: 2,
    dbStore: "events",
    componentPath: "/app/(demo)/events/[id]/page.tsx",
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
      tags: ["concerto", "evento", "planeamento"],
    },
  },
  {
    id: "merch",
    type: "merch",
    label: "Merchandise",
    href: "/merch",
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
    },
  },
  {
    id: "tour",
    type: "tour",
    label: "Mini-Digressão",
    href: "/minitour",
    section: "Processo 4",
    icon: MapPin,
    description: "Planeamento de digressões e tours",
    enabled: true,
    order: 4,
    dbStore: "tours",
    features: {
      save: true,
      export: true,
      share: true,
      templates: true,
      analytics: true,
    },
    metadata: {
      color: "purple",
      category: "eventos",
      tags: ["tour", "digressão", "viagem"],
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
    },
  },
  {
    id: "audiovisual",
    type: "audiovisual",
    label: "Serviços de Audiovisual",
    href: "/audiovisual",
    section: "Processo 9",
    icon: Clapperboard,
    description: "Serviços de produção audiovisual",
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
      category: "produção",
      tags: ["audiovisual", "produção", "vídeo"],
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
  }));
}

