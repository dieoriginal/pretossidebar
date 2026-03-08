'use client';

import { useState, useEffect, useCallback } from 'react';
import { GroceryItem, WeeklyBudget } from '../types';
import * as storage from '../lib/storage';
import { autoCategorize } from '../lib/autoCategorize';

export function useGrocery() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [budget, setBudgetState] = useState<WeeklyBudget | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data on mount
  useEffect(() => {
    setItems(storage.getItems());
    setBudgetState(storage.getBudget());
    setIsLoaded(true);
  }, []);

  // Items management
  const addItem = useCallback((item: {
    name: string;
    category?: string;
    unit?: string;
    unitPrice?: number | null;
    quantity?: number;
    status?: GroceryItem['status'];
    note?: string;
  }) => {
    const newItem = storage.addItem({
      name: item.name,
      category: item.category || autoCategorize(item.name),
      unit: item.unit || 'unit',
      unitPrice: item.unitPrice ?? null,
      quantity: item.quantity || 1,
      status: item.status || 'need',
      note: item.note || '',
    });
    setItems(prev => [...prev, newItem]);
    return newItem;
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<GroceryItem>) => {
    const updated = storage.updateItem(id, updates);
    if (updated) {
      setItems(prev => prev.map(i => i.id === id ? updated : i));
    }
    return updated;
  }, []);

  const deleteItem = useCallback((id: string) => {
    const success = storage.deleteItem(id);
    if (success) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
    return success;
  }, []);

  const toggleStatus = useCallback((id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      const newStatus = item.status === 'have' ? 'need' : 'have';
      return updateItem(id, { status: newStatus });
    }
    return null;
  }, [items, updateItem]);

  const clearCompleted = useCallback(() => {
    storage.clearCompleted();
    setItems(prev => prev.filter(i => i.status !== 'have'));
  }, []);

  // Budget management
  const setBudget = useCallback((amount: number) => {
    const newBudget = storage.setBudget(amount);
    setBudgetState(newBudget);
    return newBudget;
  }, []);

  const addSpent = useCallback((amount: number) => {
    storage.addToSpent(amount);
    setBudgetState(storage.getBudget());
  }, []);

  // Computed values
  const totalNeed = items
    .filter(i => i.status === 'need')
    .reduce((sum, i) => sum + (i.unitPrice || 0) * i.quantity, 0);

  const totalSpent = items
    .filter(i => i.status === 'have')
    .reduce((sum, i) => sum + (i.unitPrice || 0) * i.quantity, 0);

  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  const needItems = items.filter(i => i.status === 'need');
  const haveItems = items.filter(i => i.status === 'have');
  const runningLowItems = items.filter(i => i.status === 'running-low');

  return {
    // Data
    items,
    budget,
    isLoaded,
    
    // Computed
    totalNeed,
    totalSpent,
    itemsByCategory,
    needItems,
    haveItems,
    runningLowItems,
    
    // Actions
    addItem,
    updateItem,
    deleteItem,
    toggleStatus,
    clearCompleted,
    setBudget,
    addSpent,
    
    // Export/Import
    exportCSV: storage.exportToCSV,
    exportJSON: storage.exportToJSON,
    importJSON: storage.importFromJSON,
  };
}
