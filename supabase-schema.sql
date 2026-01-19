-- ============================================
-- EVENTOS PLATFORM - SCHEMA COMPLETO
-- ============================================
-- Execute este script no SQL Editor do Supabase Dashboard

-- ============================================
-- TABELAS EXISTENTES (mantidas para compatibilidade)
-- ============================================

-- Tabela de projetos de usuários
CREATE TABLE IF NOT EXISTS projects (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  data TEXT NOT NULL,
  title TEXT,
  artist TEXT,
  producer TEXT,
  featuring TEXT,
  last_synced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);

-- Tabela de singles públicos
CREATE TABLE IF NOT EXISTS public_singles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT,
  featured TEXT[],
  producer TEXT,
  cover_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_singles_updated_at ON public_singles(updated_at DESC);

-- Tabela de projetos públicos
CREATE TABLE IF NOT EXISTS public_projects (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_projects_is_public ON public_projects(is_public);
CREATE INDEX IF NOT EXISTS idx_public_projects_updated_at ON public_projects(updated_at DESC);

-- Tabela de eventos públicos
CREATE TABLE IF NOT EXISTS public_events (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_events_is_public ON public_events(is_public);
CREATE INDEX IF NOT EXISTS idx_public_events_updated_at ON public_events(updated_at DESC);

-- ============================================
-- NOVAS TABELAS - SISTEMA DE EVENTOS
-- ============================================

-- Tabela de venues (casas de shows)
CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  city TEXT,
  country TEXT DEFAULT 'Portugal',
  address TEXT,
  capacity INTEGER,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  photos TEXT[],
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  region TEXT,
  booking_enabled BOOLEAN DEFAULT true,
  min_advance_days INTEGER DEFAULT 7,
  max_advance_days INTEGER DEFAULT 365,
  default_price DECIMAL(10, 2),
  currency TEXT DEFAULT 'EUR',
  equipment TEXT,
  technical_rider TEXT,
  opening_hours TEXT,
  curfew TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venues_user_id ON venues(user_id);
CREATE INDEX IF NOT EXISTS idx_venues_booking_enabled ON venues(booking_enabled) WHERE booking_enabled = true;

-- Tabela de disponibilidade de venues
CREATE TABLE IF NOT EXISTS venue_availability (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  price DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(venue_id, date)
);

CREATE INDEX IF NOT EXISTS idx_availability_venue_date ON venue_availability(venue_id, date);
CREATE INDEX IF NOT EXISTS idx_availability_status ON venue_availability(status) WHERE status = 'available';

-- Tabela de bookings (reservas de venues)
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  artist_id TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  artist_email TEXT,
  artist_phone TEXT,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_price DECIMAL(10, 2),
  final_price DECIMAL(10, 2),
  currency TEXT DEFAULT 'EUR',
  event_name TEXT,
  event_type TEXT,
  expected_attendance INTEGER,
  equipment_needs TEXT,
  special_requests TEXT,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  payment_status TEXT,
  paid_at TIMESTAMPTZ,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_venue_id ON bookings(venue_id);
CREATE INDEX IF NOT EXISTS idx_bookings_artist_id ON bookings(artist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Tabela de eventos completos
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  artist_id TEXT NOT NULL,
  venue_id TEXT NOT NULL REFERENCES venues(id),
  booking_id TEXT REFERENCES bookings(id),
  name TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  event_type TEXT,
  genre TEXT,
  min_age INTEGER,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_artist_id ON events(artist_id);
CREATE INDEX IF NOT EXISTS idx_events_venue_id ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- Tabela de lineup do evento
CREATE TABLE IF NOT EXISTS event_lineup (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  artist_name TEXT NOT NULL,
  start_time TIME,
  duration INTEGER,
  order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lineup_event_id ON event_lineup(event_id);

-- Tabela de prestadores de serviços
CREATE TABLE IF NOT EXISTS service_providers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  photos TEXT[],
  pricing_type TEXT,
  base_price DECIMAL(10, 2),
  currency TEXT DEFAULT 'EUR',
  rating DECIMAL(3, 2),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_providers_category ON service_providers(category);
CREATE INDEX IF NOT EXISTS idx_service_providers_verified ON service_providers(verified) WHERE verified = true;

-- Tabela de contratações de serviços
CREATE TABLE IF NOT EXISTS service_bookings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL REFERENCES service_providers(id),
  service_type TEXT NOT NULL,
  date DATE NOT NULL,
  duration INTEGER,
  price DECIMAL(10, 2),
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_bookings_event_id ON service_bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_provider_id ON service_bookings(provider_id);

-- Tabela de tickets (configuração de bilhetes)
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  sold INTEGER DEFAULT 0,
  sales_start TIMESTAMPTZ,
  sales_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);

-- Tabela de vendas de bilhetes
CREATE TABLE IF NOT EXISTS ticket_sales (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ticket_id TEXT NOT NULL REFERENCES tickets(id),
  event_id TEXT NOT NULL REFERENCES events(id),
  buyer_email TEXT NOT NULL,
  buyer_name TEXT,
  quantity INTEGER NOT NULL,
  total_amount DECIMAL(10, 2),
  stripe_payment_intent_id TEXT,
  qr_code TEXT,
  validated BOOLEAN DEFAULT false,
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_sales_ticket_id ON ticket_sales(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_sales_event_id ON ticket_sales(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_sales_qr_code ON ticket_sales(qr_code);

-- ============================================
-- TABELAS DE SPLIT DE PAGAMENTOS
-- ============================================

-- Tabela de staff do evento
CREATE TABLE IF NOT EXISTS event_staff (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT,
  invitation_token TEXT UNIQUE,
  email TEXT,
  name TEXT,
  role TEXT NOT NULL,
  split_type TEXT NOT NULL,
  split_value DECIMAL(10, 2) NOT NULL,
  bank_account_setup BOOLEAN DEFAULT false,
  bank_iban TEXT,
  bank_swift TEXT,
  bank_account_name TEXT,
  stripe_connect_account_id TEXT,
  status TEXT DEFAULT 'invited',
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_staff_event_id ON event_staff(event_id);
CREATE INDEX IF NOT EXISTS idx_event_staff_user_id ON event_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_event_staff_token ON event_staff(invitation_token);
CREATE INDEX IF NOT EXISTS idx_event_staff_status ON event_staff(status);

-- Tabela de splits de pagamento
CREATE TABLE IF NOT EXISTS payment_splits (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  total_revenue DECIMAL(10, 2),
  platform_fee DECIMAL(10, 2),
  venue_cost DECIMAL(10, 2),
  services_cost DECIMAL(10, 2),
  net_revenue DECIMAL(10, 2),
  split_status TEXT DEFAULT 'pending',
  calculated_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_splits_event_id ON payment_splits(event_id);
CREATE INDEX IF NOT EXISTS idx_payment_splits_status ON payment_splits(split_status);

-- Tabela de payouts individuais
CREATE TABLE IF NOT EXISTS split_payouts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  payment_split_id TEXT NOT NULL REFERENCES payment_splits(id) ON DELETE CASCADE,
  staff_id TEXT NOT NULL REFERENCES event_staff(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  stripe_transfer_id TEXT,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_split_payouts_split_id ON split_payouts(payment_split_id);
CREATE INDEX IF NOT EXISTS idx_split_payouts_staff_id ON split_payouts(staff_id);
CREATE INDEX IF NOT EXISTS idx_split_payouts_status ON split_payouts(status);
CREATE INDEX IF NOT EXISTS idx_split_payouts_stripe_id ON split_payouts(stripe_transfer_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_singles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_lineup ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_payouts ENABLE ROW LEVEL SECURITY;

-- Políticas para projects (mantidas)
CREATE POLICY "Users can read their own projects"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (true);

-- Políticas para public_singles (mantidas)
CREATE POLICY "Anyone can read public singles"
  ON public_singles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert public singles"
  ON public_singles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update public singles"
  ON public_singles FOR UPDATE
  TO authenticated
  USING (true);

-- Políticas para public_projects (mantidas)
CREATE POLICY "Anyone can read public projects"
  ON public_projects FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "Authenticated users can insert public projects"
  ON public_projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update public projects"
  ON public_projects FOR UPDATE
  TO authenticated
  USING (true);

-- Políticas para public_events (mantidas)
CREATE POLICY "Anyone can read public events"
  ON public_events FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "Authenticated users can insert public events"
  ON public_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update public events"
  ON public_events FOR UPDATE
  TO authenticated
  USING (true);

-- Políticas para venues
CREATE POLICY "Venues are publicly readable"
  ON venues FOR SELECT
  USING (booking_enabled = true);

CREATE POLICY "Users can manage their own venues"
  ON venues FOR ALL
  USING (true);

-- Políticas para availability
CREATE POLICY "Availability is publicly readable"
  ON venue_availability FOR SELECT
  USING (true);

CREATE POLICY "Venue owners can manage their availability"
  ON venue_availability FOR ALL
  USING (true);

-- Políticas para bookings
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (true);

CREATE POLICY "Artists can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Venue owners can update bookings"
  ON bookings FOR UPDATE
  USING (true);

-- Políticas para events
CREATE POLICY "Events are publicly readable"
  ON events FOR SELECT
  USING (status IN ('published', 'live'));

CREATE POLICY "Users can manage their own events"
  ON events FOR ALL
  USING (true);

-- Políticas para event_staff
CREATE POLICY "Users can view staff of their events"
  ON event_staff FOR SELECT
  USING (true);

CREATE POLICY "Event owners can manage staff"
  ON event_staff FOR ALL
  USING (true);

-- Políticas para payment_splits
CREATE POLICY "Users can view splits of their events"
  ON payment_splits FOR SELECT
  USING (true);

-- Políticas para split_payouts
CREATE POLICY "Users can view their own payouts"
  ON split_payouts FOR SELECT
  USING (true);

-- Políticas para tickets e ticket_sales (públicas para leitura)
CREATE POLICY "Tickets are publicly readable"
  ON tickets FOR SELECT
  USING (true);

CREATE POLICY "Ticket sales are readable by event owners"
  ON ticket_sales FOR SELECT
  USING (true);

CREATE POLICY "Anyone can purchase tickets"
  ON ticket_sales FOR INSERT
  WITH CHECK (true);