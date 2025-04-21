import { openDB as idbOpenDB, DBSchema } from 'idb';

interface ProjectDB extends DBSchema {
  projects: {
    key: string;
    value: {
      id: string;
      title: string;
      lastModified: Date;
      data: any;
    };
  };
}

const DB_NAME = 'FazteUmAmboDB';
const STORE_NAME = 'projects';

const initializeDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
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

export const saveProjectToIndexedDB = async (project: any) => {
  try {
    if (!project.id) {
      project.id = `projeto-${Date.now()}`;
    }

    const db = await initializeDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.put(project);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(project.id);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  } catch (error) {
    console.error('Erro ao salvar projeto no IndexedDB:', error);
    throw error;
  }
};

export const loadProjectFromIndexedDB = async (projectId: string) => {
  try {
    const db = await initializeDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.get(projectId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  } catch (error) {
    console.error('Erro ao carregar projeto do IndexedDB:', error);
    throw error;
  }
};

export const getAllProjectsFromIndexedDB = async () => {
  try {
    const db = await initializeDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  } catch (error) {
    console.error('Erro ao carregar todos os projetos do IndexedDB:', error);
    throw error;
  }
}; 