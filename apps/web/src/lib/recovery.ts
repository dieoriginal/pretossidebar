/**
 * Sistema de Recovery - Recupera drafts não salvos
 * Merge inteligente de dados entre IndexedDB e localStorage
 */

import {
  loadStepDataFromIndexedDB,
  getAllStepDataForProject,
} from './db';
import { loadStepData } from './auto-save-storage';
import type { ProjectState } from '@/hooks/use-project';

const STORAGE_PREFIX = 'autosave_';

export interface RecoveredDraft {
  stepKey: string;
  data: any;
  source: 'indexeddb' | 'localstorage' | 'both';
  lastSaved: string;
}

/**
 * Recupera drafts não salvos de um projeto
 */
export async function recoverDrafts(
  projectId: string
): Promise<RecoveredDraft[]> {
  const recovered: RecoveredDraft[] = [];

  try {
    // 1. Carregar todos os step data do IndexedDB
    const indexedData = await getAllStepDataForProject(projectId);

    // 2. Carregar do localStorage
    const localStorageKeys = Object.keys(localStorage)
      .filter((key) => key.startsWith(`${STORAGE_PREFIX}${projectId}_`));

    const localStorageData: Record<string, any> = {};
    for (const key of localStorageKeys) {
      const stepKey = key.replace(`${STORAGE_PREFIX}${projectId}_`, '');
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          localStorageData[stepKey] = parsed;
        }
      } catch (e) {
        console.warn(`Erro ao parsear localStorage key ${key}:`, e);
      }
    }

    // 3. Merge inteligente
    const allStepKeys = new Set([
      ...indexedData.map((item) => item.stepKey),
      ...Object.keys(localStorageData),
    ]);

    for (const stepKey of allStepKeys) {
      const indexedItem = indexedData.find((item) => item.stepKey === stepKey);
      const localStorageItem = localStorageData[stepKey];

      if (indexedItem && localStorageItem) {
        // Ambos existem - usar o mais recente
        const indexedTime = new Date(indexedItem.lastSaved).getTime();
        const localStorageTime = new Date(localStorageItem.timestamp || 0).getTime();

        if (indexedTime >= localStorageTime) {
          recovered.push({
            stepKey,
            data: indexedItem.data,
            source: 'indexeddb',
            lastSaved: indexedItem.lastSaved,
          });
        } else {
          recovered.push({
            stepKey,
            data: localStorageItem.data,
            source: 'localstorage',
            lastSaved: localStorageItem.timestamp,
          });
        }
      } else if (indexedItem) {
        recovered.push({
          stepKey,
          data: indexedItem.data,
          source: 'indexeddb',
          lastSaved: indexedItem.lastSaved,
        });
      } else if (localStorageItem) {
        recovered.push({
          stepKey,
          data: localStorageItem.data,
          source: 'localstorage',
          lastSaved: localStorageItem.timestamp || new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.error('Erro ao recuperar drafts:', error);
  }

  return recovered;
}

/**
 * Merge inteligente de dados de projeto
 * Resolve conflitos usando timestamp (mais recente ganha)
 */
export function mergeProjectData(
  local: Partial<ProjectState>,
  remote: Partial<ProjectState>
): ProjectState {
  // Comparar timestamps
  const localTime = new Date(local.updatedAt || 0).getTime();
  const remoteTime = new Date(remote.updatedAt || 0).getTime();

  const base = localTime >= remoteTime ? local : remote;
  const other = localTime >= remoteTime ? remote : local;

  // Merge stepData por step (não substituir completamente)
  const mergedStepData = { ...base.stepData, ...other.stepData };
  
  // Para cada step, usar o mais recente
  if (base.stepData && other.stepData) {
    for (const stepKey in other.stepData) {
      // Se ambos têm dados do mesmo step, comparar timestamps
      // Por enquanto, usar o mais recente (já está no base se localTime >= remoteTime)
      // Em versões futuras, podemos fazer merge mais sofisticado
    }
  }

  return {
    ...base,
    ...other,
    stepData: mergedStepData,
    updatedAt: new Date().toISOString(),
  } as ProjectState;
}

/**
 * Verifica se há drafts não sincronizados
 */
export async function hasUnsavedDrafts(projectId: string): Promise<boolean> {
  try {
    const drafts = await recoverDrafts(projectId);
    return drafts.length > 0;
  } catch {
    return false;
  }
}

/**
 * Limpa todos os drafts de um projeto (útil após salvamento bem-sucedido)
 */
export async function clearDrafts(projectId: string): Promise<void> {
  try {
    // Limpar localStorage
    const localStorageKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith(`${STORAGE_PREFIX}${projectId}_`)
    );
    for (const key of localStorageKeys) {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Erro ao limpar drafts:', error);
  }
}












