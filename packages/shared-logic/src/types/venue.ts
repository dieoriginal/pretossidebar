export interface Venue {
  id: string;
  user_id: string;
  name: string;
  city?: string;
  country?: string;
  address?: string;
  capacity?: number;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  photos?: string[];
  lat?: number;
  lng?: number;
  region?: string;
  booking_enabled: boolean;
  min_advance_days: number;
  max_advance_days: number;
  default_price?: number;
  currency: string;
  equipment?: string;
  technical_rider?: string;
  opening_hours?: string;
  curfew?: string;
  created_at: string;
  updated_at: string;
}

export interface VenueAvailability {
  id: string;
  venue_id: string;
  date: string;
  status: 'available' | 'booked' | 'blocked' | 'pending';
  price?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}
