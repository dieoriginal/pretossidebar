/**
 * Componente para exibir status da subscrição
 */

"use client";

import { useUserSubscription } from "@/hooks/use-subscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, CreditCard } from "lucide-react";
import Link from "next/link";

export function SubscriptionStatus() {
  const { subscription, plan, isActive, isTrial } = useUserSubscription();

  if (isTrial) {
    return (
      <Card className="border-yellow-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                Período de Teste
              </CardTitle>
              <CardDescription>
                Estás a usar a versão trial gratuita
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
              Trial
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Limites do trial:
              </p>
              <ul className="space-y-1 text-sm">
                <li>• {plan.features.maxProjects} projetos</li>
                <li>• {plan.features.maxEvents} eventos</li>
                <li>• Exportação PDF limitada</li>
              </ul>
            </div>
            <Button asChild className="w-full">
              <Link href="/subscription/checkout">
                <CreditCard className="mr-2 h-4 w-4" />
                Subscrever Agora - 5€/ano
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isActive) {
    return (
      <Card className="border-red-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Subscrição Expirada
              </CardTitle>
              <CardDescription>
                A tua subscrição expirou em{" "}
                {subscription?.currentPeriodEnd.toLocaleDateString("pt-PT")}
              </CardDescription>
            </div>
            <Badge variant="destructive">Expirado</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/subscription/checkout">
              Renovar Subscrição
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              {plan.name}
            </CardTitle>
            <CardDescription>
              Subscrição ativa até{" "}
              {subscription?.currentPeriodEnd.toLocaleDateString("pt-PT")}
            </CardDescription>
          </div>
          <Badge className="bg-green-500">Ativo</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold mb-2">Funcionalidades:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• {plan.features.maxProjects} projetos</li>
              <li>• {plan.features.maxEvents} eventos</li>
              <li>• Exportação PDF ilimitada</li>
              <li>• Templates profissionais</li>
              <li>• Suporte por email</li>
              <li>• Sincronização cloud</li>
            </ul>
          </div>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/subscription/manage">
              Gerir Subscrição
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

