// Lightweight persistence for the in-app music dashboard (tracks, tasks, lyrics, mixes, artwork)
// Stored in localStorage under the key 'musicDashboard'. This is independent from the existing useProject store.

export type Track = {
  id: string
  title: string
  artist?: string
  durationSec?: number
  path?: string // URL or identifier to a local blob; optional
}

export type Task = {
  id: string
  title: string
  status: 'todo' | 'doing' | 'done'
  priority?: 'low' | 'med' | 'high'
  stepSlug?: string // opcional: associa a tarefa a um passo (ex: 'vestuario')
}

export type Artwork = {
  concept?: string
  palette?: string[]
}

export type LyricsMap = Record<string, string> // key: track id or title -> lyrics

export type MixRef = {
  id: string
  name: string
  src?: string // URL (object URL) if provided by user
  metrics?: {
    crestRatio?: number
    crestDb?: number
    tonal?: { low: number; mid: number; high: number }
  }
}

export type DashboardProject = {
  id: string
  name: string
  kind: 'Single' | 'EP' | 'Mixtape' | 'LP'
  artist?: string
  tracks: Track[]
  tasks: Task[]
  artwork: Artwork
  lyrics: LyricsMap
  mixes: MixRef[]
  updatedAt: string
  featured?: string[]
  producer?: string
  coverUrl?: string
}

export type DashboardState = {
  currentId: string
  projects: Record<string, DashboardProject>
}

const STORAGE_KEY = 'musicDashboard'

function nowIso() { return new Date().toISOString() }

export function loadState(): DashboardState {
  if (typeof window === 'undefined') return { currentId: 'default', projects: {} }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as DashboardState
  } catch {}
  return { currentId: 'default', projects: {} }
}

export function saveState(state: DashboardState) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
}

export function getOrCreateProject(id: string = 'default'): DashboardProject {
  const state = loadState()
  const existing = state.projects[id]
  if (existing) return existing
  const proj: DashboardProject = {
    id,
    name: id === 'default' ? 'Projeto Padrão' : id,
    kind: 'EP',
    artist: 'Die Pretty',
    tracks: [],
    tasks: [],
    artwork: { concept: '', palette: [] },
    lyrics: {},
    mixes: [],
    updatedAt: nowIso(),
    featured: [],
    producer: '',
    coverUrl: '',
  }
  state.projects[id] = proj
  state.currentId = id
  saveState(state)
  return proj
}

export function updateProject(id: string, patch: Partial<DashboardProject>): DashboardProject {
  const state = loadState()
  const curr = state.projects[id] ?? getOrCreateProject(id)
  const next: DashboardProject = { ...curr, ...patch, updatedAt: nowIso() }
  state.projects[id] = next
  saveState(state)
  return next
}

export function listProjects(): DashboardProject[] {
  const state = loadState()
  return Object.values(state.projects)
}

export function setCurrent(id: string) {
  const state = loadState()
  state.currentId = id
  saveState(state)
}

export function getCurrent(): DashboardProject {
  const state = loadState()
  return state.projects[state.currentId] ?? getOrCreateProject(state.currentId)
}

// Helpers for IDs
export function uid(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}
