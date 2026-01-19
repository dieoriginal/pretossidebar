import { openDB as idbOpenDB, DBSchema } from 'idb';

interface IdeologiesDB extends DBSchema {
  ideologies: {
    key: string;
    value: {
      id: string;
      name: string;
      type: 'political' | 'philosophical' | 'artistic' | 'spiritual';
      description: string;
      keyConcepts: string[];
      symbols: Array<{
        id: string;
        name: string;
        meaning: string;
        visualDescription?: string;
        usageInArt?: string;
      }>;
      alignment: number; // -100 a 100
      notes?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  symbols: {
    key: string;
    value: {
      id: string;
      name: string;
      meaning: string;
      visualDescription?: string;
      usageInArt?: string;
      ideologyId?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  artistAlignment: {
    key: string;
    value: {
      id: string;
      ideologyId: string;
      alignment: number; // -100 a 100
      notes?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

const DB_NAME = 'IdeologiesDB';
const VERSION = 12;

const initializeIdeologiesDB = async () => {
  try {
    return await idbOpenDB<IdeologiesDB>(DB_NAME, VERSION, {
      upgrade(db) {
        ['ideologies', 'symbols', 'artistAlignment'].forEach(store => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'id' });
          }
        });
      },
      blocked() {
        console.warn('IdeologiesDB está bloqueado por outra aba');
      },
    });
  } catch (error: any) {
    if (error.name === 'VersionError') {
      try {
        const db = await idbOpenDB<IdeologiesDB>(DB_NAME);
        await db.close();
        return await idbOpenDB<IdeologiesDB>(DB_NAME, VERSION + 1, {
          upgrade(db) {
            ['ideologies', 'symbols', 'artistAlignment'].forEach(store => {
              if (!db.objectStoreNames.contains(store)) {
                db.createObjectStore(store, { keyPath: 'id' });
              }
            });
          },
        });
      } catch (retryError) {
        console.error('Erro ao tentar recuperar IdeologiesDB:', retryError);
        throw retryError;
      }
    }
    throw error;
  }
};

const createCRUD = <T extends keyof IdeologiesDB>(storeName: T) => {
  return {
    save: async (item: Omit<IdeologiesDB[T]['value'], 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
      const db = await initializeIdeologiesDB();
      const now = new Date().toISOString();
      const fullItem = {
        ...item,
        id: item.id || `${storeName}-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      } as IdeologiesDB[T]['value'];
      await db.put(storeName, fullItem);
      return fullItem;
    },
    getAll: async () => {
      const db = await initializeIdeologiesDB();
      return db.getAll(storeName);
    },
    get: async (id: string) => {
      const db = await initializeIdeologiesDB();
      return db.get(storeName, id);
    },
    delete: async (id: string) => {
      const db = await initializeIdeologiesDB();
      return db.delete(storeName, id);
    },
  };
};

export const ideologies = createCRUD('ideologies');
export const symbols = createCRUD('symbols');
export const artistAlignments = createCRUD('artistAlignment');




