"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  ChevronRight,
  Lock,
  Headphones,
  Mic,
  Music,
  Sliders,
  Rocket,
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
    {
      title: "Pré-Produção",
      icon: <Music className="h-5 w-5 text-purple-400" />,
      locked: false,
      steps: [
        {
          id: "pre-1",
          label: "Definir estrutura da música (versos, refrão, ad-libs)",
          completed: false,
          required: true,
        },
        {
          id: "pre-2",
          label: "Configurar equipamentos (interface, microfone, fones)",
          completed: false,
          required: true,
        },
        {
          id: "pre-3",
          label: "Testar níveis de entrada (pico -6dBFS)",
          completed: false,
          required: true,
        },
      ],
    },
    {
      title: "Gravação",
      icon: <Mic className="h-5 w-5 text-blue-400" />,
      locked: true,
      steps: [
        {
          id: "rec-1",
          label: "Gravar base instrumental (batidas, 808s)",
          completed: false,
          required: true,
        },
        {
          id: "rec-2",
          label: "Take principal vocal",
          completed: false,
          required: true,
        },
        {
          id: "rec-3",
          label: "Ad-libs e harmonias",
          completed: false,
          required: true,
        },
        {
          id: "rec-4",
          label: "Doubling vocal",
          completed: false,
        },
      ],
    },
    {
      title: "Mixagem",
      icon: <Sliders className="h-5 w-5 text-green-400" />,
      locked: true,
      steps: [
        {
          id: "mix-1",
          label: "Balanceamento inicial",
          completed: false,
          required: true,
        },
        {
          id: "mix-2",
          label: "Processamento de efeitos",
          completed: false,
          required: true,
        },
        {
          id: "mix-3",
          label: "Automação de parâmetros",
          completed: false,
        },
      ],
    },
    {
      title: "Masterização",
      icon: <Rocket className="h-5 w-5 text-orange-400" />,
      locked: true,
      steps: [
        {
          id: "master-1",
          label: "Equalização final",
          completed: false,
          required: true,
        },
        {
          id: "master-2",
          label: "Limitação (True Peak -1dBFS)",
          completed: false,
          required: true,
        },
        {
          id: "master-3",
          label: "Verificação LUFS (-14 ±1)",
          completed: false,
          required: true,
        },
      ],
    },
  ]);

  const totalSteps = phases.flatMap((p) => p.steps).length;
  const completedSteps = phases.flatMap((p) => p.steps).filter((s) => s.completed)
    .length;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  const handleStepToggle = (phaseIndex: number, stepIndex: number) => {
    const newPhases = [...phases];
    const step = newPhases[phaseIndex].steps[stepIndex];

    if (!step.completed) {
      // Verify required technical checks
      if (
        step.id === "pre-3" &&
        !confirm("Verificou os níveis de entrada com pico em -6dBFS?")
      )
        return;
      if (
        step.id === "master-2" &&
        !confirm("Verificou o True Peak no limitador?")
      )
        return;
    }

    step.completed = !step.completed;

    // Unlock next phase when all required steps are completed
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
    <ContentLayout title="Workflow de Gravação Obligatório">
     

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
