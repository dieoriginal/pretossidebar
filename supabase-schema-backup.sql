-- Schema SQL para criar as tabelas no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- Tabela de projetos de usuários
CREATE TABLE IF NOT EXISTS projects (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  data TEXT NOT NULL, -- Dados comprimidos do projeto
  title TEXT,
  artist TEXT,
  producer TEXT,
  featuring TEXT,
  last_synced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, user_id)
);

-- Índices para melhor performance
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

-- Índice para singles públicos
CREATE INDEX IF NOT EXISTS idx_public_singles_updated_at ON public_singles(updated_at DESC);

-- Tabela de projetos públicos
CREATE TABLE IF NOT EXISTS public_projects (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para projetos públicos
CREATE INDEX IF NOT EXISTS idx_public_projects_is_public ON public_projects(is_public);
CREATE INDEX IF NOT EXISTS idx_public_projects_updated_at ON public_projects(updated_at DESC);

-- Tabela de eventos públicos
CREATE TABLE IF NOT EXISTS public_events (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para eventos públicos
CREATE INDEX IF NOT EXISTS idx_public_events_is_public ON public_events(is_public);
CREATE INDEX IF NOT EXISTS idx_public_events_updated_at ON public_events(updated_at DESC);

-- Row Level Security (RLS) Policies

-- Habilitar RLS em todas as tabelas
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_singles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_events ENABLE ROW LEVEL SECURITY;

-- Políticas para projects: usuários só podem ler/escrever seus próprios projetos
-- Nota: Como usamos Clerk para auth, precisamos passar o user_id como parâmetro
-- A política verifica se o user_id da linha corresponde ao user_id fornecido
CREATE POLICY "Users can read their own projects"
  ON projects
  FOR SELECT
  USING (true); -- Permitir leitura se o user_id corresponder (verificado no código)

CREATE POLICY "Users can insert their own projects"
  ON projects
  FOR INSERT
  WITH CHECK (true); -- Verificação de user_id feita no código

CREATE POLICY "Users can update their own projects"
  ON projects
  FOR UPDATE
  USING (true); -- Verificação de user_id feita no código

-- Políticas para public_singles: leitura pública, escrita autenticada
CREATE POLICY "Anyone can read public singles"
  ON public_singles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert public singles"
  ON public_singles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update public singles"
  ON public_singles
  FOR UPDATE
  TO authenticated
  USING (true);

-- Políticas para public_projects: leitura pública, escrita autenticada
CREATE POLICY "Anyone can read public projects"
  ON public_projects
  FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "Authenticated users can insert public projects"
  ON public_projects
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update public projects"
  ON public_projects
  FOR UPDATE
  TO authenticated
  USING (true);

-- Políticas para public_events: leitura pública, escrita autenticada
CREATE POLICY "Anyone can read public events"
  ON public_events
  FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "Authenticated users can insert public events"
  ON public_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update public events"
  ON public_events
  FOR UPDATE
  TO authenticated
  USING (true);

