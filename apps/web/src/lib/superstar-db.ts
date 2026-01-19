import { openDB as idbOpenDB, DBSchema } from 'idb';

interface SuperstarDB extends DBSchema {
  beauty: {
    key: string;
    value: {
      id: string;
      name: string;
      category: 'cleanser' | 'moisturizer' | 'serum' | 'sunscreen' | 'mask' | 'other';
      brand: string;
      price?: number;
      rating?: number;
      notes?: string;
      routine?: 'morning' | 'evening' | 'both';
      createdAt: string;
      updatedAt: string;
    };
  };
  fashion: {
    key: string;
    value: {
      id: string;
      category: 'casual' | 'stage' | 'red-carpet' | 'streetwear' | 'formal';
      name: string;
      brand?: string;
      occasion?: string;
      notes?: string;
      inspiration?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  workouts: {
    key: string;
    value: {
      id: string;
      name: string;
      duration: number;
      frequency: string;
      exercises: Array<{
        name: string;
        sets?: number;
        reps?: number;
        duration?: number;
      }>;
      target: 'cardio' | 'strength' | 'flexibility' | 'endurance';
      notes?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  branding: {
    key: string;
    value: {
      id: string;
      type: 'logo' | 'color-palette' | 'typography' | 'imagery' | 'voice' | 'values';
      name: string;
      description: string;
      examples?: string[];
      notes?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  socialMedia: {
    key: string;
    value: {
      id: string;
      platform: 'instagram' | 'tiktok' | 'twitter' | 'youtube' | 'all';
      contentType: 'post' | 'story' | 'reel' | 'video';
      frequency: string;
      bestPractices: string[];
      examples?: string[];
      createdAt: string;
      updatedAt: string;
    };
  };
  rehearsals: {
    key: string;
    value: {
      id: string;
      name: string;
      type: 'vocal' | 'instrumental' | 'full-band' | 'choreography';
      duration: number;
      frequency: string;
      exercises: string[];
      goals: string[];
      createdAt: string;
      updatedAt: string;
    };
  };
  vocal: {
    key: string;
    value: {
      id: string;
      name: string;
      type: 'warm-up' | 'technique' | 'song-practice';
      description: string;
      duration: number;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      notes?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  instruments: {
    key: string;
    value: {
      id: string;
      name: string;
      type: 'piano' | 'guitar' | 'drums' | 'bass' | 'strings' | 'brass' | 'other';
      skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional';
      practiceSchedule?: string;
      notes?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

const DB_NAME = 'SuperstarDB';
const VERSION = 11;

const initializeSuperstarDB = async () => {
  try {
    return await idbOpenDB<SuperstarDB>(DB_NAME, VERSION, {
      upgrade(db) {
        ['beauty', 'fashion', 'workouts', 'branding', 'socialMedia', 'rehearsals', 'vocal', 'instruments'].forEach(store => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'id' });
          }
        });
      },
      blocked() {
        console.warn('SuperstarDB está bloqueado por outra aba');
      },
    });
  } catch (error: any) {
    if (error.name === 'VersionError') {
      try {
        const db = await idbOpenDB<SuperstarDB>(DB_NAME);
        await db.close();
        return await idbOpenDB<SuperstarDB>(DB_NAME, VERSION + 1, {
          upgrade(db) {
            ['beauty', 'fashion', 'workouts', 'branding', 'socialMedia', 'rehearsals', 'vocal', 'instruments'].forEach(store => {
              if (!db.objectStoreNames.contains(store)) {
                db.createObjectStore(store, { keyPath: 'id' });
              }
            });
          },
        });
      } catch (retryError) {
        console.error('Erro ao tentar recuperar SuperstarDB:', retryError);
        throw retryError;
      }
    }
    throw error;
  }
};

const createCRUD = <T extends keyof SuperstarDB>(storeName: T) => {
  return {
    save: async (item: Omit<SuperstarDB[T]['value'], 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
      const db = await initializeSuperstarDB();
      const now = new Date().toISOString();
      const fullItem = {
        ...item,
        id: item.id || `${storeName}-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      } as SuperstarDB[T]['value'];
      await db.put(storeName, fullItem);
      return fullItem;
    },
    getAll: async () => {
      const db = await initializeSuperstarDB();
      return db.getAll(storeName);
    },
    get: async (id: string) => {
      const db = await initializeSuperstarDB();
      return db.get(storeName, id);
    },
    delete: async (id: string) => {
      const db = await initializeSuperstarDB();
      return db.delete(storeName, id);
    },
  };
};

export const beautyProducts = createCRUD('beauty');
export const fashionItems = createCRUD('fashion');
export const workoutPrograms = createCRUD('workouts');
export const brandingElements = createCRUD('branding');
export const socialMediaStrategies = createCRUD('socialMedia');
export const rehearsalSchedules = createCRUD('rehearsals');
export const vocalExercises = createCRUD('vocal');
export const instruments = createCRUD('instruments');




