// Lightweight IndexedDB helpers for Venues. Uses a dedicated DB to avoid version conflicts.
export type Venue = {
  id: string;
  name: string;
  city?: string;
  country?: string;
  capacity?: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  url?: string;
  photoUrl?: string; // legacy single photo
  photos?: string[]; // gallery of photos
  region?: string; // Norte | Centro | Sul | Ilhas | outro
  lat?: number;
  lng?: number;
  notes?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

const DB_NAME = 'FazteUmAmboVenuesDB';
const STORE_NAME = 'venues';

const initializeDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    // bump version to 2 to add new indexes (region)
    const request = indexedDB.open(DB_NAME, 2);

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
      if (!idxNames.includes('city')) store.createIndex('city', 'city', { unique: false });
      if (!idxNames.includes('region')) store.createIndex('region', 'region', { unique: false });
    };

    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
  });
};

export const addVenue = async (partial: Omit<Venue, 'id'|'createdAt'|'updatedAt'> & { id?: string }) => {
  const now = new Date().toISOString();
  const venue: Venue = {
    id: partial.id || `venue-${Date.now()}`,
    name: partial.name?.trim() || 'Sem nome',
    city: partial.city?.trim(),
    country: partial.country?.trim(),
    capacity: partial.capacity ? Number(partial.capacity) : undefined,
    contactName: partial.contactName?.trim(),
    contactEmail: partial.contactEmail?.trim(),
    contactPhone: partial.contactPhone?.trim(),
    url: partial.url?.trim(),
    photoUrl: partial.photoUrl?.trim(),
    photos: partial.photos?.filter(Boolean) || (partial.photoUrl ? [partial.photoUrl] : undefined),
    region: partial.region,
    lat: partial.lat,
    lng: partial.lng,
    notes: partial.notes?.trim(),
    createdAt: now,
    updatedAt: now,
  };

  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const req = store.put(venue);
  return new Promise<string>((resolve, reject) => {
    req.onsuccess = () => resolve(venue.id);
    req.onerror = (e) => reject((e.target as IDBRequest).error);
  });
};

export const updateVenue = async (id: string, updates: Partial<Venue>) => {
  const existing = await getVenue(id);
  if (!existing) throw new Error('Venue não encontrado');
  const merged: Venue = { ...existing, ...updates, id, updatedAt: new Date().toISOString() };
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const req = store.put(merged);
  return new Promise<boolean>((resolve, reject) => {
    req.onsuccess = () => resolve(true);
    req.onerror = (e) => reject((e.target as IDBRequest).error);
  });
};

export const getVenue = async (id: string) => {
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const req = store.get(id);
  return new Promise<Venue | undefined>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result as Venue | undefined);
    req.onerror = (e) => reject((e.target as IDBRequest).error);
  });
};

export const getAllVenues = async (): Promise<Venue[]> => {
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const req = store.getAll();
  return new Promise<Venue[]>((resolve, reject) => {
    req.onsuccess = () => resolve((req.result as Venue[]) || []);
    req.onerror = (e) => reject((e.target as IDBRequest).error);
  });
};

export const deleteVenue = async (id: string) => {
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const req = store.delete(id);
  return new Promise<boolean>((resolve, reject) => {
    req.onsuccess = () => resolve(true);
    req.onerror = (e) => reject((e.target as IDBRequest).error);
  });
};

export const searchVenues = async (q: string): Promise<Venue[]> => {
  const all = await getAllVenues();
  const term = q.trim().toLowerCase();
  if (!term) return all;
  return all.filter(v =>
    v.name.toLowerCase().includes(term) ||
    (v.city?.toLowerCase().includes(term) ?? false) ||
    (v.country?.toLowerCase().includes(term) ?? false) ||
    (v.notes?.toLowerCase().includes(term) ?? false)
  );
};
