/**
 * Landing Page Pública
 * Página inicial antes do login
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Music, CalendarClock, ShoppingBag, Users, Zap, Shield, Cloud } from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: Music,
      title: "Música e Videoclipe",
      description: "Criação e produção musical completa",
    },
    {
      icon: CalendarClock,
      title: "Planeamento de Eventos",
      description: "Gestão completa de concertos e eventos",
    },
    {
      icon: ShoppingBag,
      title: "Merchandise",
      description: "Gestão de produtos e vendas",
    },
    {
      icon: Users,
      title: "Multi-processo",
      description: "10+ processos diferentes disponíveis",
    },
    {
      icon: Zap,
      title: "Auto-save",
      description: "Nunca perca o seu trabalho",
    },
    {
      icon: Cloud,
      title: "Sincronização Cloud",
      description: "Aceda aos seus projetos em qualquer lugar",
    },
  ];

  const pricingFeatures = [
    "50 projetos de música",
    "20 eventos/concertos",
    "Exportação PDF ilimitada",
    "Templates profissionais",
    "Suporte por email",
    "Sincronização cloud",
    "Processos personalizados",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">PRETOS MUSIC</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Começar Grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            A Plataforma Completa para
            <span className="text-primary"> Artistas Underground</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Gestão profissional de música, eventos, merch e muito mais.
            Tudo o que precisas para levar a tua carreira ao próximo nível.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8">
                Começar Agora - 5€/ano
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Ver Demo
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            14 dias grátis • Sem cartão de crédito • Cancele quando quiser
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">
          Tudo o que precisas num só lugar
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <feature.icon className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Preço Acessível para Artistas Underground
          </h2>
          <Card className="mx-auto max-w-md border-2 border-primary">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Underground Annual</CardTitle>
              <div className="mt-4">
                <span className="text-5xl font-bold">5€</span>
                <span className="text-muted-foreground">/ano</span>
              </div>
              <CardDescription className="mt-2">
                Menos de 0.50€ por mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {pricingFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard">
                <Button className="mt-6 w-full" size="lg">
                  Começar Agora
                </Button>
              </Link>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Teste grátis por 14 dias
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Pronto para começar?
            </h2>
            <p className="mb-8 text-lg opacity-90">
              Junta-te a centenas de artistas que já estão a usar PRETOS MUSIC
            </p>
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Criar Conta Grátis
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Music className="w-5 h-5 text-primary" />
                <span className="font-bold">PRETOS MUSIC</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A plataforma completa para artistas underground em Portugal.
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Produto</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:underline">Features</Link></li>
                <li><Link href="/pricing" className="hover:underline">Preços</Link></li>
                <li><Link href="/templates" className="hover:underline">Templates</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Suporte</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:underline">Ajuda</Link></li>
                <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
                <li><Link href="/contact" className="hover:underline">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:underline">Privacidade</Link></li>
                <li><Link href="/terms" className="hover:underline">Termos</Link></li>
                <li><Link href="/gdpr" className="hover:underline">RGPD</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            © 2025 PRETOS MUSIC. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
