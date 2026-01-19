/**
 * Página de Checkout
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, Check } from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptions";

function CheckoutFallback() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold">Escolhe o Teu Plano</h1>
        <Card className="border-2 border-yellow-500/40">
          <CardHeader>
            <CardTitle>Clerk não configurado</CardTitle>
            <CardDescription>
              Para ativar checkout/autenticação, define <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> e{" "}
              <code>CLERK_SECRET_KEY</code> nas variáveis de ambiente (Vercel → Project → Settings → Environment Variables).
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

function CheckoutWithClerk() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[0]);

  const handleCheckout = async () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/subscriptions/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan.id }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold">Escolhe o Teu Plano</h1>

        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="text-2xl">{selectedPlan.name}</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">{selectedPlan.price}€</span>
              <span className="text-muted-foreground">/{selectedPlan.interval === 'year' ? 'ano' : 'mês'}</span>
            </div>
            <CardDescription>
              {selectedPlan.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>{selectedPlan.features.maxProjects} projetos</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>{selectedPlan.features.maxEvents} eventos</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Exportação PDF ilimitada</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Templates profissionais</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Suporte por email</span>
              </li>
            </ul>
            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A processar...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pagar {selectedPlan.price}€/ano
                </>
              )}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Pagamento seguro via Stripe • Cancele quando quiser
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured =
    typeof clerkPublishableKey === "string" &&
    /^pk_(test|live)_[A-Za-z0-9]+$/.test(clerkPublishableKey) &&
    !clerkPublishableKey.includes("XXXX") &&
    !clerkPublishableKey.includes("xxxx");  if (!isClerkConfigured) return <CheckoutFallback />;
  return <CheckoutWithClerk />;
}
