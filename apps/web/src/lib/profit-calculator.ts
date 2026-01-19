/**
 * Profit Calculator
 * Calcula estimativa de lucro visceral baseado em capacidade, preço de bilhetes e despesas
 */

export interface ProfitEstimate {
  revenue: {
    tickets: number;
    sponsorship: number;
    merch: number;
    total: number;
  };
  costs: {
    venue: number;
    artists: number;
    production: number;
    marketing: number;
    logistics: number;
    other: number;
    total: number;
  };
  profit: number;
  profitMargin: number;
  breakEven: number;
  roi: number;
}

export interface ProfitInputs {
  capacity: number;
  ticketPrice: number;
  expectedAttendance: number; // % da capacidade esperada (0-100)
  sponsorship: number;
  merchPerPerson: number; // Receita média de merch por pessoa
  venueSplit: number; // % que fica para venue (ex: 30)
  artistFees: number;
  productionCosts: number;
  marketingCosts: number;
  logisticsCosts: number;
  otherCosts: number;
}

/**
 * Calcula estimativa de lucro baseado nos inputs
 */
export function calculateProfit(inputs: ProfitInputs): ProfitEstimate {
  // Receitas
  const expectedSold = Math.floor((inputs.capacity * inputs.expectedAttendance) / 100);
  const ticketRevenue = expectedSold * inputs.ticketPrice;
  const merchRevenue = expectedSold * inputs.merchPerPerson;
  const totalRevenue = ticketRevenue + inputs.sponsorship + merchRevenue;

  // Custos
  const venueCost = (ticketRevenue * inputs.venueSplit) / 100;
  const totalCosts = 
    venueCost +
    inputs.artistFees +
    inputs.productionCosts +
    inputs.marketingCosts +
    inputs.logisticsCosts +
    inputs.otherCosts;

  // Lucro
  const profit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  const breakEven = inputs.capacity > 0 
    ? Math.ceil(totalCosts / inputs.ticketPrice)
    : 0;
  const roi = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;

  return {
    revenue: {
      tickets: ticketRevenue,
      sponsorship: inputs.sponsorship,
      merch: merchRevenue,
      total: totalRevenue,
    },
    costs: {
      venue: venueCost,
      artists: inputs.artistFees,
      production: inputs.productionCosts,
      marketing: inputs.marketingCosts,
      logistics: inputs.logisticsCosts,
      other: inputs.otherCosts,
      total: totalCosts,
    },
    profit,
    profitMargin,
    breakEven,
    roi,
  };
}

/**
 * Calcula cenários otimista, realista e pessimista
 */
export function calculateScenarios(inputs: ProfitInputs) {
  return {
    optimistic: calculateProfit({
      ...inputs,
      expectedAttendance: Math.min(100, inputs.expectedAttendance + 20),
    }),
    realistic: calculateProfit(inputs),
    pessimistic: calculateProfit({
      ...inputs,
      expectedAttendance: Math.max(30, inputs.expectedAttendance - 20),
    }),
  };
}




