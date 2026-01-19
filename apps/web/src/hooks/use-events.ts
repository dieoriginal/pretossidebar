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
    city?: string;
    capacity: number;
    description: string;
    organizerName: string;
    organizerContact: string;
    agenda?: string; // Descrição da agenda
  };
  venues?: {
    primary: any | null;
    backups: any[];
    requiredCapacity: number;
  };
  venueContact?: {
    name: string;
    email: string;
    phone: string;
    emailSent?: boolean;
    emailSentDate?: string | null;
    confirmed?: boolean;
    confirmedDate?: string | null;
  };
  finance: {
    budget: number;
    ticketPrice: number;
    sponsorship: number;
    expenses: Array<{ name: string; amount: number }>;
    venueSplit: number;
    cachetPago?: number;
    expectedAttendance?: number;
    merchPerPerson?: number;
    estimatedProfit?: number;
    paymentMethods?: string[]; // ["Cartão","Dinheiro","Online"]
  };
  lineup: {
    artists: Array<{ 
      name: string; 
      time: string; 
      fee: number; 
      contact: string; 
      instagram: string; 
      spotify: string;
      bio?: string;
      shortBio?: string;
      description?: string;
    }>;
    soundcheck: string;
    curfew: string;
    schedule?: Array<any>;
  };
  program?: {
    start: string;
    end: string;
    description: string;
  };
  curation?: {
    programThemes: string[];
    curator?: string;
  };
  production: {
    sound: string;
    lighting: string;
    stage: string;
    crew: Array<{ role: string; name: string; contact: string; gear?: string; deal?: string }>;
    technicalRider?: string;
    technicalRiderConfirmed?: boolean;
    team?: Array<any>;
    estimatedCost?: number;
    equipment?: Array<{
      id: string;
      type: string; // "projector", "screen", "mic", "battery", "cable", etc.
      model?: string;
      qty?: number;
      specs?: Record<string, any>; // resolution, lumens, size, position, etc.
      notes?: string;
    }>;
    connectivity?: {
      primary: { speed?: string; type?: string };
      backup: { speed?: string; type?: string };
      notes?: string;
    };
    branding?: {
      description?: string;
      materialsNeeded?: string;
    };
    decor?: {
      description?: string;
      lightingRequirements?: string;
      materialsNeeded?: string;
    };
  };
  logistics: {
    address: string;
    parking: string;
    loadIn: string;
    loadOut: string;
    catering: string;
    material: Array<{ id: string; name: string; category: string; checked: boolean; returned: boolean }>;
    travelOutfit: Array<{ id: string; name: string; category: string; checked: boolean; returned: boolean }>;
    estimatedCost?: number;
    transport?: string;
    accommodation?: string;
    mapLink?: string; // Link do Google Maps
  };
  tickets: {
    totalTickets: number;
    soldTickets: number;
    priceTiers: Array<{ name: string; price: number; quantity: number }>;
    policy?: string;
    prices?: Record<string, any>;
  };
  access?: {
    badgeSystem?: "Físico" | "Digital";
    badgeDesignSpec?: string;
    badgeInfoFields?: string[]; // ["Nome","Função","QR Code"]
    qrEnabled?: boolean;
    areas?: string[]; // ["Geral","VIP","Backstage"]
    guestList?: Array<{ name: string; email: string; ticketType: string }>;
    accessControl?: string[]; // ["Lista de Convidados","Bilhetes","Pulseiras"]
  };
  marketing: {
    socialMedia: Array<{ platform: string; content: string; scheduled: string }>;
    pressRelease: string;
    influencers: Array<{ name: string; reach: number; fee: number }>;
    strategy?: string;
    assets?: string;
    budget?: number;
    mediaCoverage?: {
      radio?: Array<{ outlet: string; contact?: string; spend?: number; booked?: boolean }>;
      tv?: Array<{ outlet: string; contact?: string; spend?: number; booked?: boolean }>;
      newspapers?: Array<{ outlet: string; contact?: string; spend?: number; booked?: boolean }>;
      magazines?: Array<{ outlet: string; contact?: string; spend?: number; booked?: boolean }>;
    };
  };
  communication?: {
    channels?: string[]; // ["Email","SMS","App Push"]
    templates?: {
      confirmation?: string;
      reminderPreEvent?: string;
      [key: string]: string | undefined;
    };
    automaticMessages?: string; // Templates de mensagens automáticas
  };
  contracts?: Array<{
    id: string;
    title: string;
    value: number;
    terms: string;
    parties: string[];
    signed: boolean;
    signedDate?: string;
  }>;
  sponsors?: Array<{
    name: string;
    contact?: string;
    package?: string;
    committed?: boolean;
    contractValue?: number;
  }>;
  staff?: {
    roles?: Array<{
      role: string;
      qty: number;
      actions?: string[];
    }>;
    contacts?: Array<{
      name: string;
      role: string;
      email?: string;
      phone?: string;
      notes?: string;
    }>;
  };
  meetings?: Array<{
    id: string;
    date: string;
    time: string;
    location: string;
    agenda?: string;
    attendees?: string[];
  }>;
  rehearsal?: {
    date?: string;
    time?: string;
    location?: string;
    notes?: string;
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
    travelDetails: Array<{ id: string; type: string; time: string; details: string; notes: string }>;
    accommodation: string;
    clothingStores: Array<{ id: string; name: string; address: string; time: string; notes: string }>;
    meals: Array<{ id: string; date: string; time: string; location: string; whatToEat: string; price: number }>;
    soundcheckTime: string;
    venueOpenTime: string;
    studioVisits: Array<{ id: string; studio: string; artist: string; time: string; purpose: string; notes: string }>;
    voicePractice: Array<{ id: string; type: string; time: string; duration: string; notes: string }>;
    hydrationReminders: Array<{ id: string; time: string; completed: boolean; tip?: string }>;
    audienceReminders: Array<{ id: string; time: string; completed: boolean; tip: string }>;
    otherNotes: string;
  };
  contacts?: Array<{
    id: string;
    name: string;
    role: string;
    email?: string;
    phone?: string;
    notes?: string;
  }>;
  month?: number;
  year?: number;
  week?: number;
  template?: boolean;
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
    city: "",
    capacity: 0,
    description: "",
    organizerName: "",
    organizerContact: "",
    agenda: "",
  },
  venues: {
    primary: null,
    backups: [],
    requiredCapacity: 0,
  },
  venueContact: {
    name: "",
    email: "",
    phone: "",
    emailSent: false,
    emailSentDate: null,
    confirmed: false,
    confirmedDate: null,
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
    paymentMethods: [],
  },
  lineup: {
    artists: [],
    soundcheck: "",
    curfew: "",
    schedule: [],
  },
  program: {
    start: "",
    end: "",
    description: "",
  },
  curation: {
    programThemes: [],
    curator: "",
  },
  production: {
    sound: "",
    lighting: "",
    stage: "",
    crew: [],
    equipment: [],
    connectivity: {
      primary: { speed: "", type: "" },
      backup: { speed: "", type: "" },
      notes: "",
    },
    branding: {
      description: "",
      materialsNeeded: "",
    },
    decor: {
      description: "",
      lightingRequirements: "",
      materialsNeeded: "",
    },
  },
  logistics: {
    address: "",
    parking: "",
    loadIn: "",
    loadOut: "",
    catering: "",
    material: [],
    travelOutfit: [],
    mapLink: "",
  },
  tickets: {
    totalTickets: 0,
    soldTickets: 0,
    priceTiers: [],
  },
  access: {
    badgeSystem: "Físico",
    badgeDesignSpec: "",
    badgeInfoFields: [],
    qrEnabled: false,
    areas: [],
    guestList: [],
    accessControl: [],
  },
  marketing: {
    socialMedia: [],
    pressRelease: "",
    influencers: [],
    mediaCoverage: {
      radio: [],
      tv: [],
      newspapers: [],
      magazines: [],
    },
  },
  communication: {
    channels: [],
    templates: {
      confirmation: "",
      reminderPreEvent: "",
    },
    automaticMessages: "",
  },
  contracts: [],
  sponsors: [],
  staff: {
    roles: [],
    contacts: [],
  },
  meetings: [],
  rehearsal: {
    date: "",
    time: "",
    location: "",
    notes: "",
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
    travelDetails: [],
    accommodation: "",
    meals: [],
    soundcheckTime: "",
    venueOpenTime: "",
    clothingStores: [],
    studioVisits: [],
    voicePractice: [],
    hydrationReminders: [],
    audienceReminders: [],
    otherNotes: "",
  },
  contacts: [],
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

