// Lightweight IndexedDB helpers for Venues. Uses a dedicated DB to avoid version conflicts.
export type Venue = {
  id: string;
  name: string;
  city?: string;
  country?: string;
  address?: string; // Endereço completo
  capacity?: number | string; // Pode ser "30-80 (confirmar)"
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  url?: string;
  photoUrl?: string; // legacy single photo
  photos?: string[]; // gallery of photos
  instagramUrl?: string;
  facebookUrl?: string;
  region?: string; // Norte | Centro | Sul | Ilhas | outro
  lat?: number;
  lng?: number;
  notes?: string;
  cae?: string; // Código de Atividade Económica (ex: 90040, 93290, 56302, 93293)

  // Modelo de remuneração
  remunerationModel?: "flat" | "percentage" | "bar_split" | "minimum_guaranteed" | "negotiable" | string;
  agreement?: string; // Descrição do acordo (ex: "70-30", "aluguer fixo", "bar split")

  // Informações técnicas
  equipment?: string; // PA, backline, iluminação, etc.
  technicalRider?: string; // Contacto para envio de rider técnico

  // Horários e logística
  openingHours?: string; // Horários de abertura/fecho
  curfew?: string; // Curfew/licenças
  loadIn?: string; // Janela de load-in
  loadOut?: string; // Janela de load-out
  access?: string; // Acessos (carrinha, elevador)

  // Staff e custos
  doorStaff?: string; // Bilheteira/door staff e custos
  technicalStaff?: string; // Disponibilidade de técnicos e custos

  // Informações fiscais
  responsibleEntity?: string; // Entidade responsável
  nif?: string; // NIF
  billingConditions?: string; // Condições de faturação
  paymentMethod?: string; // Método de pagamento
  paymentTerms?: string; // Prazo de pagamento

  // SPA e registos
  spaNumber?: string; // Nº de registo SPA
  reportPolicy?: string; // Política de report

  // Contactos adicionais
  pressKitEmail?: string; // Email para press-kit/assets
  operationalContact?: string; // Contacto operativo (telefone)

  // Configuração da sala
  roomConfiguration?: string; // Plateia/mesas

  // Tipo de entidade
  entityType?: "venue" | "event_production" | "other"; // Tipo de entidade: venue (espaço físico), event_production (produção de eventos), other (outros)

  createdAt: string; // ISO
  updatedAt: string; // ISO
};

const DB_NAME = 'FazteUmAmboVenuesDB';
const STORE_NAME = 'venues';

const initializeDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    // bump version to 4 to add entityType field
    const request = indexedDB.open(DB_NAME, 4);

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
      if (!idxNames.includes('cae')) store.createIndex('cae', 'cae', { unique: false });
      // Bump version to 3 to add new fields
    };

    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
  });
};

export const addVenue = async (partial: Omit<Venue, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
  const now = new Date().toISOString();
  const venue: Venue = {
    id: partial.id || `venue-${Date.now()}`,
    name: partial.name?.trim() || 'Sem nome',
    city: partial.city?.trim(),
    country: partial.country?.trim(),
    address: partial.address?.trim(),
    capacity: typeof partial.capacity === 'string' ? partial.capacity : (partial.capacity ? Number(partial.capacity) : undefined),
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
    cae: partial.cae?.trim(),
    remunerationModel: partial.remunerationModel,
    agreement: partial.agreement?.trim(),
    equipment: partial.equipment?.trim(),
    technicalRider: partial.technicalRider?.trim(),
    openingHours: partial.openingHours?.trim(),
    curfew: partial.curfew?.trim(),
    loadIn: partial.loadIn?.trim(),
    loadOut: partial.loadOut?.trim(),
    access: partial.access?.trim(),
    doorStaff: partial.doorStaff?.trim(),
    technicalStaff: partial.technicalStaff?.trim(),
    responsibleEntity: partial.responsibleEntity?.trim(),
    nif: partial.nif?.trim(),
    billingConditions: partial.billingConditions?.trim(),
    paymentMethod: partial.paymentMethod?.trim(),
    paymentTerms: partial.paymentTerms?.trim(),
    spaNumber: partial.spaNumber?.trim(),
    reportPolicy: partial.reportPolicy?.trim(),
    pressKitEmail: partial.pressKitEmail?.trim(),
    operationalContact: partial.operationalContact?.trim(),
    roomConfiguration: partial.roomConfiguration?.trim(),
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
    (v.cae?.toLowerCase().includes(term) ?? false) ||
    (v.notes?.toLowerCase().includes(term) ?? false)
  );
};

// Initialize database with default venues if empty
export const initializeDefaultVenues = async (defaultVenues: Array<Omit<Venue, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }>) => {
  const existing = await getAllVenues();
  if (existing.length > 0) return; // Already initialized

  // Add all default venues
  for (const v of defaultVenues) {
    try {
      await addVenue(v);
    } catch (error) {
      console.warn(`Failed to add default venue ${v.name}:`, error);
    }
  }
};
