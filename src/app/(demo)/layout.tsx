/**
 * Layout para rotas autenticadas
 * Inclui onboarding e verificação de subscrição
 */

"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useUserSubscription } from "@/hooks/use-subscription";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const { subscription, loadSubscription } = useUserSubscription();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    if (isLoaded && user?.id) {
      // Verificar se já viu onboarding
      const seen = localStorage.getItem(`onboarding_seen_${user.id}`);
      if (!seen) {
        setShowOnboarding(true);
      }

      // Carregar subscrição
      loadSubscription(user.id);
    }
  }, [isLoaded, user?.id, loadSubscription]);

  const handleOnboardingComplete = () => {
    if (user?.id) {
      localStorage.setItem(`onboarding_seen_${user.id}`, 'true');
    }
    setShowOnboarding(false);
    setHasSeenOnboarding(true);
  };

  const handleOnboardingSkip = () => {
    handleOnboardingComplete();
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {children}
      <OnboardingFlow
        open={showOnboarding && !hasSeenOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    </>
  );
}
