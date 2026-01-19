/**
 * Sistema de persistência tripla para auto-save
 * IndexedDB → localStorage → Supabase
 */

import {
  saveStepDataToIndexedDB,
  loadStepDataFromIndexedDB,
  getAllStepDataForProject,
} from './db';
import { getCurrentUserId } from './firebase';
import { syncProjectToCloud } from './supabase';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'syncing' | 'synced' | 'error';

const STORAGE_PREFIX = 'autosave_';
const SYNC_DEBOUNCE_MS = 2000; // 2 segundos para sync com Supabase

// Cache de status por projeto
const statusCache = new Map<string, SaveStatus>();

/**
 * Salva dados de um step em todas as camadas
 */
export async function saveStepData(
  stepKey: string,
  data: any,
  projectId: string
): Promise<void> {
  try {
    statusCache.set(projectId, 'saving');

    // 1. IndexedDB (primário, imediato)
    await saveStepDataToIndexedDB(projectId, stepKey, data);

    // 2. localStorage (fallback rápido)
    const storageKey = `${STORAGE_PREFIX}${projectId}_${stepKey}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
      }));
    } catch (e) {
      // localStorage pode estar cheio, ignorar
      console.warn('Erro ao salvar no localStorage:', e);
    }

    statusCache.set(projectId, 'saved');

    // 3. Supabase (background, com debounce)
    scheduleSupabaseSync(projectId);
  } catch (error) {
    console.error('Erro ao salvar step data:', error);
    statusCache.set(projectId, 'error');
    throw error;
  }
}

/**
 * Carrega dados de um step (IndexedDB → localStorage fallback)
 */
export async function loadStepData(
  stepKey: string,
  projectId: string
): Promise<any> {
  try {
    // 1. Tentar IndexedDB primeiro
    const indexedData = await loadStepDataFromIndexedDB(projectId, stepKey);
    if (indexedData !== null) {
      return indexedData;
    }

    // 2. Fallback para localStorage
    const storageKey = `${STORAGE_PREFIX}${projectId}_${stepKey}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.data;
      } catch (e) {
        console.warn('Erro ao parsear localStorage:', e);
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao carregar step data:', error);
    return null;
  }
}

/**
 * Retorna status de salvamento de um projeto
 */
export function getSaveStatus(projectId: string): SaveStatus {
  return statusCache.get(projectId) || 'idle';
}

/**
 * Agenda sincronização com Supabase (com debounce)
 */
let syncTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

function scheduleSupabaseSync(projectId: string) {
  // Cancelar sync anterior se existir
  const existingTimeout = syncTimeouts.get(projectId);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  // Agendar nova sync
  const timeout = setTimeout(async () => {
    try {
      statusCache.set(projectId, 'syncing');
      
      const userId = getCurrentUserId();
      if (!userId) {
        statusCache.set(projectId, 'saved');
        return;
      }

      // Carregar projeto completo do IndexedDB
      const { loadProjectFromIndexedDB } = await import('./db');
      const fullProject = await loadProjectFromIndexedDB(projectId);
      
      // Se não houver projeto completo, criar um com step data
      if (!fullProject) {
        const allStepData = await getAllStepDataForProject(projectId);
        const projectData: Record<string, any> = {};
        for (const step of allStepData) {
          projectData[step.stepKey] = step.data;
        }

        await syncProjectToCloud(userId, {
          id: projectId,
          data: projectData,
        });
      } else {
        // Se houver projeto completo, usar ele (já inclui step data via updateStep)
        await syncProjectToCloud(userId, fullProject);
      }

      statusCache.set(projectId, 'synced');
    } catch (error) {
      console.error('Erro ao sincronizar com Supabase:', error);
      statusCache.set(projectId, 'error');
    } finally {
      syncTimeouts.delete(projectId);
    }
  }, SYNC_DEBOUNCE_MS);

  syncTimeouts.set(projectId, timeout);
}

/**
 * Sincroniza projeto completo com Supabase (sem debounce)
 */
export async function syncToSupabase(
  projectId: string,
  userId?: string
): Promise<void> {
  try {
    statusCache.set(projectId, 'syncing');
    
    const currentUserId = userId || getCurrentUserId();
    if (!currentUserId) {
      throw new Error('Usuário não autenticado');
    }

    // Tentar carregar projeto completo primeiro
    const { loadProjectFromIndexedDB } = await import('./db');
    const fullProject = await loadProjectFromIndexedDB(projectId);
    
    if (fullProject) {
      await syncProjectToCloud(currentUserId, fullProject);
    } else {
      // Fallback: construir projeto apenas com step data
      const allStepData = await getAllStepDataForProject(projectId);
      const projectData: Record<string, any> = {};
      for (const step of allStepData) {
        projectData[step.stepKey] = step.data;
      }

      await syncProjectToCloud(currentUserId, {
        id: projectId,
        data: projectData,
      });
    }

    statusCache.set(projectId, 'synced');
  } catch (error) {
    console.error('Erro ao sincronizar com Supabase:', error);
    statusCache.set(projectId, 'error');
    throw error;
  }
}

/**
 * Limpa dados de um step (útil para reset)
 */
export async function clearStepData(
  stepKey: string,
  projectId: string
): Promise<void> {
  try {
    // Limpar IndexedDB
    // TODO: Implementar delete em db.ts se necessário
    
    // Limpar localStorage
    const storageKey = `${STORAGE_PREFIX}${projectId}_${stepKey}`;
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Erro ao limpar step data:', error);
  }
}

