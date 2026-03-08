export interface GroceryItem {
  id: string;
  category: string;
  name: string;
  unit: string;
  unitPrice: number | null;
  quantity: number;
  status: 'need' | 'have' | 'running-low' | 'not-needed' | 'too-expensive' | '';
  note: string;
  addedAt: string;
}

export interface WeeklyBudget {
  weekStart: string;
  weekEnd: string;
  budgetAmount: number;
  spent: number;
  items: GroceryItem[];
}

export interface ShoppingHistory {
  id: string;
  date: string;
  store: string;
  total: number;
  items: GroceryItem[];
}

export type Category = 
  | 'Mercearia / Básicos'
  | 'Hortofrutícolas'
  | 'Laticínios / Frigorífico'
  | 'Enlatados / Bebidas'
  | 'Charcutaria / Secos / Snacks'
  | 'Casa / Limpeza / Higiene'
  | 'Congelados'
  | 'Peixaria'
  | 'Talho'
  | 'Padaria'
  | 'Outros';

export const CATEGORIES: Category[] = [
  'Mercearia / Básicos',
  'Hortofrutícolas',
  'Laticínios / Frigorífico',
  'Enlatados / Bebidas',
  'Charcutaria / Secos / Snacks',
  'Casa / Limpeza / Higiene',
  'Congelados',
  'Peixaria',
  'Talho',
  'Padaria',
  'Outros',
];

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  'need': { label: 'Preciso Comprar', color: '#ef4444' },
  'have': { label: 'Tenho', color: '#22c55e' },
  'running-low': { label: 'Quase a Acabar', color: '#f59e0b' },
  'not-needed': { label: 'Não é Necessário', color: '#6b7280' },
  'too-expensive': { label: 'Muito Caro', color: '#8b5cf6' },
  '': { label: 'Sem Status', color: '#9ca3af' },
};
