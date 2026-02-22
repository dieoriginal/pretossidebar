/**
 * Página de Ajuda e FAQ
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/layout/app-shell";

const faqs = [
  {
    question: "Como começo a usar o PRETOS MUSIC?",
    answer: "Cria uma conta gratuita e começa imediatamente. Tens 14 dias de trial grátis para experimentar todas as funcionalidades.",
  },
  {
    question: "Quanto custa a subscrição?",
    answer: "Apenas 5€ por ano - menos de 0.50€ por mês. Um preço acessível para artistas underground em Portugal.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim, podes cancelar a tua subscrição a qualquer momento. Não há compromissos de longo prazo.",
  },
  {
    question: "Os meus dados estão seguros?",
    answer: "Sim, todos os dados são guardados localmente no teu navegador e sincronizados de forma segura. Respeitamos totalmente o RGPD.",
  },
  {
    question: "Posso exportar os meus dados?",
    answer: "Sim, podes exportar todos os teus projetos e eventos em PDF a qualquer momento.",
  },
  {
    question: "Quantos projetos posso criar?",
    answer: "Com a subscrição anual, podes criar até 50 projetos de música e 20 eventos. No trial grátis, tens 3 projetos e 1 evento.",
  },
  {
    question: "Funciona offline?",
    answer: "Sim, a aplicação funciona offline. Os dados são guardados localmente e sincronizados quando há conexão.",
  },
  {
    question: "Preciso de cartão de crédito para o trial?",
    answer: "Não, o trial de 14 dias é completamente gratuito e não requer cartão de crédito.",
  },
];

export default function HelpPage() {
  return (
    <AppShell title="Ajuda">
      <div className="container py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <HelpCircle className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h1 className="mb-4 text-4xl font-bold">Centro de Ajuda</h1>
            <p className="text-lg text-muted-foreground">
              Encontra respostas para as tuas perguntas
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Perguntas Frequentes</CardTitle>
              <CardDescription>
                As respostas às perguntas mais comuns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Mail className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Contacto por Email</CardTitle>
                <CardDescription>
                  Envia-nos um email e responderemos em 24h
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <a href="mailto:support@pretosmusic.com">
                    support@pretosmusic.com
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MessageCircle className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Suporte em Tempo Real</CardTitle>
                <CardDescription>
                  Chat com a nossa equipa (em breve)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  Em Breve
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

