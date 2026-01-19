/**
 * Database operations for subscriptions
 * Usa IndexedDB para armazenar subscrições localmente
 */

import { UserSubscription } from './subscriptions';

const DB_NAME = 'pretosMusicDB';
const SUBSCRIPTION_STORE = 'subscriptions';
const DB_VERSION = 1;

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(SUBSCRIPTION_STORE)) {
        const store = db.createObjectStore(SUBSCRIPTION_STORE, { keyPath: 'userId' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('stripeSubscriptionId', 'stripeSubscriptionId', { unique: true });
      }
    };
  });
}

export async function saveSubscriptionToIndexedDB(subscription: UserSubscription): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SUBSCRIPTION_STORE], 'readwrite');
    const store = transaction.objectStore(SUBSCRIPTION_STORE);
    const request = store.put({
      ...subscription,
      currentPeriodStart: subscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString(),
    });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function loadSubscriptionFromIndexedDB(userId: string): Promise<UserSubscription | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SUBSCRIPTION_STORE], 'readonly');
    const store = transaction.objectStore(SUBSCRIPTION_STORE);
    const request = store.get(userId);

    request.onsuccess = () => {
      if (request.result) {
        const sub = request.result;
        resolve({
          ...sub,
          currentPeriodStart: new Date(sub.currentPeriodStart),
          currentPeriodEnd: new Date(sub.currentPeriodEnd),
          createdAt: new Date(sub.createdAt),
          updatedAt: new Date(sub.updatedAt),
        });
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getAllSubscriptionsFromIndexedDB(): Promise<UserSubscription[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SUBSCRIPTION_STORE], 'readonly');
    const store = transaction.objectStore(SUBSCRIPTION_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const subscriptions = request.result.map((sub: any) => ({
        ...sub,
        currentPeriodStart: new Date(sub.currentPeriodStart),
        currentPeriodEnd: new Date(sub.currentPeriodEnd),
        createdAt: new Date(sub.createdAt),
        updatedAt: new Date(sub.updatedAt),
      }));
      resolve(subscriptions);
    };
    request.onerror = () => reject(request.error);
  });
}

