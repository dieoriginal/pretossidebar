export type SplitStatus = 
  | 'pending'
  | 'calculating'
  | 'processing'
  | 'completed'
  | 'failed';

export type PayoutStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export interface PaymentSplit {
  id: string;
  event_id: string;
  total_revenue?: number;
  platform_fee?: number;
  venue_cost?: number;
  services_cost?: number;
  net_revenue?: number;
  split_status: SplitStatus;
  calculated_at?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SplitPayout {
  id: string;
  payment_split_id: string;
  staff_id: string;
  amount: number;
  currency: string;
  stripe_transfer_id?: string;
  status: PayoutStatus;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SplitCalculationResult {
  total_revenue: number;
  platform_fee: number;
  venue_cost: number;
  services_cost: number;
  net_revenue: number;
  payouts: Array<{
    staff_id: string;
    amount: number;
    split_type: 'percentage' | 'fixed';
    split_value: number;
  }>;
}
