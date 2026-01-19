import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { saveProjectToIndexedDB, loadProjectFromIndexedDB } from "@/lib/db";
import type { Venue } from "@/lib/venuesDb";

export type VerseWord = { text: string; customColor?: string; stressed?: boolean };
export type Verse = { id: string; words: VerseWord[]; tag: string };
export type Strophe = { id: string; verses: Verse[]; description?: string; poeticForm?: string };
export type FeaturingContact = {
  name: string;
  email?: string;
  phone?: string;
  instagram?: string;
  notes?: string;
  private?: boolean;
};

export type ProjectType = "single" | "merch" | "event";

export type ProjectState = {
  id: string;
  type: ProjectType;
  songInfo: { title: string; artist: string; producer: string; featuring: string[]; synopsis?: string };
  strophes: Strophe[];
  featuringContacts?: FeaturingContact[];
  currentStep: number;
  // + total de passos do stepper (usado no dashboard)
  totalSteps?: number;
  // optional audio attachment persisted per single
  audio?: { name: string; type: string; size: number; lastModified?: number; hasBlob?: boolean };
  updatedAt: string;
  // Step-specific data for auto-save
  stepData?: {
    venues?: {
      selectedVenueId?: string;
      customVenueData?: Partial<Venue>;
      draftVenue?: Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>;
    };
    edicaodevideo?: {
      checkedItems?: Record<number, boolean>;
    };
    fotografia?: any;
    filmagem?: any;
    gravacao?: any;
    vestuario?: any;
    orcamento?: any;
    narratologia?: any;
    monetizacao?: any;
    maquete?: any;
    lancamento?: any;
    direitosautorais?: any;
    custosfixos?: any;
    contratualizacao?: any;
    account?: any;
  };
};

type ProjectStore = {
  project: ProjectState | null;
  setProject: (p: ProjectState) => void;
  update: (partial: Partial<ProjectState>) => void;
  updateStep: (stepKey: string, data: any) => void;
  reset: () => void;
  loadLocal: (id: string) => Promise<void>;
  syncToCloud: () => Promise<void>;
};

export const createEmptyProject = (
  id: string = `projeto-${Date.now()}`,
  type: ProjectType = "single"
): ProjectState => ({
  id,
  type,
  songInfo: { title: "", artist: "", producer: "", featuring: [], synopsis: "" },
  strophes: [],
  featuringContacts: [],
  currentStep: 0,
  // default anterior (10) — será sobrescrito pela página de escrita (5)
  totalSteps: 10,
  updatedAt: new Date().toISOString(),
});

export const useProject = create(
  persist<ProjectStore>(
    (set, get) => ({
      project: createEmptyProject(),
      setProject: (p) => set({ project: { ...p, updatedAt: new Date().toISOString() } }),
      update: (partial) => {
        const curr = get().project ?? createEmptyProject();
        const next = { ...curr, ...partial, updatedAt: new Date().toISOString() } as ProjectState;
        set({ project: next });
        persistToIndexedDB(next);
      },
      updateStep: (stepKey: string, data: any) => {
        const curr = get().project ?? createEmptyProject();
        const stepData = curr.stepData || {};
        const next: ProjectState = {
          ...curr,
          stepData: {
            ...stepData,
            [stepKey]: data,
          },
          updatedAt: new Date().toISOString(),
        };
        set({ project: next });
        persistToIndexedDB(next);
      },
      reset: () => set({ project: createEmptyProject() }),
      loadLocal: async (id: string) => {
        try {
          const data = (await loadProjectFromIndexedDB(id)) as ProjectState | null;
          if (data) set({ project: data });
        } catch (e) {
          // noop
        }
      },
      syncToCloud: async () => {
        const project = get().project;
        if (!project) return;
        try {
          // Importação dinâmica para evitar circular dependency
          const { syncProjectToCloud } = await import('@/lib/supabase');
          const { getCurrentUserId } = await import('@/lib/firebase');
          const userId = getCurrentUserId();
          if (userId) {
            await syncProjectToCloud(userId, project);
          }
        } catch (e) {
          console.error('Erro ao sincronizar com nuvem:', e);
        }
      },
    }),
    {
      name: "projetoAtual",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// lightweight debounce without external deps
function simpleDebounce<T extends (...args: any[]) => void>(fn: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

const persistToIndexedDB = simpleDebounce(async (state: ProjectState) => {
  try {
    await saveProjectToIndexedDB(state);
  } catch (e) {
    // Ignore offline/permission issues
  }
}, 1000);
