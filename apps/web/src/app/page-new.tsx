"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Music, Users, Ticket, DollarSign, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-background border-b">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Crie e Gerencie Seus Eventos
              <span className="block text-primary mt-2">em 6 Passos Simples</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A plataforma completa para artistas criarem eventos, reservarem venues,
              contratarem serviços e venderem bilhetes. Tudo em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link href="/events/create">Criar Evento</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/events">Descobrir Eventos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona - 6 Passos */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Como Funciona</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Crie seu evento completo em apenas 6 passos simples
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { step: 1, title: "Escolher Venue", desc: "Selecione data e local", icon: MapPin },
            { step: 2, title: "Configurar Evento", desc: "Nome, descrição, lineup", icon: Music },
            { step: 3, title: "Contratar Serviços", desc: "Iluminação, som, DJs", icon: Zap },
            { step: 4, title: "Configurar Ticketing", desc: "Preços e quantidades", icon: Ticket },
            { step: 5, title: "Adicionar Staff", desc: "Configure splits de pagamento", icon: Users },
            { step: 6, title: "Publicar", desc: "Revise e publique seu evento", icon: Calendar },
          ].map((item) => (
            <Card key={item.step} className="text-center">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Passo {item.step}</CardTitle>
                <CardDescription>{item.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tudo que Você Precisa</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Uma plataforma completa para gerenciar todos os aspectos do seu evento
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { title: "Booking de Venues", desc: "Reserve casas de shows com calendário interativo", icon: MapPin },
              { title: "Marketplace", desc: "Contrate serviços profissionais", icon: Zap },
              { title: "Ticketing", desc: "Venda bilhetes com QR codes", icon: Ticket },
              { title: "Split Automático", desc: "Divida receitas automaticamente", icon: DollarSign },
            ].map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Pronto para Começar?</CardTitle>
            <CardDescription>
              Crie sua conta e comece a organizar seus eventos hoje mesmo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/sign-up">Criar Conta</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/sign-in">Fazer Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 EventOS Platform. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
