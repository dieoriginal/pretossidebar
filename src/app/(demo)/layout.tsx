/**
 * Layout para rotas autenticadas
 * Inclui onboarding e verificação de subscrição
 */

"use client";

import { useEffect, useState } from "react";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const userId = "demo-user"; // Fallback user ID without Clerk

  useEffect(() => {
    // Verificar se já viu onboarding
    const seen = localStorage.getItem(`onboarding_seen_${userId}`);
    if (!seen) {
      setShowOnboarding(true);
    }
  }, [userId]);

  const handleOnboardingComplete = () => {
    localStorage.setItem(`onboarding_seen_${userId}`, 'true');
    setShowOnboarding(false);
    setHasSeenOnboarding(true);
  };

  const handleOnboardingSkip = () => {
    handleOnboardingComplete();
  };

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
