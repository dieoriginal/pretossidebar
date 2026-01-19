// Database functions for Events (Processo 2 - Concertos)
// Similar to db.ts but specifically for events

const EVENTS_DB_NAME = 'FazteUmAmboDB';
const EVENTS_STORE_NAME = 'events';

interface EventProject {
  id: string;
  title: string;
  eventName: string;
  eventType: string;
  date: string;
  venue: string;
  lastModified: Date;
  data: any; // EventData
}

const initializeEventsDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(EVENTS_DB_NAME, 2); // Version 2 to add events store

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create events store if it doesn't exist
      if (!db.objectStoreNames.contains(EVENTS_STORE_NAME)) {
        const store = db.createObjectStore(EVENTS_STORE_NAME, { keyPath: 'id' });
        store.createIndex('eventName', 'eventName', { unique: false });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('lastModified', 'lastModified', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

export const saveEventToIndexedDB = async (eventData: any) => {
  try {
    if (!eventData.id) {
      eventData.id = `evento-${Date.now()}`;
    }

    const eventProject: EventProject = {
      id: eventData.id,
      title: eventData.overview?.eventName || `Evento ${new Date().toLocaleDateString('pt-PT')}`,
      eventName: eventData.overview?.eventName || '',
      eventType: eventData.overview?.eventType || '',
      date: eventData.overview?.date || '',
      venue: eventData.overview?.venue || '',
      lastModified: new Date(),
      data: eventData,
    };

    const db = await initializeEventsDB();
    const transaction = db.transaction(EVENTS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(EVENTS_STORE_NAME);

    const request = store.put(eventProject);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(eventProject.id);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  } catch (error) {
    console.error('Erro ao salvar evento no IndexedDB:', error);
    throw error;
  }
};

export const loadEventFromIndexedDB = async (eventId: string) => {
  try {
    const db = await initializeEventsDB();
    const transaction = db.transaction(EVENTS_STORE_NAME, 'readonly');
    const store = transaction.objectStore(EVENTS_STORE_NAME);

    const request = store.get(eventId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.data) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  } catch (error) {
    console.error('Erro ao carregar evento do IndexedDB:', error);
    throw error;
  }
};

export const getAllEventsFromIndexedDB = async (): Promise<EventProject[]> => {
  try {
    const db = await initializeEventsDB();
    const transaction = db.transaction(EVENTS_STORE_NAME, 'readonly');
    const store = transaction.objectStore(EVENTS_STORE_NAME);

    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const events = request.result || [];
        // Sort by lastModified descending (most recent first)
        events.sort((a: EventProject, b: EventProject) => 
          new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        );
        resolve(events);
      };
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  } catch (error) {
    console.error('Erro ao carregar todos os eventos do IndexedDB:', error);
    throw error;
  }
};

export const deleteEventFromIndexedDB = async (eventId: string) => {
  try {
    const db = await initializeEventsDB();
    const transaction = db.transaction(EVENTS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(EVENTS_STORE_NAME);
    const request = store.delete(eventId);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(true);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  } catch (error) {
    console.error('Erro ao apagar evento do IndexedDB:', error);
    throw error;
  }
};

