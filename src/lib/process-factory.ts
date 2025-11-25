/**
 * Process Factory Pattern
 * Creates and manages process instances dynamically
 */

import { ProcessConfig, ProcessType, getProcessById } from "./processes-config";

export interface ProcessInstance {
  id: string;
  processId: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    version?: string;
    tags?: string[];
    notes?: string;
  };
}

export interface ProcessFactory {
  create(processId: string, initialData?: any): Promise<ProcessInstance>;
  load(instanceId: string): Promise<ProcessInstance | null>;
  save(instance: ProcessInstance): Promise<void>;
  delete(instanceId: string): Promise<void>;
  list(processId?: string): Promise<ProcessInstance[]>;
  duplicate(instanceId: string): Promise<ProcessInstance>;
}

class ProcessFactoryImpl implements ProcessFactory {
  private dbName = 'FazteUmAmboDB';
  private storeName = 'processInstances';

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 3);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('processId', 'processId', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async create(processId: string, initialData: any = {}): Promise<ProcessInstance> {
    const config = getProcessById(processId);
    if (!config) {
      throw new Error(`Process ${processId} not found`);
    }

    const instance: ProcessInstance = {
      id: `${processId}-${Date.now()}`,
      processId,
      data: initialData,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        version: "1.0.0",
        tags: [],
      },
    };

    await this.save(instance);
    return instance;
  }

  async load(instanceId: string): Promise<ProcessInstance | null> {
    const db = await this.getDB();
    const transaction = db.transaction(this.storeName, 'readonly');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.get(instanceId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async save(instance: ProcessInstance): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(this.storeName, 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    instance.updatedAt = new Date();
    
    return new Promise((resolve, reject) => {
      const request = store.put(instance);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(instanceId: string): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(this.storeName, 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(instanceId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async list(processId?: string): Promise<ProcessInstance[]> {
    const db = await this.getDB();
    const transaction = db.transaction(this.storeName, 'readonly');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = processId 
        ? store.index('processId').getAll(processId)
        : store.getAll();
      
      request.onsuccess = () => {
        const instances = (request.result || []) as ProcessInstance[];
        instances.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        resolve(instances);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async duplicate(instanceId: string): Promise<ProcessInstance> {
    const original = await this.load(instanceId);
    if (!original) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    const duplicated: ProcessInstance = {
      ...original,
      id: `${original.processId}-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        ...original.metadata,
        notes: `Duplicado de ${instanceId}`,
      },
    };

    await this.save(duplicated);
    return duplicated;
  }
}

export const processFactory = new ProcessFactoryImpl();

