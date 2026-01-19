/**
 * Unified Process Manager Hook
 * Central hook for managing all processes across the application
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProcessConfig, getProcessById, getEnabledProcesses } from "@/lib/processes-config";
import { processFactory, ProcessInstance } from "@/lib/process-factory";

export function useProcessManager() {
  const router = useRouter();
  const [processes] = useState<ProcessConfig[]>(getEnabledProcesses());
  const [instances, setInstances] = useState<Map<string, ProcessInstance[]>>(new Map());
  const [loading, setLoading] = useState(false);

  const loadInstances = useCallback(async (processId?: string) => {
    setLoading(true);
    try {
      const instancesMap = new Map<string, ProcessInstance[]>();
      
      const processesToLoad = processId 
        ? processes.filter(p => p.id === processId)
        : processes;
      
      for (const process of processesToLoad) {
        const processInstances = await processFactory.list(process.id);
        instancesMap.set(process.id, processInstances);
      }
      
      setInstances(prev => {
        const merged = new Map(prev);
        instancesMap.forEach((value, key) => merged.set(key, value));
        return merged;
      });
    } catch (error) {
      console.error("Error loading instances:", error);
    } finally {
      setLoading(false);
    }
  }, [processes]);

  const createInstance = useCallback(async (processId: string, initialData?: any) => {
    try {
      setLoading(true);
      const instance = await processFactory.create(processId, initialData);
      const config = getProcessById(processId);
      
      // Reload instances for this process
      await loadInstances(processId);
      
      if (config) {
        router.push(`${config.href}/${instance.id}`);
      }
      
      return instance;
    } catch (error) {
      console.error("Error creating instance:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [router, loadInstances]);

  const deleteInstance = useCallback(async (instanceId: string, processId: string) => {
    try {
      setLoading(true);
      await processFactory.delete(instanceId);
      await loadInstances(processId);
    } catch (error) {
      console.error("Error deleting instance:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadInstances]);

  const duplicateInstance = useCallback(async (instanceId: string) => {
    try {
      setLoading(true);
      const duplicated = await processFactory.duplicate(instanceId);
      const original = await processFactory.load(instanceId);
      
      if (original) {
        await loadInstances(original.processId);
      }
      
      return duplicated;
    } catch (error) {
      console.error("Error duplicating instance:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadInstances]);

  const saveInstance = useCallback(async (instance: ProcessInstance) => {
    try {
      await processFactory.save(instance);
      await loadInstances(instance.processId);
    } catch (error) {
      console.error("Error saving instance:", error);
      throw error;
    }
  }, [loadInstances]);

  useEffect(() => {
    loadInstances();
  }, [loadInstances]);

  return {
    processes,
    instances,
    loading,
    createInstance,
    deleteInstance,
    duplicateInstance,
    saveInstance,
    loadInstances,
    getInstancesByProcess: (processId: string) => instances.get(processId) || [],
  };
}

