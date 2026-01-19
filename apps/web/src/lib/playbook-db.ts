import { openDB as idbOpenDB, DBSchema } from 'idb';

export interface PlaybookDB extends DBSchema {
  gear: {
    key: string;
    value: {
      id: string;
      category: string; // Permite categorias customizadas
      name: string;
      brand?: string;
      model?: string;
      alternatives?: string[];
      notes?: string;
      links?: { label: string; url: string }[];
      createdAt: string;
      updatedAt: string;
    };
  };
  customCategories: {
    key: string;
    value: {
      id: string;
      name: string;
      label: string; // Nome amigável para exibição
      icon?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  pianoVideos: {
    key: string;
    value: {
      id: string;
      title: string;
      url: string;
      thumbnail?: string;
      duration?: string;
      notes?: string;
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
      tags?: string[];
      createdAt: string;
      updatedAt: string;
    };
  };
  drumKits: {
    key: string;
    value: {
      id: string;
      name: string;
      type: string;
      legitimateSources: string;
      searchQuery: string;
      notes: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  vstSynths: {
    key: string;
    value: {
      id: string;
      name: string;
      manufacturer: string;
      version?: string;
      category: 'synth' | 'sampler' | 'rompler' | 'other';
      legitimateSources: string;
      searchQuery: string;
      downloadUrl?: string;
      notes?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  software: {
    key: string;
    value: {
      id: string;
      name: string;
      type: 'video-editing' | 'graphic-design' | 'audio-editing' | 'other';
      manufacturer: string;
      version?: string;
      legitimateSources: string;
      searchQuery: string;
      downloadUrl?: string;
      licenseKey?: string;
      notes?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  flStudioPresets: {
    key: string;
    value: {
      id: string;
      name: string;
      type: 'mixer' | 'vocal' | 'effect' | 'master';
      plugin?: string;
      description?: string;
      filePath?: string;
      downloadUrl?: string;
      notes?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  flStudioPatterns: {
    key: string;
    value: {
      id: string;
      name: string;
      type: '808' | 'kick' | 'perc' | 'rim' | 'sfx' | 'clap' | 'snare' | 'open-hat' | 'closed-hat' | 'other';
      filePath?: string;
      downloadUrl?: string;
      bpm?: number;
      key?: string;
      notes?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  templates: {
    key: string;
    value: {
      id: string;
      name: string;
      type: 'uad-luna' | 'fl-studio' | 'other';
      fileName: string;
      fileBlob?: Blob;
      fileSize?: number;
      description?: string;
      tags?: string[];
      notes?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  sauceWebsites: {
    key: string;
    value: {
      id: string;
      name: string;
      url: string;
      category: 'download' | 'tutorial' | 'community' | 'marketplace' | 'other';
      description?: string;
      verified: boolean;
      lastChecked?: string;
      notes?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  telegramGroups: {
    key: string;
    value: {
      id: string;
      name: string;
      inviteLink: string;
      category: 'downloads' | 'tutorials' | 'community' | 'marketplace' | 'other';
      description?: string;
      memberCount?: number;
      verified: boolean;
      notes?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  passwords: {
    key: string;
    value: {
      id: string;
      service: string;
      username: string;
      email?: string;
      password: string; // Será armazenado localmente, nunca enviado ao servidor
      category: 'social-media' | 'distrokid' | 'music-platform' | 'email' | 'studio' | 'other';
      url?: string;
      notes?: string;
      twoFactorEnabled?: boolean;
      twoFactorSecret?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  interviewGuides: {
    key: string;
    value: {
      id: string;
      title: string;
      videoUrl?: string;
      content: string; // Texto livre (markdown/nota) sobre como conduzir entrevistas
      createdAt: string;
      updatedAt: string;
    };
  };
  lifeKitLinks: {
    key: string;
    value: {
      id: string;
      name: string;
      url: string;
      category:
        | "payments-security"
        | "privacy"
        | "vpn"
        | "password-manager"
        | "2fa"
        | "email"
        | "backup"
        | "os"
        | "comms"
        | "hardware"
        | "other";
      priority: "critical" | "high" | "normal";
      description?: string;
      notes?: string;
      tags?: string[];
      createdAt: string;
      updatedAt: string;
    };
  };
  videoQuotes: {
    key: string;
    value: {
      id: string;
      quote: string;
      author?: string;
      category?: string;
      tags?: string[];
      notes?: string;
      isFavorite?: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
}

const DB_NAME = 'PlaybookDB';
const VERSION = 16; // Incrementado para adicionar Video Quotes

const initializePlaybookDB = async () => {
  try {
    return await idbOpenDB<PlaybookDB>(DB_NAME, VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('gear')) {
          db.createObjectStore('gear', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('pianoVideos')) {
          db.createObjectStore('pianoVideos', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('drumKits')) {
          db.createObjectStore('drumKits', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('customCategories')) {
          db.createObjectStore('customCategories', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('vstSynths')) {
          db.createObjectStore('vstSynths', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('software')) {
          db.createObjectStore('software', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('flStudioPresets')) {
          db.createObjectStore('flStudioPresets', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('flStudioPatterns')) {
          db.createObjectStore('flStudioPatterns', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('templates')) {
          const templateStore = db.createObjectStore('templates', { keyPath: 'id' });
          templateStore.createIndex('type', 'type', { unique: false });
        }
        if (!db.objectStoreNames.contains('sauceWebsites')) {
          db.createObjectStore('sauceWebsites', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('telegramGroups')) {
          db.createObjectStore('telegramGroups', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('passwords')) {
          const passwordStore = db.createObjectStore('passwords', { keyPath: 'id' });
          passwordStore.createIndex('category', 'category', { unique: false });
        }
        if (!db.objectStoreNames.contains('interviewGuides')) {
          db.createObjectStore('interviewGuides', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('lifeKitLinks')) {
          const store = db.createObjectStore('lifeKitLinks', { keyPath: 'id' });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('priority', 'priority', { unique: false });
        }
        if (!db.objectStoreNames.contains('videoQuotes')) {
          const store = db.createObjectStore('videoQuotes', { keyPath: 'id' });
          store.createIndex('author', 'author', { unique: false });
          store.createIndex('category', 'category', { unique: false });
        }
      },
      blocked() {
        console.warn('PlaybookDB está bloqueado por outra aba');
      },
    });
  } catch (error: any) {
    if (error.name === 'VersionError') {
      // Se a versão armazenada é maior, tenta abrir sem especificar versão
      try {
        const db = await idbOpenDB<PlaybookDB>(DB_NAME);
        await db.close();
        // Recria com versão mais alta
        return await idbOpenDB<PlaybookDB>(DB_NAME, VERSION + 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains('gear')) {
              db.createObjectStore('gear', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('pianoVideos')) {
              db.createObjectStore('pianoVideos', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('drumKits')) {
              db.createObjectStore('drumKits', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('customCategories')) {
              db.createObjectStore('customCategories', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('vstSynths')) {
              db.createObjectStore('vstSynths', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('software')) {
              db.createObjectStore('software', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('flStudioPresets')) {
              db.createObjectStore('flStudioPresets', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('flStudioPatterns')) {
              db.createObjectStore('flStudioPatterns', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('templates')) {
              const templateStore = db.createObjectStore('templates', { keyPath: 'id' });
              templateStore.createIndex('type', 'type', { unique: false });
            }
            if (!db.objectStoreNames.contains('sauceWebsites')) {
              db.createObjectStore('sauceWebsites', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('telegramGroups')) {
              db.createObjectStore('telegramGroups', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('passwords')) {
              const passwordStore = db.createObjectStore('passwords', { keyPath: 'id' });
              passwordStore.createIndex('category', 'category', { unique: false });
            }
            if (!db.objectStoreNames.contains('interviewGuides')) {
              db.createObjectStore('interviewGuides', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('lifeKitLinks')) {
              const store = db.createObjectStore('lifeKitLinks', { keyPath: 'id' });
              store.createIndex('category', 'category', { unique: false });
              store.createIndex('priority', 'priority', { unique: false });
            }
            if (!db.objectStoreNames.contains('videoQuotes')) {
              const store = db.createObjectStore('videoQuotes', { keyPath: 'id' });
              store.createIndex('author', 'author', { unique: false });
              store.createIndex('category', 'category', { unique: false });
            }
          },
        });
      } catch (retryError) {
        console.error('Erro ao tentar recuperar PlaybookDB:', retryError);
        throw retryError;
      }
    }
    throw error;
  }
};

// Gear CRUD
export const saveGearItem = async (item: Omit<PlaybookDB['gear']['value'], 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
  const db = await initializePlaybookDB();
  const now = new Date().toISOString();
  const gearItem: PlaybookDB['gear']['value'] = {
    ...item,
    id: item.id || `gear-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('gear', gearItem);
  return gearItem;
};

export const getAllGearItems = async () => {
  const db = await initializePlaybookDB();
  return db.getAll('gear');
};

export const getGearItem = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.get('gear', id);
};

export const deleteGearItem = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.delete('gear', id);
};

// Piano Videos CRUD
export const savePianoVideo = async (video: Omit<PlaybookDB['pianoVideos']['value'], 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
  const db = await initializePlaybookDB();
  const now = new Date().toISOString();
  const pianoVideo: PlaybookDB['pianoVideos']['value'] = {
    ...video,
    id: video.id || `piano-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('pianoVideos', pianoVideo);
  return pianoVideo;
};

export const getAllPianoVideos = async () => {
  const db = await initializePlaybookDB();
  return db.getAll('pianoVideos');
};

export const getPianoVideo = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.get('pianoVideos', id);
};

export const deletePianoVideo = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.delete('pianoVideos', id);
};

// Drum Kits CRUD
export const saveDrumKit = async (kit: Omit<PlaybookDB['drumKits']['value'], 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
  const db = await initializePlaybookDB();
  const now = new Date().toISOString();
  const drumKit: PlaybookDB['drumKits']['value'] = {
    ...kit,
    id: kit.id || `drumkit-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('drumKits', drumKit);
  return drumKit;
};

export const getAllDrumKits = async () => {
  const db = await initializePlaybookDB();
  return db.getAll('drumKits');
};

export const getDrumKit = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.get('drumKits', id);
};

export const deleteDrumKit = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.delete('drumKits', id);
};

// Custom Categories CRUD
export const saveCustomCategory = async (category: Omit<PlaybookDB['customCategories']['value'], 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
  const db = await initializePlaybookDB();
  const now = new Date().toISOString();
  const customCategory: PlaybookDB['customCategories']['value'] = {
    ...category,
    id: category.id || `category-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('customCategories', customCategory);
  return customCategory;
};

export const getAllCustomCategories = async () => {
  const db = await initializePlaybookDB();
  return db.getAll('customCategories');
};

export const getCustomCategory = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.get('customCategories', id);
};

export const deleteCustomCategory = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.delete('customCategories', id);
};

// VST Synths CRUD
export const saveVstSynth = async (vst: Omit<PlaybookDB['vstSynths']['value'], 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
  const db = await initializePlaybookDB();
  const now = new Date().toISOString();
  const vstSynth: PlaybookDB['vstSynths']['value'] = {
    ...vst,
    id: vst.id || `vst-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('vstSynths', vstSynth);
  return vstSynth;
};

export const getAllVstSynths = async () => {
  const db = await initializePlaybookDB();
  return db.getAll('vstSynths');
};

export const getVstSynth = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.get('vstSynths', id);
};

export const deleteVstSynth = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.delete('vstSynths', id);
};

// Software CRUD
export const saveSoftware = async (software: Omit<PlaybookDB['software']['value'], 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
  const db = await initializePlaybookDB();
  const now = new Date().toISOString();
  const softwareItem: PlaybookDB['software']['value'] = {
    ...software,
    id: software.id || `software-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('software', softwareItem);
  return softwareItem;
};

export const getAllSoftware = async () => {
  const db = await initializePlaybookDB();
  return db.getAll('software');
};

export const getSoftware = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.get('software', id);
};

export const deleteSoftware = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.delete('software', id);
};

// FL Studio Presets CRUD
export const saveFlStudioPreset = async (preset: Omit<PlaybookDB['flStudioPresets']['value'], 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
  const db = await initializePlaybookDB();
  const now = new Date().toISOString();
  const presetItem: PlaybookDB['flStudioPresets']['value'] = {
    ...preset,
    id: preset.id || `preset-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('flStudioPresets', presetItem);
  return presetItem;
};

export const getAllFlStudioPresets = async () => {
  const db = await initializePlaybookDB();
  return db.getAll('flStudioPresets');
};

export const getFlStudioPreset = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.get('flStudioPresets', id);
};

export const deleteFlStudioPreset = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.delete('flStudioPresets', id);
};

// FL Studio Patterns CRUD
export const saveFlStudioPattern = async (pattern: Omit<PlaybookDB['flStudioPatterns']['value'], 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
  const db = await initializePlaybookDB();
  const now = new Date().toISOString();
  const patternItem: PlaybookDB['flStudioPatterns']['value'] = {
    ...pattern,
    id: pattern.id || `pattern-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('flStudioPatterns', patternItem);
  return patternItem;
};

export const getAllFlStudioPatterns = async () => {
  const db = await initializePlaybookDB();
  return db.getAll('flStudioPatterns');
};

export const getFlStudioPattern = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.get('flStudioPatterns', id);
};

export const deleteFlStudioPattern = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.delete('flStudioPatterns', id);
};

// Templates CRUD
export const saveTemplate = async (template: Omit<PlaybookDB['templates']['value'], 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
  const db = await initializePlaybookDB();
  const now = new Date().toISOString();
  const templateItem: PlaybookDB['templates']['value'] = {
    ...template,
    id: template.id || `template-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('templates', templateItem);
  return templateItem;
};

export const getAllTemplates = async () => {
  const db = await initializePlaybookDB();
  return db.getAll('templates');
};

export const getTemplate = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.get('templates', id);
};

export const deleteTemplate = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.delete('templates', id);
};

// Sauce Websites CRUD
export const saveSauceWebsite = async (website: Omit<PlaybookDB['sauceWebsites']['value'], 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
  const db = await initializePlaybookDB();
  const now = new Date().toISOString();
  const websiteItem: PlaybookDB['sauceWebsites']['value'] = {
    ...website,
    id: website.id || `website-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('sauceWebsites', websiteItem);
  return websiteItem;
};

export const getAllSauceWebsites = async () => {
  const db = await initializePlaybookDB();
  return db.getAll('sauceWebsites');
};

export const getSauceWebsite = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.get('sauceWebsites', id);
};

export const deleteSauceWebsite = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.delete('sauceWebsites', id);
};

// Telegram Groups CRUD
export const saveTelegramGroup = async (group: Omit<PlaybookDB['telegramGroups']['value'], 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
  const db = await initializePlaybookDB();
  const now = new Date().toISOString();
  const groupItem: PlaybookDB['telegramGroups']['value'] = {
    ...group,
    id: group.id || `telegram-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('telegramGroups', groupItem);
  return groupItem;
};

export const getAllTelegramGroups = async () => {
  const db = await initializePlaybookDB();
  return db.getAll('telegramGroups');
};

export const getTelegramGroup = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.get('telegramGroups', id);
};

export const deleteTelegramGroup = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.delete('telegramGroups', id);
};

// Passwords CRUD (PRIVATE - stored locally only)
export const savePassword = async (password: Omit<PlaybookDB['passwords']['value'], 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
  const db = await initializePlaybookDB();
  const now = new Date().toISOString();
  const passwordItem: PlaybookDB['passwords']['value'] = {
    ...password,
    id: password.id || `password-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('passwords', passwordItem);
  return passwordItem;
};

export const getAllPasswords = async () => {
  const db = await initializePlaybookDB();
  return db.getAll('passwords');
};

export const getPassword = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.get('passwords', id);
};

export const deletePassword = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.delete('passwords', id);
};

// Interview Guides CRUD
export const saveInterviewGuide = async (
  guide: Omit<PlaybookDB['interviewGuides']['value'], 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
) => {
  const db = await initializePlaybookDB();
  const now = new Date().toISOString();
  const guideItem: PlaybookDB['interviewGuides']['value'] = {
    ...guide,
    id: guide.id || `interview-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('interviewGuides', guideItem);
  return guideItem;
};

export const getAllInterviewGuides = async () => {
  const db = await initializePlaybookDB();
  return db.getAll('interviewGuides');
};

export const getInterviewGuide = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.get('interviewGuides', id);
};

export const deleteInterviewGuide = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.delete('interviewGuides', id);
};

// Life Kit Links CRUD
export const saveLifeKitLink = async (
  link: Omit<PlaybookDB['lifeKitLinks']['value'], 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
) => {
  const db = await initializePlaybookDB();
  const now = new Date().toISOString();
  const item: PlaybookDB['lifeKitLinks']['value'] = {
    ...link,
    id: link.id || `lifekit-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('lifeKitLinks', item);
  return item;
};

export const getAllLifeKitLinks = async () => {
  const db = await initializePlaybookDB();
  return db.getAll('lifeKitLinks');
};

export const getLifeKitLink = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.get('lifeKitLinks', id);
};

export const deleteLifeKitLink = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.delete('lifeKitLinks', id);
};

// Video Quotes CRUD
export const saveVideoQuote = async (
  quote: Omit<PlaybookDB['videoQuotes']['value'], 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
) => {
  const db = await initializePlaybookDB();
  const now = new Date().toISOString();
  const quoteItem: PlaybookDB['videoQuotes']['value'] = {
    ...quote,
    id: quote.id || `quote-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('videoQuotes', quoteItem);
  return quoteItem;
};

export const getAllVideoQuotes = async () => {
  const db = await initializePlaybookDB();
  return db.getAll('videoQuotes');
};

export const getVideoQuote = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.get('videoQuotes', id);
};

export const deleteVideoQuote = async (id: string) => {
  const db = await initializePlaybookDB();
  return db.delete('videoQuotes', id);
};

// Seed inicial de quotes
export const seedVideoQuotes = async () => {
  const existingQuotes = await getAllVideoQuotes();
  if (existingQuotes.length > 0) {
    return; // Já tem quotes, não precisa popular
  }

  const defaultQuotes: Omit<PlaybookDB['videoQuotes']['value'], 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      quote: "Don't start from the good old things but the bad new ones.",
      author: "Bertolt Brecht",
      category: "Filosofia",
      tags: ["filosofia", "provocação", "crítica social"],
      isFavorite: true,
    },
    {
      quote: "The surest way to work up a crusade in favor of some good cause is to promise people they will have a chance of maltreating someone. To be able to destroy with good conscience, to be able to behave badly and call your bad behavior 'righteous indignation' — this is the height of psychological luxury, the most delicious of moral treats.",
      author: "Aldous Huxley",
      category: "Filosofia",
      tags: ["filosofia", "moral", "psicologia", "crítica social"],
      isFavorite: true,
    },
    {
      quote: "Goethe felt that Kant's ethics, while theoretically sound, had little power to transform a person's character, believing that 'Knowing is not enough; we must apply. Willing is not enough; we must do'",
      author: "Johann Wolfgang von Goethe",
      category: "Filosofia",
      tags: ["filosofia", "ética", "ação", "prática", "Kant", "transformação"],
      isFavorite: true,
    },
    {
      quote: "The purposiveness of organisms is a necessary heuristic judgment, but not a real, causal explanation within nature itself.",
      author: "Immanuel Kant",
      category: "Filosofia",
      tags: ["filosofia", "Kant", "natureza", "organismos", "heuristic", "teleologia", "filosofia da natureza"],
      notes: "Heuristic: involving or enabling discovery or problem-solving through methods such as experimentation, evaluation, and trial and error.",
      isFavorite: true,
    },
    {
      quote: "Lebendiges Anschauen",
      author: "Johann Wolfgang von Goethe",
      category: "Filosofia",
      tags: ["filosofia", "Goethe", "fenomenologia", "percepção", "intuição", "contemplação viva", "método científico"],
      notes: "Lebendiges Anschauen: 'Contemplação viva' ou 'percepção intuitiva'. Conceito central na filosofia de Goethe que enfatiza a observação direta e viva dos fenômenos naturais, em contraste com a análise mecanicista. Refere-se à capacidade de perceber a totalidade orgânica e dinâmica dos fenômenos através de uma intuição cultivada.",
      isFavorite: true,
    },
  ];

  for (const quote of defaultQuotes) {
    await saveVideoQuote(quote);
  }
};




