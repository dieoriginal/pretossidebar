/**
 * Hook para gerir subscrições do usuário
 */

import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserSubscription, SUBSCRIPTION_PLANS, getUserPlan } from '@/lib/subscriptions';
import { loadSubscriptionFromIndexedDB, saveSubscriptionToIndexedDB } from '@/lib/subscription-db';
import { useUser } from '@clerk/nextjs';

type SubscriptionStore = {
  subscription: UserSubscription | null;
  isLoading: boolean;
  setSubscription: (subscription: UserSubscription | null) => void;
  loadSubscription: (userId: string) => Promise<void>;
  updateSubscription: (updates: Partial<UserSubscription>) => void;
  reset: () => void;
};

export const useSubscription = create<SubscriptionStore>(
  persist(
    (set, get) => ({
      subscription: null,
      isLoading: false,
      setSubscription: (subscription) => {
        set({ subscription });
        if (subscription) {
          saveSubscriptionToIndexedDB(subscription).catch(console.error);
        }
      },
      loadSubscription: async (userId: string) => {
        set({ isLoading: true });
        try {
          const subscription = await loadSubscriptionFromIndexedDB(userId);
          set({ subscription, isLoading: false });
        } catch (error) {
          console.error('Error loading subscription:', error);
          set({ isLoading: false });
        }
      },
      updateSubscription: (updates) => {
        const current = get().subscription;
        if (current) {
          const updated: UserSubscription = {
            ...current,
            ...updates,
            updatedAt: new Date(),
          };
          get().setSubscription(updated);
        }
      },
      reset: () => set({ subscription: null }),
    }),
    {
      name: 'userSubscription',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/**
 * Hook React para usar subscrição
 */
export function useUserSubscription() {
  const { user } = useUser();
  const { subscription, isLoading, loadSubscription, setSubscription } = useSubscription();

  // Carregar subscrição quando o usuário mudar
  React.useEffect(() => {
    if (user?.id && !subscription && !isLoading) {
      loadSubscription(user.id);
    }
  }, [user?.id]);

  const plan = getUserPlan(subscription);
  const isActive = subscription?.status === 'active';
  const isTrial = !subscription || subscription.status !== 'active';

  return {
    subscription,
    plan,
    isActive,
    isTrial,
    isLoading,
    setSubscription,
    loadSubscription,
  };
}

