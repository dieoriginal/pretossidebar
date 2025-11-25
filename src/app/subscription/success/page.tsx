/**
 * Página de sucesso após pagamento
 */

"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSubscription } from "@/hooks/use-subscription";

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { loadSubscription } = useSubscription();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (user?.id && sessionId) {
      // Recarregar subscrição após alguns segundos (dar tempo ao webhook)
      setTimeout(() => {
        loadSubscription(user.id);
      }, 3000);
    }
  }, [user?.id, sessionId, loadSubscription]);

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-md">
        <Card className="border-green-500">
          <CardHeader className="text-center">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <CardTitle className="text-2xl">Subscrição Ativada!</CardTitle>
            <CardDescription>
              Obrigado por subscreveres ao PRETOS MUSIC
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              A tua subscrição foi ativada com sucesso. Agora tens acesso a todas as funcionalidades premium.
            </p>
            <Button asChild className="w-full">
              <Link href="/">
                Começar a Usar
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

