import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { saveEventToIndexedDB, loadEventFromIndexedDB } from "@/lib/events-db";

// EventData type from the events page
export interface EventData {
  id?: string;
  overview: {
    eventName: string;
    eventType: string;
    date: string;
    venue: string;
    capacity: number;
    description: string;
    organizerName: string;
    organizerContact: string;
  };
  finance: {
    budget: number;
    ticketPrice: number;
    sponsorship: number;
    expenses: Array<{ name: string; amount: number }>;
    venueSplit: number;
    cachetPago?: number;
  };
  lineup: {
    artists: Array<{ name: string; time: string; fee: number; contact: string; instagram: string; spotify: string }>;
    soundcheck: string;
    curfew: string;
  };
  production: {
    sound: string;
    lighting: string;
    stage: string;
    crew: Array<{ role: string; name: string; contact: string; gear?: string; deal?: string }>;
  };
  logistics: {
    address: string;
    parking: string;
    loadIn: string;
    loadOut: string;
    catering: string;
    material: Array<{ id: string; name: string; category: string; checked: boolean; returned: boolean }>;
    travelOutfit: Array<{ id: string; name: string; category: string; checked: boolean; returned: boolean }>;
  };
  tickets: {
    totalTickets: number;
    soldTickets: number;
    priceTiers: Array<{ name: string; price: number; quantity: number }>;
  };
  marketing: {
    socialMedia: Array<{ platform: string; content: string; scheduled: string }>;
    pressRelease: string;
    influencers: Array<{ name: string; reach: number; fee: number }>;
  };
  templates: {
    artistConfirmation: string;
    venueProposal: string;
  };
  wardrobe: {
    selectedHairstyles: string[];
    selectedGlasses: string[];
    selectedHeadWear: string[];
    selectedSuperior: string[];
    selectedPants: string[];
    selectedShoes: string[];
    selectedNeckAccessories: string[];
    selectedBracelets: string[];
    selectedWatch: string[];
    selectedBelt: string[];
    customItems: { name: string; category: string; price: number }[];
    totalPrice: number;
  };
  setlist: {
    songs: Array<{ name: string; autotuneNote: string; order: number; time: string }>;
    autotuneSetting: string;
    voiceType: "auto-tenor" | "low-male" | "";
  };
  rehearsalNotes: {
    decisions: Array<{ song: string; decision: string; notes: string }>;
    breathingIssues: Array<{ song: string; part: string; notes: string; timestamp?: string }>;
    generalNotes: string;
  };
  dayItinerary: {
    date: string;
    location: string;
    travelDetails: string;
    accommodation: string;
    clothingStores: string;
    meals: string;
    soundcheckTime: string;
    venueOpenTime: string;
    studioVisits: string;
    voicePractice: string;
    hydrationReminders: string;
    otherNotes: string;
  };
}

type EventStore = {
  currentEvent: EventData | null;
  setCurrentEvent: (event: EventData) => void;
  updateEvent: (partial: Partial<EventData>) => void;
  reset: () => void;
  loadEvent: (id: string) => Promise<void>;
};

export const createEmptyEvent = (id?: string): EventData => ({
  id: id || `evento-${Date.now()}`,
  overview: {
    eventName: "",
    eventType: "",
    date: "",
    venue: "",
    capacity: 0,
    description: "",
    organizerName: "",
    organizerContact: "",
  },
  finance: {
    budget: 0,
    ticketPrice: 0,
    sponsorship: 0,
    expenses: [
      { name: "Som", amount: 0 },
      { name: "Iluminação", amount: 0 },
      { name: "Palco", amount: 0 },
      { name: "Técnicos", amount: 0 },
      { name: "Catering", amount: 0 },
      { name: "Segurança", amount: 0 },
      { name: "Bilheteira", amount: 0 },
      { name: "Seguros", amount: 0 },
      { name: "Licenças (SPA)", amount: 87 },
      { name: "Marketing", amount: 0 },
      { name: "Transporte", amount: 0 },
      { name: "Alojamento", amount: 0 },
      { name: "Equipamento adicional", amount: 0 },
      { name: "Streaming / Transmissão", amount: 0 },
      { name: "Merch produção", amount: 0 },
    ],
    venueSplit: 30,
    cachetPago: 0,
  },
  lineup: {
    artists: [],
    soundcheck: "",
    curfew: "",
  },
  production: {
    sound: "",
    lighting: "",
    stage: "",
    crew: [],
  },
  logistics: {
    address: "",
    parking: "",
    loadIn: "",
    loadOut: "",
    catering: "",
    material: [],
    travelOutfit: [],
  },
  tickets: {
    totalTickets: 0,
    soldTickets: 0,
    priceTiers: [],
  },
  marketing: {
    socialMedia: [],
    pressRelease: "",
    influencers: [],
  },
  templates: {
    artistConfirmation: "",
    venueProposal: "",
  },
  wardrobe: {
    selectedHairstyles: [],
    selectedGlasses: [],
    selectedHeadWear: [],
    selectedSuperior: [],
    selectedPants: [],
    selectedShoes: [],
    selectedNeckAccessories: [],
    selectedBracelets: [],
    selectedWatch: [],
    selectedBelt: [],
    customItems: [],
    totalPrice: 0,
  },
    setlist: {
      songs: [],
      autotuneSetting: "",
      voiceType: "",
    },
    rehearsalNotes: {
      decisions: [],
      breathingIssues: [],
      generalNotes: "",
    },
  dayItinerary: {
    date: "",
    location: "",
    travelDetails: "",
    accommodation: "",
    clothingStores: "",
    meals: "",
    soundcheckTime: "",
    venueOpenTime: "",
    studioVisits: "",
    voicePractice: "",
    hydrationReminders: "",
    otherNotes: "",
  },
});

export const useEvents = create(
  persist<EventStore>(
    (set, get) => ({
      currentEvent: null,
      setCurrentEvent: (event) => {
        const eventWithId = { ...event, id: event.id || `evento-${Date.now()}` };
        set({ currentEvent: eventWithId });
        persistEventToIndexedDB(eventWithId);
      },
      updateEvent: (partial) => {
        const curr = get().currentEvent;
        if (!curr) return;
        
        const updated = { ...curr, ...partial } as EventData;
        updated.id = updated.id || curr.id || `evento-${Date.now()}`;
        set({ currentEvent: updated });
        persistEventToIndexedDB(updated);
      },
      reset: () => set({ currentEvent: null }),
      loadEvent: async (id: string) => {
        try {
          const data = (await loadEventFromIndexedDB(id)) as EventData | null;
          if (data) {
            set({ currentEvent: { ...data, id } });
          }
        } catch (e) {
          console.error('Error loading event:', e);
        }
      },
    }),
    {
      name: "eventoAtual",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Debounced save to IndexedDB
function simpleDebounce<T extends (...args: any[]) => void>(fn: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

const persistEventToIndexedDB = simpleDebounce(async (event: EventData) => {
  try {
    await saveEventToIndexedDB(event);
  } catch (e) {
    console.error('Error persisting event:', e);
  }
}, 1000);

