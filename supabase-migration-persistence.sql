-- ============================================
-- MIGRATION: Zero-Loss Persistence + RBAC + Versioning
-- Run this in Supabase SQL Editor (kmwltuanmvjfqusgpsdb)
-- ============================================

-- 1. PROFILES TABLE (linked to Clerk user_id)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,           -- Clerk user_id
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 2. PROJECT MEMBERS (RBAC — who can access which project)
CREATE TABLE IF NOT EXISTS project_members (
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner',  -- 'owner', 'editor', 'viewer'
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);

-- 3. PROJECT VERSIONS (immutable snapshots for restore)
CREATE TABLE IF NOT EXISTS project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES profiles(id),
  data TEXT NOT NULL,                -- compressed project data (same format as projects.data)
  description TEXT,                  -- e.g. "auto-snapshot", "manual save"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_versions_project ON project_versions(project_id, created_at DESC);

-- 4. FILES TABLE (R2 storage references — audio, images)
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES profiles(id),
  storage_key TEXT NOT NULL UNIQUE,   -- R2 object key
  file_name TEXT,                     -- original filename
  content_type TEXT,                  -- e.g. 'audio/webm', 'image/png'
  size_bytes BIGINT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_files_project ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_user ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_key ON files(storage_key);

-- 5. WAL TABLE (Write-Ahead Log for crash-proof saves)
CREATE TABLE IF NOT EXISTS project_wal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  patch JSONB NOT NULL,              -- partial update (diff)
  applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wal_project ON project_wal(project_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_wal_unapplied ON project_wal(applied) WHERE applied = FALSE;

-- 6. Add metadata columns to existing projects table if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='device_info') THEN
    ALTER TABLE projects ADD COLUMN device_info TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='version') THEN
    ALTER TABLE projects ADD COLUMN version INTEGER DEFAULT 1;
  END IF;
END $$;

-- ============================================
-- REAL RLS POLICIES (replace permissive ones)
-- ============================================

-- Drop old permissive policies on projects
DROP POLICY IF EXISTS "Users can read their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;

-- Projects: users can only access their own projects or projects they're a member of
CREATE POLICY "projects_select_own_or_member" ON projects
  FOR SELECT USING (
    user_id = current_setting('app.user_id', true)
    OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = projects.id AND pm.user_id = current_setting('app.user_id', true)
    )
  );

CREATE POLICY "projects_insert_own" ON projects
  FOR INSERT WITH CHECK (
    user_id = current_setting('app.user_id', true)
  );

CREATE POLICY "projects_update_own_or_editor" ON projects
  FOR UPDATE USING (
    user_id = current_setting('app.user_id', true)
    OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = projects.id
        AND pm.user_id = current_setting('app.user_id', true)
        AND pm.role IN ('owner', 'editor')
    )
  );

CREATE POLICY "projects_delete_own" ON projects
  FOR DELETE USING (
    user_id = current_setting('app.user_id', true)
  );

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = current_setting('app.user_id', true));

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (id = current_setting('app.user_id', true));

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = current_setting('app.user_id', true));

-- Project Members RLS
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pm_select_own" ON project_members
  FOR SELECT USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "pm_insert_owner" ON project_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members pm2
      WHERE pm2.project_id = project_members.project_id
        AND pm2.user_id = current_setting('app.user_id', true)
        AND pm2.role = 'owner'
    )
    OR user_id = current_setting('app.user_id', true)
  );

-- Project Versions RLS
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pv_select_own" ON project_versions
  FOR SELECT USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "pv_insert_own" ON project_versions
  FOR INSERT WITH CHECK (user_id = current_setting('app.user_id', true));

-- Files RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "files_select_own" ON files
  FOR SELECT USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "files_insert_own" ON files
  FOR INSERT WITH CHECK (user_id = current_setting('app.user_id', true));

CREATE POLICY "files_delete_own" ON files
  FOR DELETE USING (user_id = current_setting('app.user_id', true));

-- WAL RLS
ALTER TABLE project_wal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wal_select_own" ON project_wal
  FOR SELECT USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "wal_insert_own" ON project_wal
  FOR INSERT WITH CHECK (user_id = current_setting('app.user_id', true));

CREATE POLICY "wal_update_own" ON project_wal
  FOR UPDATE USING (user_id = current_setting('app.user_id', true));

-- ============================================
-- HELPER FUNCTION: compact WAL entries
-- ============================================
CREATE OR REPLACE FUNCTION compact_project_wal(p_project_id TEXT, p_user_id TEXT)
RETURNS void AS $$
BEGIN
  -- Mark all WAL entries as applied
  UPDATE project_wal
  SET applied = TRUE
  WHERE project_id = p_project_id
    AND user_id = p_user_id
    AND applied = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to profiles
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Apply to projects
DROP TRIGGER IF EXISTS projects_updated_at ON projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
