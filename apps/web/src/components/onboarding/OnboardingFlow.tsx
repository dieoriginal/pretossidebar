/**
 * Sistema de Onboarding
 * Tutorial interativo para novos usuários
 */

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, CalendarClock, FileText, CheckCircle2, ArrowRight, X } from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao PRETOS MUSIC",
    description: "A plataforma completa para artistas underground",
    icon: Music,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Vamos fazer um tour rápido pelas funcionalidades principais.
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Gestão completa de projetos musicais
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Planeamento de eventos e concertos
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Exportação profissional em PDF
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "projects",
    title: "Projetos de Música",
    icon: Music,
    description: "Cria e gere os teus projetos musicais",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Cada projeto inclui todas as etapas de produção:
        </p>
        <ul className="space-y-2 text-sm">
          <li>• Composição e letras</li>
          <li>• Gravação e produção</li>
          <li>• Videoclipe</li>
          <li>• Lançamento e marketing</li>
        </ul>
      </div>
    ),
  },
  {
    id: "events",
    title: "Planeamento de Eventos",
    icon: CalendarClock,
    description: "Organiza concertos e eventos",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Sistema completo de planeamento:
        </p>
        <ul className="space-y-2 text-sm">
          <li>• Setlist e notas de ensaio</li>
          <li>• Itinerário do dia do show</li>
          <li>• Logística e vestuário</li>
          <li>• Exportação em PDF</li>
        </ul>
      </div>
    ),
  },
  {
    id: "features",
    title: "Funcionalidades Principais",
    icon: FileText,
    description: "Descobre o que podes fazer",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Auto-save</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Os teus dados são guardados automaticamente
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">PDF Export</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Exporta tudo em PDF profissional
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Modelos pré-configurados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Multi-processo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                10+ processos diferentes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
];

interface OnboardingFlowProps {
  open: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingFlow({ open, onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = onboardingSteps[currentStep];
  const StepIcon = step.icon;
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <StepIcon className="h-6 w-6 text-primary" />
            <DialogTitle>{step.title}</DialogTitle>
          </div>
          <DialogDescription>{step.description}</DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <Progress value={progress} className="mb-6" />
          {step.content}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                Anterior
              </Button>
            )}
            <Button variant="ghost" onClick={onSkip}>
              Saltar
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} de {onboardingSteps.length}
            </span>
            <Button onClick={handleNext}>
              {currentStep === onboardingSteps.length - 1 ? "Começar" : "Próximo"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

