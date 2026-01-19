// Lightweight IndexedDB helpers for Artist Platforms. Uses a dedicated DB to avoid version conflicts.
export type ArtistPlatform = {
  id: string;
  name: string;
  url: string;
  category?: string; // "portugal", "international", "booking", "festival", etc.
  description?: string;
  registrationUrl?: string; // URL específica para inscrição
  requirements?: string; // Requisitos para inscrição
  notes?: string;
  isActive?: boolean; // Se a plataforma está ativa/em uso
  lastChecked?: string; // ISO date - última vez que foi verificada
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

const DB_NAME = 'ArtistPlatformsDB';
const STORE_NAME = 'platforms';

const initializeDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      let store: IDBObjectStore;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      } else {
        store = (request.transaction as IDBTransaction).objectStore(STORE_NAME);
      }
      const idxNames = Array.from(store.indexNames as unknown as string[]);
      if (!idxNames.includes('name')) store.createIndex('name', 'name', { unique: false });
      if (!idxNames.includes('category')) store.createIndex('category', 'category', { unique: false });
      if (!idxNames.includes('isActive')) store.createIndex('isActive', 'isActive', { unique: false });
    };

    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
  });
};

export const addPlatform = async (partial: Omit<ArtistPlatform, 'id'|'createdAt'|'updatedAt'> & { id?: string }) => {
  const now = new Date().toISOString();
  const platform: ArtistPlatform = {
    id: partial.id || `platform-${Date.now()}`,
    name: partial.name?.trim() || 'Sem nome',
    url: partial.url?.trim() || '',
    category: partial.category?.trim(),
    description: partial.description?.trim(),
    registrationUrl: partial.registrationUrl?.trim(),
    requirements: partial.requirements?.trim(),
    notes: partial.notes?.trim(),
    isActive: partial.isActive !== undefined ? partial.isActive : true,
    lastChecked: partial.lastChecked,
    createdAt: now,
    updatedAt: now,
  };

  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const req = store.put(platform);
  return new Promise<string>((resolve, reject) => {
    req.onsuccess = () => resolve(platform.id);
    req.onerror = (e) => reject((e.target as IDBRequest).error);
  });
};

export const updatePlatform = async (id: string, updates: Partial<ArtistPlatform>) => {
  const existing = await getPlatform(id);
  if (!existing) throw new Error('Plataforma não encontrada');
  const merged: ArtistPlatform = { ...existing, ...updates, id, updatedAt: new Date().toISOString() };
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const req = store.put(merged);
  return new Promise<boolean>((resolve, reject) => {
    req.onsuccess = () => resolve(true);
    req.onerror = (e) => reject((e.target as IDBRequest).error);
  });
};

export const getPlatform = async (id: string) => {
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const req = store.get(id);
  return new Promise<ArtistPlatform | undefined>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result as ArtistPlatform | undefined);
    req.onerror = (e) => reject((e.target as IDBRequest).error);
  });
};

export const getAllPlatforms = async (): Promise<ArtistPlatform[]> => {
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const req = store.getAll();
  return new Promise<ArtistPlatform[]>((resolve, reject) => {
    req.onsuccess = () => resolve((req.result as ArtistPlatform[]) || []);
    req.onerror = (e) => reject((e.target as IDBRequest).error);
  });
};

export const deletePlatform = async (id: string) => {
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const req = store.delete(id);
  return new Promise<boolean>((resolve, reject) => {
    req.onsuccess = () => resolve(true);
    req.onerror = (e) => reject((e.target as IDBRequest).error);
  });
};

export const searchPlatforms = async (q: string): Promise<ArtistPlatform[]> => {
  const all = await getAllPlatforms();
  const term = q.trim().toLowerCase();
  if (!term) return all;
  return all.filter(p =>
    p.name.toLowerCase().includes(term) ||
    (p.url?.toLowerCase().includes(term) ?? false) ||
    (p.category?.toLowerCase().includes(term) ?? false) ||
    (p.description?.toLowerCase().includes(term) ?? false) ||
    (p.notes?.toLowerCase().includes(term) ?? false)
  );
};

// Initialize database with default platforms
export const initializeDefaultPlatforms = async () => {
  const existing = await getAllPlatforms();
  if (existing.length > 0) return; // Already initialized

  const defaultPlatforms: Array<Partial<ArtistPlatform> & { id?: string }> = [
    {
      id: 'portal-artistas',
      name: 'Portal de Artistas',
      url: 'https://portaldeartistas.pt/pesquisa/eventos',
      category: 'portugal',
      description: 'Plataforma portuguesa para artistas se registrarem e serem contactados para eventos',
      registrationUrl: 'https://portaldeartistas.pt',
      isActive: true,
    },
    {
      id: 'bandsintown',
      name: 'Bandsintown',
      url: 'https://bandsintown.com',
      category: 'international',
      description: 'Plataforma internacional para artistas se registrarem e gerirem concertos',
      registrationUrl: 'https://artists.bandsintown.com',
      isActive: true,
    },
    {
      id: 'songkick',
      name: 'Songkick',
      url: 'https://www.songkick.com',
      category: 'international',
      description: 'Plataforma para descobrir e gerir concertos',
      registrationUrl: 'https://www.songkick.com/artists/new',
      isActive: true,
    },
    {
      id: 'reverbnation',
      name: 'ReverbNation',
      url: 'https://www.reverbnation.com',
      category: 'international',
      description: 'Plataforma para artistas se promoverem e encontrarem oportunidades',
      isActive: true,
    },
  ];

  // Add all default platforms
  for (const p of defaultPlatforms) {
    try {
      await addPlatform(p);
    } catch (error) {
      console.warn(`Failed to add default platform ${p.name}:`, error);
    }
  }
};







