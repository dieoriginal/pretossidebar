// Lightweight IndexedDB helpers for Event Producers. Uses a dedicated DB to avoid version conflicts.
export type EventProducer = {
  id: string;
  name: string;
  city?: string;
  country?: string;
  address?: string; // Endereço completo
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
  cae?: string; // Código de Atividade Económica
  
  // Informações específicas de produtores
  producerType?: "individual" | "company" | "collective" | "other"; // Tipo de produtor
  specialties?: string[]; // Especialidades (ex: música eletrónica, rock, jazz, etc.)
  portfolio?: string; // Portfolio/descrição dos eventos produzidos
  experience?: string; // Anos de experiência ou histórico
  
  // Informações técnicas
  equipment?: string; // Equipamento disponível
  technicalRider?: string; // Contacto para envio de rider técnico
  services?: string; // Serviços oferecidos (produção, promoção, booking, etc.)
  
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
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  
  // Colaborações e parcerias
  venuesWorkedWith?: string[]; // IDs de venues com quem já trabalhou
  artistsWorkedWith?: string[]; // Artistas com quem já trabalhou
  eventsProduced?: number; // Número aproximado de eventos produzidos
  
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

const DB_NAME = 'FazteUmAmboProducersDB';
const STORE_NAME = 'producers';

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
      if (!idxNames.includes('city')) store.createIndex('city', 'city', { unique: false });
      if (!idxNames.includes('region')) store.createIndex('region', 'region', { unique: false });
      if (!idxNames.includes('cae')) store.createIndex('cae', 'cae', { unique: false });
      if (!idxNames.includes('producerType')) store.createIndex('producerType', 'producerType', { unique: false });
    };

    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
  });
};

export const addProducer = async (partial: Omit<EventProducer, 'id'|'createdAt'|'updatedAt'> & { id?: string }) => {
  const now = new Date().toISOString();
  const producer: EventProducer = {
    id: partial.id || `producer-${Date.now()}`,
    name: partial.name?.trim() || 'Sem nome',
    city: partial.city?.trim(),
    country: partial.country?.trim(),
    address: partial.address?.trim(),
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
    producerType: partial.producerType,
    specialties: partial.specialties?.filter(Boolean),
    portfolio: partial.portfolio?.trim(),
    experience: partial.experience?.trim(),
    equipment: partial.equipment?.trim(),
    technicalRider: partial.technicalRider?.trim(),
    services: partial.services?.trim(),
    responsibleEntity: partial.responsibleEntity?.trim(),
    nif: partial.nif?.trim(),
    billingConditions: partial.billingConditions?.trim(),
    paymentMethod: partial.paymentMethod?.trim(),
    paymentTerms: partial.paymentTerms?.trim(),
    spaNumber: partial.spaNumber?.trim(),
    reportPolicy: partial.reportPolicy?.trim(),
    pressKitEmail: partial.pressKitEmail?.trim(),
    operationalContact: partial.operationalContact?.trim(),
    socialMedia: partial.socialMedia,
    venuesWorkedWith: partial.venuesWorkedWith?.filter(Boolean),
    artistsWorkedWith: partial.artistsWorkedWith?.filter(Boolean),
    eventsProduced: partial.eventsProduced,
    createdAt: now,
    updatedAt: now,
  };

  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const req = store.put(producer);
  return new Promise<string>((resolve, reject) => {
    req.onsuccess = () => resolve(producer.id);
    req.onerror = (e) => reject((e.target as IDBRequest).error);
  });
};

export const updateProducer = async (id: string, updates: Partial<EventProducer>) => {
  const existing = await getProducer(id);
  if (!existing) throw new Error('Produtor não encontrado');
  const merged: EventProducer = { ...existing, ...updates, id, updatedAt: new Date().toISOString() };
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const req = store.put(merged);
  return new Promise<boolean>((resolve, reject) => {
    req.onsuccess = () => resolve(true);
    req.onerror = (e) => reject((e.target as IDBRequest).error);
  });
};

export const getProducer = async (id: string) => {
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const req = store.get(id);
  return new Promise<EventProducer | undefined>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result as EventProducer | undefined);
    req.onerror = (e) => reject((e.target as IDBRequest).error);
  });
};

export const getAllProducers = async (): Promise<EventProducer[]> => {
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const req = store.getAll();
  return new Promise<EventProducer[]>((resolve, reject) => {
    req.onsuccess = () => resolve((req.result as EventProducer[]) || []);
    req.onerror = (e) => reject((e.target as IDBRequest).error);
  });
};

export const deleteProducer = async (id: string) => {
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const req = store.delete(id);
  return new Promise<boolean>((resolve, reject) => {
    req.onsuccess = () => resolve(true);
    req.onerror = (e) => reject((e.target as IDBRequest).error);
  });
};

export const searchProducers = async (q: string): Promise<EventProducer[]> => {
  const all = await getAllProducers();
  const term = q.trim().toLowerCase();
  if (!term) return all;
  return all.filter(p =>
    p.name.toLowerCase().includes(term) ||
    (p.city?.toLowerCase().includes(term) ?? false) ||
    (p.country?.toLowerCase().includes(term) ?? false) ||
    (p.cae?.toLowerCase().includes(term) ?? false) ||
    (p.notes?.toLowerCase().includes(term) ?? false) ||
    (p.specialties?.some(s => s.toLowerCase().includes(term)) ?? false) ||
    (p.services?.toLowerCase().includes(term) ?? false)
  );
};

// Initialize database with default producers if empty
export const initializeDefaultProducers = async (defaultProducers: Array<Partial<EventProducer> & { id?: string }>) => {
  const existing = await getAllProducers();
  if (existing.length > 0) return; // Already initialized

  // Add all default producers
  for (const p of defaultProducers) {
    try {
      await addProducer(p);
    } catch (error) {
      console.warn(`Failed to add default producer ${p.name}:`, error);
    }
  }
};

// Migrar produtores existentes da gestão de venues
export const migrateProducersFromVenues = async () => {
  try {
    const { getAllVenues } = await import('./venuesDb');
    const venues = await getAllVenues();
    const producers = venues.filter(v => v.entityType === 'event_production');
    
    let migrated = 0;
    for (const venue of producers) {
      try {
        // Verificar se já existe
        const existing = await getProducer(venue.id);
        if (existing) continue;
        
        // Converter venue para producer
        await addProducer({
          id: venue.id,
          name: venue.name,
          city: venue.city,
          country: venue.country,
          address: venue.address,
          contactName: venue.contactName,
          contactEmail: venue.contactEmail,
          contactPhone: venue.contactPhone,
          url: venue.url,
          photoUrl: venue.photoUrl,
          photos: venue.photos,
          region: venue.region,
          lat: venue.lat,
          lng: venue.lng,
          notes: venue.notes,
          cae: venue.cae,
          equipment: venue.equipment,
          technicalRider: venue.technicalRider,
          responsibleEntity: venue.responsibleEntity,
          nif: venue.nif,
          billingConditions: venue.billingConditions,
          paymentMethod: venue.paymentMethod,
          paymentTerms: venue.paymentTerms,
          spaNumber: venue.spaNumber,
          reportPolicy: venue.reportPolicy,
          pressKitEmail: venue.pressKitEmail,
          operationalContact: venue.operationalContact,
        });
        migrated++;
      } catch (error) {
        console.warn(`Erro ao migrar produtor ${venue.name}:`, error);
      }
    }
    
    return { migrated, total: producers.length };
  } catch (error) {
    console.error('Erro ao migrar produtores:', error);
    throw error;
  }
};

