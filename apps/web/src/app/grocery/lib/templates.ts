// Standard weekly shopping template - based on your regular purchases
// This resets every week automatically

import { GroceryItem } from '../types';

export interface ShoppingTemplate {
  id: string;
  name: string;
  items: Omit<GroceryItem, 'id' | 'addedAt'>[];
  defaultBudget: number;
}

// Your standard weekly shopping list - THE DEFAULTS
export const DEFAULT_WEEKLY_TEMPLATE: ShoppingTemplate = {
  id: 'default-weekly',
  name: 'Compras Semanais Padrão',
  defaultBudget: 50,
  items: [
    // Mercearia / Básicos
    { category: 'Mercearia / Básicos', name: 'Manteiga de amendoim', unit: '0.34 kg', unitPrice: 1.79, quantity: 1, status: 'need', note: '' },
    { category: 'Mercearia / Básicos', name: 'Feijão (lata)', unit: 'unit', unitPrice: 0.84, quantity: 2, status: 'need', note: '' },
    { category: 'Mercearia / Básicos', name: 'Aveia', unit: 'unit', unitPrice: null, quantity: 1, status: 'need', note: '' },
    { category: 'Mercearia / Básicos', name: 'Burger Sauce', unit: 'unit', unitPrice: null, quantity: 1, status: 'need', note: '' },
    { category: 'Mercearia / Básicos', name: 'Molho Inglês', unit: 'unit', unitPrice: null, quantity: 1, status: 'need', note: '' },
    { category: 'Mercearia / Básicos', name: 'Azeite', unit: 'unit', unitPrice: null, quantity: 1, status: 'need', note: '' },
    
    // Padaria
    { category: 'Padaria', name: 'Pão', unit: 'unit', unitPrice: 1.19, quantity: 2, status: 'need', note: '' },
    
    // Laticínios / Frigorífico
    { category: 'Laticínios / Frigorífico', name: 'Manteiga', unit: 'unit', unitPrice: 2.99, quantity: 1, status: 'need', note: '' },
    { category: 'Laticínios / Frigorífico', name: 'Leite normal', unit: 'unit', unitPrice: 0.86, quantity: 4, status: 'need', note: '' },
    { category: 'Laticínios / Frigorífico', name: 'Leite Moça', unit: 'unit', unitPrice: null, quantity: 1, status: 'need', note: '' },
    
    // Hortofrutícolas
    { category: 'Hortofrutícolas', name: 'Banana (1 kg)', unit: '1 kg', unitPrice: 1.29, quantity: 1, status: 'need', note: '' },
    { category: 'Hortofrutícolas', name: 'Dente de Alho', unit: '250 g', unitPrice: 1.79, quantity: 1, status: 'need', note: '' },
    { category: 'Hortofrutícolas', name: 'Pimentos (1 kg)', unit: '1 kg', unitPrice: 2.29, quantity: 1, status: 'need', note: '' },
    { category: 'Hortofrutícolas', name: 'Milho', unit: '0.285 Kg', unitPrice: 1.09, quantity: 1, status: 'need', note: '' },
    
    // Laticínios
    { category: 'Laticínios / Frigorífico', name: 'Ovos de Solo Classe M (12 unid.)', unit: '12 unid.', unitPrice: 3.09, quantity: 2, status: 'need', note: '' },
    { category: 'Laticínios / Frigorífico', name: 'Queijo', unit: 'unit', unitPrice: null, quantity: 1, status: 'need', note: '' },
    
    // Enlatados / Bebidas
    { category: 'Enlatados / Bebidas', name: 'Atum posta ao natural (85 ml)', unit: '85 ml', unitPrice: 0.89, quantity: 2, status: 'need', note: '' },
    { category: 'Enlatados / Bebidas', name: 'Sumo (1,5 L)', unit: '1.5 L', unitPrice: 0.55, quantity: 2, status: 'need', note: '' },
    { category: 'Enlatados / Bebidas', name: 'Vinho Branco', unit: 'unit', unitPrice: null, quantity: 1, status: 'need', note: '' },
    { category: 'Enlatados / Bebidas', name: 'Cerveja (lata)', unit: 'unit', unitPrice: null, quantity: 1, status: 'need', note: '' },
    
    // Charcutaria
    { category: 'Charcutaria / Secos / Snacks', name: 'Fiambre', unit: 'unit', unitPrice: null, quantity: 1, status: 'need', note: '' },
    
    // Congelados
    { category: 'Congelados', name: 'Batatas fritas congeladas', unit: 'unit', unitPrice: null, quantity: 1, status: 'need', note: '' },
    
    // Casa / Limpeza
    { category: 'Casa / Limpeza / Higiene', name: 'Detergente loiça manual clássico (1 L)', unit: '1 L', unitPrice: 0.89, quantity: 1, status: 'need', note: '' },
    { category: 'Casa / Limpeza / Higiene', name: 'Papel higiénico 2 folhas (12 rolos)', unit: '12 rolos', unitPrice: 2.59, quantity: 1, status: 'need', note: '' },
    { category: 'Casa / Limpeza / Higiene', name: 'Sacos de lixo', unit: 'unit', unitPrice: null, quantity: 1, status: 'need', note: '' },
    { category: 'Casa / Limpeza / Higiene', name: 'Amaciador roupa lavanda', unit: '80 Dos', unitPrice: 1.85, quantity: 1, status: 'need', note: '' },
  ],
};

// Storage keys
const TEMPLATE_KEY = 'grocery_template';
const LAST_RESET_KEY = 'grocery_last_reset';

// Get current template
export function getCurrentTemplate(): ShoppingTemplate {
  if (typeof window === 'undefined') return DEFAULT_WEEKLY_TEMPLATE;
  const saved = localStorage.getItem(TEMPLATE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return DEFAULT_WEEKLY_TEMPLATE;
}

// Save custom template
export function saveTemplate(template: ShoppingTemplate): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(template));
}

// Check if we need to auto-reset (new week started)
export function shouldAutoReset(): boolean {
  if (typeof window === 'undefined') return false;
  const lastReset = localStorage.getItem(LAST_RESET_KEY);
  if (!lastReset) return true;
  
  const lastResetDate = new Date(lastReset);
  const now = new Date();
  
  // Reset if it's been more than 7 days
  const daysSinceReset = (now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceReset >= 7;
}

// Get last reset date
export function getLastResetDate(): Date | null {
  if (typeof window === 'undefined') return null;
  const lastReset = localStorage.getItem(LAST_RESET_KEY);
  return lastReset ? new Date(lastReset) : null;
}

// Mark as reset
export function markAsReset(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_RESET_KEY, new Date().toISOString());
}

// Calculate estimated total from template
export function getTemplateEstimatedTotal(template: ShoppingTemplate): number {
  return template.items.reduce((sum, item) => {
    return sum + (item.unitPrice || 0) * item.quantity;
  }, 0);
}
