export type EventType =
  | 'festival'
  | 'show'
  | 'mini_tour'
  | 'pop_up'
  | 'beat_battle'
  | 'listening'
  | 'industry_day'
  | 'simpósio'
  | 'hybrid'
  | 'feira'
  | 'salon'
  | 'concert';

export type EventStatus = 
  | 'draft'
  | 'published'
  | 'live'
  | 'completed'
  | 'cancelled';

export interface Event {
  id: string;
  artist_id: string;
  venue_id: string;
  booking_id?: string;
  name: string;
  description?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  event_type?: EventType;
  genre?: string;
  min_age?: number;
  status: EventStatus;
  created_at: string;
  updated_at: string;
}

export interface EventLineup {
  id: string;
  event_id: string;
  artist_name: string;
  start_time?: string;
  duration?: number;
  order: number;
  created_at: string;
}

export interface Ticket {
  id: string;
  event_id: string;
  tier_name: string;
  price: number;
  quantity: number;
  sold: number;
  sales_start?: string;
  sales_end?: string;
  created_at: string;
}

export interface TicketSale {
  id: string;
  ticket_id: string;
  event_id: string;
  buyer_email: string;
  buyer_name?: string;
  quantity: number;
  total_amount: number;
  stripe_payment_intent_id?: string;
  qr_code?: string;
  validated: boolean;
  validated_at?: string;
  created_at: string;
}
