/**
 * Serviço para calcular splits de pagamento
 */

import type { 
  PaymentSplit, 
  SplitCalculationResult, 
  EventStaff,
  SplitPayout 
} from '../types';

export interface SplitCalculationInput {
  totalRevenue: number;
  platformFeePercentage: number;
  venueCost: number;
  servicesCost: number;
  staff: Array<{
    id: string;
    split_type: 'percentage' | 'fixed';
    split_value: number;
  }>;
}

/**
 * Calcula o split de pagamento para um evento
 */
export function calculateSplit(input: SplitCalculationInput): SplitCalculationResult {
  const { totalRevenue, platformFeePercentage, venueCost, servicesCost, staff } = input;

  // Calcular taxa da plataforma
  const platformFee = (totalRevenue * platformFeePercentage) / 100;

  // Calcular receita líquida
  const netRevenue = totalRevenue - platformFee - venueCost - servicesCost;

  // Calcular payouts para cada staff
  const payouts = staff.map((s) => {
    let amount = 0;
    
    if (s.split_type === 'percentage') {
      amount = (netRevenue * s.split_value) / 100;
    } else {
      amount = s.split_value;
    }

    return {
      staff_id: s.id,
      amount: Math.max(0, amount), // Garantir que não seja negativo
      split_type: s.split_type,
      split_value: s.split_value,
    };
  });

  // Validar que a soma dos payouts não exceda a receita líquida
  const totalPayouts = payouts.reduce((sum, p) => sum + p.amount, 0);
  
  if (totalPayouts > netRevenue) {
    // Ajustar proporcionalmente se exceder
    const ratio = netRevenue / totalPayouts;
    payouts.forEach((p) => {
      p.amount = p.amount * ratio;
    });
  }

  return {
    total_revenue: totalRevenue,
    platform_fee: platformFee,
    venue_cost: venueCost,
    services_cost: servicesCost,
    net_revenue: netRevenue,
    payouts,
  };
}

/**
 * Valida se um split pode ser processado
 */
export function canProcessSplit(
  split: PaymentSplit,
  staff: EventStaff[]
): { canProcess: boolean; reason?: string } {
  if (split.split_status !== 'pending' && split.split_status !== 'calculating') {
    return { canProcess: false, reason: 'Split já foi processado' };
  }

  if (!split.net_revenue || split.net_revenue <= 0) {
    return { canProcess: false, reason: 'Receita líquida inválida' };
  }

  // Verificar se todos os staff têm conta bancária configurada
  const staffWithoutBank = staff.filter((s) => !s.bank_account_setup);
  if (staffWithoutBank.length > 0) {
    return { 
      canProcess: false, 
      reason: `${staffWithoutBank.length} staff member(s) ainda não configuraram conta bancária` 
    };
  }

  return { canProcess: true };
}
