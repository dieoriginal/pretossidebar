// src/types/event.ts
export type EventType =
  | "festival"
  | "show"
  | "mini_tour"
  | "pop_up"
  | "beat_battle"
  | "listening"
  | "industry_day"
  | "hybrid"
  | "feira";

export interface Money { value: number; currency: "EUR" }

export interface TicketTier {
  id: string;
  name: string;
  price: Money;
  quantity: number;
  salesStart?: string;
  salesEnd?: string;
  perks?: string[];
}

export interface LineupItem {
  id: string;
  name: string;
  artistId?: string;
  startTime?: string;
  durationMin?: number;
  fee?: Money;
  riderFileId?: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  fee: Money;
  contact: string;
  contractFileId?: string;
  standSize?: string;
}

export interface Financials {
  budgetTotal?: number;
  expected?: { tickets?: number; ticketsRevenue?: number; merch?: number; sponsors?: number; vendors?: number; streaming?: number; grants?: number };
  costs?: { venue?: number; tech?: number; artists?: number; staff?: number; marketing?: number; insurance?: number; other?: number };
  actual?: { revenue?: number; costs?: number; profit?: number };
}

export interface Event {
  id: string;
  name: string;
  slug?: string;
  type: EventType;
  status?: "draft" | "published" | "live" | "done" | "cancelled";
  startAt?: string;
  endAt?: string;
  capacity?: number;
  venueId?: string;
  caes?: string[];
  financials?: Financials;
  lineup?: LineupItem[];
  vendors?: Vendor[];
  sponsors?: any[];
  tasks?: any[];
  documents?: any[];
}
