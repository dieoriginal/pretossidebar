export type BookingStatus = 
  | 'pending'
  | 'approved'
  | 'paid'
  | 'confirmed'
  | 'cancelled';

export type AvailabilityStatus = 
  | 'available'
  | 'booked'
  | 'blocked'
  | 'pending';

export type PaymentStatus = 
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'refunded';

export interface Booking {
  id: string;
  venue_id: string;
  artist_id: string;
  artist_name: string;
  artist_email?: string;
  artist_phone?: string;
  date: string;
  status: BookingStatus;
  requested_price?: number;
  final_price?: number;
  currency: string;
  event_name?: string;
  event_type?: string;
  expected_attendance?: number;
  equipment_needs?: string;
  special_requests?: string;
  stripe_payment_intent_id?: string;
  stripe_checkout_session_id?: string;
  payment_status?: PaymentStatus;
  paid_at?: string;
  requested_at: string;
  approved_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  venue?: any;
}

export interface CreateBookingRequest {
  venue_id: string;
  date: string;
  event_name: string;
  event_type?: string;
  expected_attendance?: number;
  equipment_needs?: string;
  special_requests?: string;
  requested_price?: number;
}

export interface ApproveBookingRequest {
  final_price?: number;
  notes?: string;
}
