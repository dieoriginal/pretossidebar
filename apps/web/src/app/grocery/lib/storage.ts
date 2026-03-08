'use client';

import { GroceryItem, WeeklyBudget, ShoppingHistory } from '../types';

const STORAGE_KEYS = {
  ITEMS: 'grocery_items',
  BUDGET: 'weekly_budget',
  HISTORY: 'shopping_history',
  SETTINGS: 'grocery_settings',
};

// Items
export function getItems(): GroceryItem[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.ITEMS);
  return data ? JSON.parse(data) : [];
}

export function saveItems(items: GroceryItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
}

export function addItem(item: Omit<GroceryItem, 'id' | 'addedAt'>): GroceryItem {
  const items = getItems();
  const newItem: GroceryItem = {
    ...item,
    id: crypto.randomUUID(),
    addedAt: new Date().toISOString(),
  };
  items.push(newItem);
  saveItems(items);
  return newItem;
}

export function updateItem(id: string, updates: Partial<GroceryItem>): GroceryItem | null {
  const items = getItems();
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return null;
  
  items[index] = { ...items[index], ...updates };
  saveItems(items);
  return items[index];
}

export function deleteItem(id: string): boolean {
  const items = getItems();
  const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length) return false;
  saveItems(filtered);
  return true;
}

export function clearCompleted(): void {
  const items = getItems().filter(i => i.status !== 'have');
  saveItems(items);
}

// Budget
export function getBudget(): WeeklyBudget | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.BUDGET);
  if (!data) return null;
  
  const budget = JSON.parse(data);
  // Check if we need to reset for new week
  const now = new Date();
  const weekEnd = new Date(budget.weekEnd);
  
  if (now > weekEnd) {
    // Archive old week and create new
    archiveWeek(budget);
    return createNewWeek(budget.budgetAmount);
  }
  
  return budget;
}

export function setBudget(amount: number): WeeklyBudget {
  const existing = getBudget();
  if (existing) {
    existing.budgetAmount = amount;
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(existing));
    return existing;
  }
  return createNewWeek(amount);
}

function createNewWeek(amount: number): WeeklyBudget {
  const now = new Date();
  const weekStart = new Date(now.setHours(0, 0, 0, 0));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  
  const budget: WeeklyBudget = {
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    budgetAmount: amount,
    spent: 0,
    items: [],
  };
  
  localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
  return budget;
}

function archiveWeek(budget: WeeklyBudget): void {
  const history = getHistory();
  const record: ShoppingHistory = {
    id: crypto.randomUUID(),
    date: budget.weekEnd,
    store: 'Multiple',
    total: budget.spent,
    items: budget.items,
  };
  history.push(record);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

export function addToSpent(amount: number): void {
  const budget = getBudget();
  if (budget) {
    budget.spent += amount;
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
  }
}

// History
export function getHistory(): ShoppingHistory[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
  return data ? JSON.parse(data) : [];
}

// Settings
export function getSettings(): { defaultBudget: number; currency: string; storeName: string } {
  if (typeof window === 'undefined') return { defaultBudget: 50, currency: 'EUR', storeName: '' };
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : { defaultBudget: 50, currency: 'EUR', storeName: '' };
}

export function saveSettings(settings: { defaultBudget?: number; currency?: string; storeName?: string }): void {
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
}

// Export/Import
export function exportToCSV(): string {
  const items = getItems();
  const headers = ['Category', 'Item', 'Unit', 'Unit_Price', 'Quantity', 'Total_Price', 'Status', 'Note'];
  
  const rows = items.map(item => [
    item.category,
    item.name,
    item.unit,
    item.unitPrice?.toString() || '',
    item.quantity.toString(),
    item.unitPrice ? (item.unitPrice * item.quantity).toFixed(2) : '',
    item.status,
    item.note,
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function exportToJSON(): string {
  const data = {
    items: getItems(),
    budget: getBudget(),
    history: getHistory(),
    settings: getSettings(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importFromJSON(json: string): boolean {
  try {
    const data = JSON.parse(json);
    if (data.items) localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(data.items));
    if (data.budget) localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(data.budget));
    if (data.history) localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
    if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    return true;
  } catch {
    return false;
  }
}
