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
  step_data: {
    key: string; // `${projectId}_${stepKey}`
    value: {
      key: string; // Compound key: `${projectId}_${stepKey}`
      projectId: string;
      stepKey: string;
      data: any;
      lastSaved: string; // ISO timestamp
      syncedToCloud: boolean;
    };
    indexes: {
      projectId: string;
      stepKey: string;
      lastSaved: string;
    };
  };
}

const DB_NAME = 'FazteUmAmboDB';
const STORE_NAME = 'projects';
const STEP_DATA_STORE_NAME = 'step_data';

const initializeDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    // Bump version to 2 to add step_data store
    const request = indexedDB.open(DB_NAME, 2);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      // Add step_data store for auto-save
      if (!db.objectStoreNames.contains(STEP_DATA_STORE_NAME)) {
        // Use compound key: projectId_stepKey
        const stepStore = db.createObjectStore(STEP_DATA_STORE_NAME, { keyPath: 'key' });
        stepStore.createIndex('projectId', 'projectId', { unique: false });
        stepStore.createIndex('stepKey', 'stepKey', { unique: false });
        stepStore.createIndex('lastSaved', 'lastSaved', { unique: false });
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

    // Adicionar userId se não existir (multi-tenancy)
    // O userId será adicionado pelo componente que chama esta função

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

export const deleteProjectFromIndexedDB = async (projectId: string) => {
  try {
    const db = await initializeDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(projectId);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(true);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  } catch (error) {
    console.error('Erro ao apagar projeto do IndexedDB:', error);
    throw error;
  }
};

// Step data storage functions for auto-save
export const saveStepDataToIndexedDB = async (
  projectId: string,
  stepKey: string,
  data: any
) => {
  try {
    const db = await initializeDB();
    const transaction = db.transaction(STEP_DATA_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STEP_DATA_STORE_NAME);
    
    const key = `${projectId}_${stepKey}`;
    const stepData = {
      key, // Compound key
      projectId,
      stepKey,
      data,
      lastSaved: new Date().toISOString(),
      syncedToCloud: false,
    };

    const request = store.put(stepData);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(key);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  } catch (error) {
    console.error('Erro ao salvar step data no IndexedDB:', error);
    throw error;
  }
};

export const loadStepDataFromIndexedDB = async (
  projectId: string,
  stepKey: string
) => {
  try {
    const db = await initializeDB();
    const transaction = db.transaction(STEP_DATA_STORE_NAME, 'readonly');
    const store = transaction.objectStore(STEP_DATA_STORE_NAME);
    const key = `${projectId}_${stepKey}`;
    const request = store.get(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  } catch (error) {
    console.error('Erro ao carregar step data do IndexedDB:', error);
    return null;
  }
};

export const getAllStepDataForProject = async (projectId: string) => {
  try {
    const db = await initializeDB();
    const transaction = db.transaction(STEP_DATA_STORE_NAME, 'readonly');
    const store = transaction.objectStore(STEP_DATA_STORE_NAME);
    const index = store.index('projectId');
    const request = index.getAll(projectId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const all = request.result || [];
        const filtered = all.map((item: any) => ({
          stepKey: item.stepKey,
          data: item.data,
          lastSaved: item.lastSaved,
        }));
        resolve(filtered);
      };
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  } catch (error) {
    console.error('Erro ao carregar todos os step data:', error);
    return [];
  }
};