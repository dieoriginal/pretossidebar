/**
 * Hook universal de auto-save para formulários
 * Monitora mudanças, aplica debounce e salva automaticamente
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useProject } from './use-project';
import {
  saveStepData,
  loadStepData,
  getSaveStatus,
  type SaveStatus,
} from '@/lib/auto-save-storage';

export interface UseAutoSaveOptions {
  stepKey: string;
  projectId?: string;
  debounceMs?: number;
  autoLoad?: boolean;
  onSave?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface UseAutoSaveReturn<T> {
  status: SaveStatus;
  save: (data: T) => Promise<void>;
  load: () => Promise<T | null>;
  isLoading: boolean;
}

const DEFAULT_DEBOUNCE_MS = 500;

/**
 * Hook de auto-save progressivo
 */
export function useAutoSave<T = any>(
  options: UseAutoSaveOptions
): UseAutoSaveReturn<T> {
  const { stepKey, projectId: providedProjectId, debounceMs = DEFAULT_DEBOUNCE_MS, autoLoad = true, onSave, onError } = options;
  
  const project = useProject((s) => s.project);
  const updateStep = useProject((s) => s.updateStep);
  const projectId = providedProjectId || project?.id || 'current-project';
  
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<any>(null);

  // Carregar dados salvos automaticamente
  useEffect(() => {
    if (autoLoad) {
      setIsLoading(true);
      loadStepData(stepKey, projectId)
        .then((data) => {
          if (data !== null) {
            lastSavedRef.current = data;
            // Atualizar o estado do projeto também
            updateStep(stepKey, data);
            if (onSave) {
              onSave(data);
            }
          }
        })
        .catch((error) => {
          console.error('Erro ao carregar dados:', error);
          if (onError) {
            onError(error);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [stepKey, projectId, autoLoad, updateStep, onSave, onError]);

  // Monitorar status de salvamento
  useEffect(() => {
    const interval = setInterval(() => {
      const currentStatus = getSaveStatus(projectId);
      setStatus(currentStatus);
    }, 100);

    return () => clearInterval(interval);
  }, [projectId]);

  // Função de salvamento com debounce
  const save = useCallback(
    async (data: T) => {
      // Cancelar timeout anterior
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Se os dados não mudaram, não salvar
      if (JSON.stringify(data) === JSON.stringify(lastSavedRef.current)) {
        return;
      }

      // Agendar salvamento
      debounceTimeoutRef.current = setTimeout(async () => {
        try {
          setStatus('saving');
          await saveStepData(stepKey, data, projectId);
          lastSavedRef.current = data;
          
          // Atualizar estado do projeto
          updateStep(stepKey, data);
          
          setStatus('saved');
          
          if (onSave) {
            onSave(data);
          }
        } catch (error) {
          console.error('Erro ao salvar:', error);
          setStatus('error');
          if (onError) {
            onError(error as Error);
          }
        }
      }, debounceMs);
    },
    [stepKey, projectId, debounceMs, updateStep, onSave, onError]
  );

  // Função de carregamento
  const load = useCallback(async (): Promise<T | null> => {
    setIsLoading(true);
    try {
      const data = await loadStepData(stepKey, projectId);
      if (data !== null) {
        lastSavedRef.current = data;
        updateStep(stepKey, data);
        if (onSave) {
          onSave(data);
        }
      }
      return data;
    } catch (error) {
      console.error('Erro ao carregar:', error);
      if (onError) {
        onError(error as Error);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [stepKey, projectId, updateStep, onSave, onError]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    status,
    save,
    load,
    isLoading,
  };
}












