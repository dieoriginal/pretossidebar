/**
 * Hook especializado para auto-save de steps
 * Facilita a integração do auto-save em componentes de step
 */

import { useEffect, useState, useCallback } from 'react';
import { useAutoSave } from './use-auto-save';
import { useProject } from './use-project';
import { AutoSaveStatus } from '@/components/auto-save-status';

export interface UseStepAutoSaveOptions<T> {
  stepKey: string;
  initialData: T;
  projectId?: string;
  debounceMs?: number;
  onDataChange?: (data: T) => void;
}

export interface UseStepAutoSaveReturn<T> {
  data: T;
  setData: (data: T | ((prev: T) => T)) => void;
  updateData: (partial: Partial<T>) => void;
  resetData: () => void;
  statusComponent: React.ReactNode;
  isLoading: boolean;
}

/**
 * Hook especializado para steps com auto-save
 */
export function useStepAutoSave<T extends Record<string, any>>(
  options: UseStepAutoSaveOptions<T>
): UseStepAutoSaveReturn<T> {
  const {
    stepKey,
    initialData,
    projectId: providedProjectId,
    debounceMs = 500,
    onDataChange,
  } = options;

  const project = useProject((s) => s.project);
  const projectId = providedProjectId || project?.id || 'current-project';

  const [data, setDataState] = useState<T>(initialData);

  const { save, load, status, isLoading } = useAutoSave<T>({
    stepKey,
    projectId,
    autoLoad: true,
    debounceMs,
    onSave: (loadedData) => {
      if (loadedData) {
        setDataState(loadedData);
        if (onDataChange) {
          onDataChange(loadedData);
        }
      }
    },
  });

  // Carregar dados salvos ao montar
  useEffect(() => {
    load().then((loadedData) => {
      if (loadedData) {
        setDataState(loadedData);
        if (onDataChange) {
          onDataChange(loadedData);
        }
      }
    });
  }, [load, onDataChange]);

  // Função setData que também salva
  const setData = useCallback(
    (newData: T | ((prev: T) => T)) => {
      setDataState((prev) => {
        const updated = typeof newData === 'function' ? newData(prev) : newData;
        save(updated);
        if (onDataChange) {
          onDataChange(updated);
        }
        return updated;
      });
    },
    [save, onDataChange]
  );

  // Função updateData para atualizações parciais
  const updateData = useCallback(
    (partial: Partial<T>) => {
      setDataState((prev) => {
        const updated = { ...prev, ...partial };
        save(updated);
        if (onDataChange) {
          onDataChange(updated);
        }
        return updated;
      });
    },
    [save, onDataChange]
  );

  // Função resetData
  const resetData = useCallback(() => {
    setDataState(initialData);
    save(initialData);
    if (onDataChange) {
      onDataChange(initialData);
    }
  }, [initialData, save, onDataChange]);

  // Auto-save quando data muda
  useEffect(() => {
    save(data);
  }, [data, save]);

  const statusComponent = <AutoSaveStatus status={status} />;

  return {
    data,
    setData,
    updateData,
    resetData,
    statusComponent,
    isLoading,
  };
}












