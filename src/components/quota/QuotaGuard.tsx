/**
 * Componente para proteger ações baseadas em quotas
 */

"use client";

import { useUserSubscription } from "@/hooks/use-subscription";
import { canCreateProject, canCreateEvent } from "@/lib/subscriptions";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CreditCard } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface QuotaGuardProps {
  type: 'project' | 'event';
  currentCount: number;
  children: React.ReactNode;
  onExceeded?: () => void;
}

export function QuotaGuard({ type, currentCount, children, onExceeded }: QuotaGuardProps) {
  const { subscription, plan, isTrial } = useUserSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const canCreate = type === 'project'
    ? canCreateProject(subscription, currentCount)
    : canCreateEvent(subscription, currentCount);

  const maxAllowed = type === 'project'
    ? plan.features.maxProjects
    : plan.features.maxEvents;

  const handleExceeded = () => {
    setShowUpgrade(true);
    onExceeded?.();
  };

  if (!canCreate) {
    return (
      <>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Limite Atingido</AlertTitle>
          <AlertDescription>
            Já atingiste o limite de {maxAllowed} {type === 'project' ? 'projetos' : 'eventos'}.
            {isTrial && " Subscreve para aumentar o limite."}
          </AlertDescription>
        </Alert>
        <Button onClick={handleExceeded} className="mt-4">
          <CreditCard className="mr-2 h-4 w-4" />
          {isTrial ? "Subscrever Agora" : "Upgrade"}
        </Button>

        <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Limite Atingido</DialogTitle>
              <DialogDescription>
                Já atingiste o limite do teu plano atual.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                O plano Underground Annual permite:
              </p>
              <ul className="space-y-2 text-sm">
                <li>• 50 projetos (atual: {maxAllowed})</li>
                <li>• 20 eventos</li>
                <li>• Todas as funcionalidades premium</li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/subscription/checkout">
                  Subscrever por 5€/ano
                </Link>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return <>{children}</>;
}

/**
 * Hook para verificar quotas
 */
export function useQuota() {
  const { subscription, plan } = useUserSubscription();

  return {
    canCreateProject: (currentCount: number) => canCreateProject(subscription, currentCount),
    canCreateEvent: (currentCount: number) => canCreateEvent(subscription, currentCount),
    maxProjects: plan.features.maxProjects,
    maxEvents: plan.features.maxEvents,
    remainingProjects: (currentCount: number) => Math.max(0, plan.features.maxProjects - currentCount),
    remainingEvents: (currentCount: number) => Math.max(0, plan.features.maxEvents - currentCount),
  };
}

