"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Lock,
  Mic,
  Music,
  Sliders,
  Rocket,
  Headphones,
  Wrench, // substituindo Tool por Wrench
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Step = {
  id: string;
  label: string;
  completed: boolean;
  required?: boolean;
};

type Phase = {
  title: string;
  icon: JSX.Element;
  steps: Step[];
  locked: boolean;
};

export default function RecordingProcessPage() {
  const [phases, setPhases] = useState<Phase[]>([
    // 1. Pré-Produção
    {
      title: "Organização do Espaço de Gravação",
      icon: <Music className="h-5 w-5 text-purple-400" />,
      locked: false,
      steps: [
        {
          id: "pre-1",
          label:
            "Limpeza Geral com Luvas",
          completed: false,
          required: true,
        },
        {
          id: "pre-2",
          label:
            "Organização estrategica e sistemática",
          completed: false,
          required: true,
        },
        {
          id: "pre-3",
          label:
            "Preparar Água",
          completed: false,
          required: true,
        },
        {
          id: "pre-3",
          label:
            "Comer o Almoço",
          completed: false,
          required: true,
        },
        {
          id: "pre-3",
          label:
            "Snacks",
          completed: false,
          required: true,
        },
        {
          id: "pre-3",
          label:
            "Snacks",
          completed: false,
          required: true,
        },
        {
          id: "pre-3",
          label:
            "Impressão das Letras Musicais",
          completed: false,
          required: true,
        },
   
   
      ],
    },
    // 2. Seleção e Preparação do Gear
    {
      title: "Preparação do Gear",
      icon: <Wrench className="h-5 w-5 text-yellow-400" />,
      locked: true,
      steps: [
        {
          id: "gear-1",
          label:
            "UAD APOLLO - Gravação em Tempo Real",
          completed: false,
          required: true,
        },
        {
          id: "gear-2",
          label: "NEUMANN TLM 103 - Qualidade de Alta Definição",
          completed: false,
          required: true,
        },
        {
          id: "gear-3",
          label: "BOOTH - Isolamento Acústico Robusto",
          completed: false,
          required: true,
        },
        {
          id: "gear-4",
          label: "K&M 21430 - Tripé com altitude tipo Lil Wayne",
          completed: false,
          required: true,
        },
        {
          id: "gear-4",
          label: "SUPORTE DE COMPUTADOR - Deixar o Computador Fora do Booth",
          completed: false,
          required: true,
        },
        {
          id: "gear-4",
          label: "MONITOR NO BOOTH - Ver o Ecrã do PC dentro do Booth",
          completed: false,
          required: true,
        },
        {
          id: "gear-4",
          label: "TRIPÉ DE MONITOR - Suportar o monitor no Booth",
          completed: false,
          required: true,
        },
        {
          id: "gear-4",
          label: "MOUSE SEM FIOS - Opcional para controle do PC dentro do Booth",
          completed: false,
          required: true,
        },

        {
          id: "gear-4",
          label: "PreSonus Faderport V2 OU Tascam DP-02CF - Controle de DAW profissional",
          completed: false,
          required: true,
        },
        {
          id: "gear-4",
          label: "Beyerdynamics DT-770 250 OHM - Auscutadores de Alta definição",
          completed: false,
          required: true,
        },
        {
          id: "gear-4",
          label: "Shiit DAC - TOPPING L70, DX3, A50 II, Atom Amp, JDS Labs Atom+,  Topping L30 II/E30 II stack  - Para dar energia 250 Ohm para os auscutadores",
          completed: false,
          required: true,
        },
        {
          id: "gear-4",
          label: "Schiit Loki Mini+ - Para equalizar os auscutadores",
          completed: false,
          required: true,
        },
      ],
      
    },
    // 3. Setup do Estúdio e do Gear
    {
      title: "Setup do Estúdio e do Gear",
      icon: <Headphones className="h-5 w-5 text-blue-400" />,
      locked: true,
      steps: [
        {
          id: "setup-1",
          label:
            "Posicionar microfones e instrumentos conforme a acústica do ambiente",
          completed: false,
          required: true,
        },
        {
          id: "setup-2",
          label:
            "Realizar testes de sinal para identificar ruídos ou interferências",
          completed: false,
          required: true,
        },
      ],
    },
    // 4. Configuração do Software (DAW)
    {
      title: "LUNA",
      icon: <Sliders className="h-5 w-5 text-green-400" />,
      locked: true,
      steps: [
        {
          id: "daw-1",
          label:
            "Carregar template de gravação já feita ",
          completed: false,
          required: true,
        },
        {
          id: "daw-2",
          label:
            "Carregar template do UAD Console ",
          completed: false,
          required: true,
        },
        {
          id: "daw-2",
          label:
            "Fazer o Levelling ",
          completed: false,
          required: true,
        },
        {
          id: "daw-2",
          label: "Certificar Gravação em Tempo Real",
          completed: false,
          required: true,
        },
        {
          id: "daw-2",
          label: "Ativar Control Surface",
          completed: false,
          required: true,
        },
        {
          id: "daw-2",
          label: "Conectar Botões e Mixer no DAW Controler",
          completed: false,
          required: true,
        },
      ],
    },
    // 5. Ajuste de Níveis (Leveling & Track Setup)
    {
      title: "Ajuste de Níveis (Leveling & Track Setup)",
      icon: <Sliders className="h-5 w-5 text-indigo-400" />,
      locked: true,
      steps: [
        {
          id: "level-1",
          label:
            "Configurar ganho e headroom  em torno de -18dBFS",
          completed: false,
          required: true,
        },
        {
          id: "level-2",
          label: "Organizar o roteamento de sinais para cada Track e os seus presets",
          completed: false,
          required: true,
        },
      ],
    },
    // 6. Ensaios/Rehearsals
    {
      title: "Ensaios/Rehearsals",
      icon: <Mic className="h-5 w-5 text-red-400" />,
      locked: true,
      steps: [
        {
          id: "rehearsal-1",
          label:
            "Realizar 2 a 4 rodadas de ensaio para ajustar performance e dinâmica",
          completed: false,
          required: true,
        },
        {
          id: "rehearsal-2",
          label:
            "Validar todo o setup técnico (níveis, roteamento, etc.) durante os ensaios",
          completed: false,
          required: true,
        },
      ],
    },
    // 7. Gravação Oficial (Tracking)
    {
      title: "Gravação Oficial (Tracking)",
      icon: <Mic className="h-5 w-5 text-blue-400" />,
      locked: true,
      steps: [
        {
          id: "tracking-1",
          label: "Dia 1: Voz Principal (Lead) - Takes completos, foco no tom e presença",
          completed: false,
          required: true,
        },
        {
          id: "tracking-2",
          label: "Dia 2: Dobras e Harmonias - Reforço vocal e camadas melódicas",
          completed: false,
          required: true,
        },
        {
          id: "tracking-3",
          label: "Dia 3: Adlibs - Energia, criatividade, sem poluir",
          completed: false,
          required: true,
        },
        {
          id: "tracking-4",
          label: "Dia 4: Stacks & Oitavas - Para refrões, punchlines, partes de destaque",
          completed: false,
          required: true,
        },
        {
          id: "tracking-5",
          label: "Dia 5: FX / Texturas Vocais - Delays, reversos, glitches, pitch FX",
          completed: false,
          required: true,
        },
        {
          id: "tracking-6",
          label: "Dia 6: Intro/Outro / Voz Ambiente - Freestyles, frases soltas, ruído de fundo",
          completed: false,
          required: true,
        },
      ],
    },
    // 8. Pós-Gravação: Edição e Comping
    {
      title: "Pós-Gravação: Edição e Comping",
      icon: <Headphones className="h-5 w-5 text-purple-400" />,
      locked: true,
      steps: [
        {
          id: "post-1",
          label:
            "Compilar as melhores partes (comping) para formar uma performance coesa",
          completed: false,
          required: true,
        },
        {
          id: "post-2",
          label:
            "Realizar ajustes finos (timing, pitch) sem comprometer a naturalidade",
          completed: false,
          required: true,
        },
      ],
    },
    // 9. Mixagem
    {
      title: "Mixagem",
      icon: <Sliders className="h-5 w-5 text-green-400" />,
      locked: true,
      steps: [
        {
          id: "mix-1",
          label:
            "Balancear volumes e equalizar cada faixa para integração harmoniosa",
          completed: false,
          required: true,
        },
        {
          id: "mix-2",
          label:
            "Aplicar compressão, reverb, delay e panorâmicas para criar profundidade",
          completed: false,
          required: true,
        },
      ],
    },
    // 10. Masterização
    {
      title: "Masterização",
      icon: <Rocket className="h-5 w-5 text-orange-400" />,
      locked: true,
      steps: [
        {
          id: "master-1",
          label:
            "Ajustar equalização final, compressão e limitação (True Peak, LUFS)",
          completed: false,
          required: true,
        },
        {
          id: "master-2",
          label:
            "Verificar otimização para diferentes plataformas e sistemas de reprodução",
          completed: false,
          required: true,
        },
      ],
    },
  ]);

  const totalSteps = phases.flatMap((p) => p.steps).length;
  const completedSteps = phases
    .flatMap((p) => p.steps)
    .filter((s) => s.completed).length;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  const handleStepToggle = (phaseIndex: number, stepIndex: number) => {
    const newPhases = [...phases];
    const step = newPhases[phaseIndex].steps[stepIndex];

    if (!step.completed) {
      // Optional confirmation dialogs for key technical checks:
      if (step.id === "level-1" && !confirm("Verificou que o pico está em -6dBFS?"))
        return;
      if (
        step.id === "master-1" &&
        !confirm("Verificou a equalização final, compressão e limitação?")
      )
        return;
    }

    step.completed = !step.completed;

    // Unlock the next phase when all required steps in the current phase are completed
    if (phaseIndex < phases.length - 1) {
      const allRequiredCompleted = newPhases[phaseIndex].steps
        .filter((s) => s.required)
        .every((s) => s.completed);
      newPhases[phaseIndex + 1].locked = !allRequiredCompleted;
    }

    setPhases(newPhases);
  };

  const allRequiredCompleted = phases.every((phase) =>
    phase.steps.filter((s) => s.required).every((s) => s.completed)
  );

  return (
    <ContentLayout title="Workflow de Gravação Completo">
      <div className="space-y-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-300">
                  Progresso Total
                </h3>
                <p className="text-slate-400">
                  {completedSteps}/{totalSteps} etapas completas
                </p>
              </div>
              <Badge
                variant="outline"
                className="border-purple-400 text-purple-400 text-lg"
              >
                {completionPercentage}%
              </Badge>
            </div>
            <Progress value={completionPercentage} className="h-3 bg-slate-700" />
          </CardContent>
        </Card>

        <div className="space-y-6">
          {phases.map((phase, phaseIndex) => (
            <Card
              key={phase.title}
              className={`bg-slate-800 border-2 ${
                phase.locked ? "border-red-500/30" : "border-slate-700"
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center space-x-3">
                  {phase.locked ? (
                    <Lock className="h-6 w-6 text-red-400" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  )}
                  <CardTitle className="text-xl font-semibold">
                    {phase.title}
                    {phase.locked && (
                      <span className="text-red-400 ml-2 text-sm">
                        (Desbloqueie completando a fase anterior)
                      </span>
                    )}
                  </CardTitle>
                </div>
                {phase.icon}
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {phase.steps.map((step, stepIndex) => (
                    <div
                      key={step.id}
                      className={`p-4 rounded-lg ${
                        step.completed
                          ? "bg-green-900/20 border border-green-400/30"
                          : "bg-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Switch
                            id={step.id}
                            checked={step.completed}
                            onCheckedChange={() =>
                              handleStepToggle(phaseIndex, stepIndex)
                            }
                            disabled={phase.locked}
                          />
                          <Label
                            htmlFor={step.id}
                            className={`text-sm ${
                              step.completed
                                ? "text-green-400 line-through"
                                : "text-slate-300"
                            }`}
                          >
                            {step.label}
                            {step.required && (
                              <span className="text-red-400 ml-2">*</span>
                            )}
                          </Label>
                        </div>
                        {step.required && !step.completed && (
                          <Badge variant="destructive" className="animate-pulse">
                            Obrigatório
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="bg-slate-700" />

        <div className="flex justify-end space-x-4">
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            disabled={!allRequiredCompleted}
            onClick={() => {
              if (allRequiredCompleted) {
                window.location.href = "/vestuario";
              }
            }}
          >
            <Rocket className="mr-2 h-4 w-4" />
            Finalizar Produção
          </Button>
        </div>

        {!allRequiredCompleted && (
          <div className="text-center p-4 bg-red-900/30 rounded-lg border border-red-400/50">
            <p className="text-red-400 animate-pulse">
              ⚠️ Complete todas as etapas obrigatórias para finalizar a produção
            </p>
          </div>
        )}
      </div>
    </ContentLayout>
  );
}
