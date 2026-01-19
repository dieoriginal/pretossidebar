/**
 * Sistema de Subscrições
 * Gestão de planos e subscrições para artistas underground
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // em euros
  interval: 'year' | 'month';
  stripePriceId?: string; // ID do preço no Stripe
  features: {
    maxProjects: number;
    maxEvents: number;
    exportPDF: boolean;
    templates: boolean;
    support: 'email' | 'priority' | 'none';
    cloudSync: boolean;
    customProcesses: boolean;
  };
  description: string;
  popular?: boolean;
}

export interface UserSubscription {
  userId: string;
  planId: string;
  status: 'active' | 'expired' | 'cancelled' | 'trial' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  cancelAtPeriodEnd?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'underground-annual',
    name: 'Underground Annual',
    price: 5,
    interval: 'year',
    description: 'Plano anual para artistas underground em Portugal',
    popular: true,
    features: {
      maxProjects: 50,
      maxEvents: 20,
      exportPDF: true,
      templates: true,
      support: 'email',
      cloudSync: true,
      customProcesses: true,
    },
  },
  {
    id: 'free-trial',
    name: 'Trial Gratuito',
    price: 0,
    interval: 'month',
    description: 'Teste grátis por 14 dias',
    features: {
      maxProjects: 3,
      maxEvents: 1,
      exportPDF: true,
      templates: false,
      support: 'none',
      cloudSync: false,
      customProcesses: false,
    },
  },
];

export const DEFAULT_PLAN = SUBSCRIPTION_PLANS[0];

/**
 * Verifica se o usuário tem acesso a uma feature
 */
export function hasFeatureAccess(
  subscription: UserSubscription | null,
  feature: keyof SubscriptionPlan['features']
): boolean {
  if (!subscription || subscription.status !== 'active') {
    // Usuário sem subscrição ativa - usar plano trial
    const trialPlan = SUBSCRIPTION_PLANS.find(p => p.id === 'free-trial');
    return trialPlan?.features[feature] || false;
  }

  const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId);
  return plan?.features[feature] || false;
}

/**
 * Verifica se o usuário pode criar mais projetos
 */
export function canCreateProject(
  subscription: UserSubscription | null,
  currentCount: number
): boolean {
  if (!subscription || subscription.status !== 'active') {
    const trialPlan = SUBSCRIPTION_PLANS.find(p => p.id === 'free-trial');
    return currentCount < (trialPlan?.features.maxProjects || 0);
  }

  const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId);
  return currentCount < (plan?.features.maxProjects || 0);
}

/**
 * Verifica se o usuário pode criar mais eventos
 */
export function canCreateEvent(
  subscription: UserSubscription | null,
  currentCount: number
): boolean {
  if (!subscription || subscription.status !== 'active') {
    const trialPlan = SUBSCRIPTION_PLANS.find(p => p.id === 'free-trial');
    return currentCount < (trialPlan?.features.maxEvents || 0);
  }

  const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId);
  return currentCount < (plan?.features.maxEvents || 0);
}

/**
 * Obtém o plano do usuário
 */
export function getUserPlan(subscription: UserSubscription | null): SubscriptionPlan {
  if (!subscription || subscription.status !== 'active') {
    return SUBSCRIPTION_PLANS.find(p => p.id === 'free-trial') || DEFAULT_PLAN;
  }

  return SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId) || DEFAULT_PLAN;
}

