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
  Music,
  Sliders,
  Rocket,
  Headphones,
  Wrench,
  MessageSquare,
  Instagram,
  Radio,
  Video,
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

export default function PromotionProcessPage() {
  const [phases, setPhases] = useState<Phase[]>([
    {
      title: "LANÇAMENTO",
      icon: <Rocket className="h-5 w-5 text-orange-400" />,
      locked: false,
      steps: [
        {
          id: "launch-1",
          label: "PROMOÇÃO HARDCORE",
          completed: false,
          required: true,
        },
      ],
    },
    {
      title: "YOUTUBE",
      icon: <Music className="h-5 w-5 text-red-400" />,
      locked: true,
      steps: [
        {
          id: "youtube-1",
          label: "YOUTUBE ADS",
          completed: false,
          required: true,
        },
        {
          id: "youtube-2",
          label: "BOOST VIEWS",
          completed: false,
          required: true,
        },
        {
          id: "youtube-3",
          label: "50K VIEWS FROM REAL PORTUGAL PEOPLE",
          completed: false,
          required: true,
        },
      ],
    },
    {
      title: "SPOTIFY PLAYLISTS",
      icon: <Music className="h-5 w-5 text-green-400" />,
      locked: true,
      steps: [
        {
          id: "spotify-1",
          label: "SALÁRIO MINIMO",
          completed: false,
          required: true,
        },
        {
          id: "spotify-2",
          label: "RAP CAVIAR",
          completed: false,
          required: true,
        },
      ],
    },
    {
      title: "YOUTUBE",
      icon: <Music className="h-5 w-5 text-red-400" />,
      locked: true,
      steps: [
        {
          id: "youtube2-1",
          label: "YOUTUBE ADS",
          completed: false,
          required: true,
        },
        {
          id: "youtube2-2",
          label: "YOUTUBE PLAYLISTS",
          completed: false,
          required: true,
        },
      ],
    },
    {
      title: "DISCORD",
      icon: <MessageSquare className="h-5 w-5 text-blue-400" />,
      locked: true,
      steps: [
        {
          id: "discord-1",
          label: "DISCORD SERVER",
          completed: false,
          required: true,
        },
        {
          id: "discord-2",
          label: "SERVERS PORTUGUESES",
          completed: false,
          required: true,
        },
        {
          id: "discord-3",
          label: "YOUTUBE PORTUGAL TRAP PLAYLISTS",
          completed: false,
          required: true,
        },
      ],
    },
    {
      title: "IG PROMO PAGES",
      icon: <Instagram className="h-5 w-5 text-pink-400" />,
      locked: true,
      steps: [
        {
          id: "ig-1",
          label: "TRAPWAVES",
          completed: false,
          required: true,
        },
      ],
    },
    {
      title: "RADIO PLACEMENT (ORTUGAL)",
      icon: <Radio className="h-5 w-5 text-purple-400" />,
      locked: true,
      steps: [
        {
          id: "radio-1",
          label: "RADIO PLACEMENT (ORTUGAL)",
          completed: false,
          required: true,
        },
      ],
    },
    {
      title: "CANAIS DE MÚSICA",
      icon: <Music className="h-5 w-5 text-yellow-400" />,
      locked: true,
      steps: [
        {
          id: "music-1",
          label: "AFRO MUSIC PORTUGAL",
          completed: false,
          required: true,
        },
      ],
    },
    {
      title: "INSTAGRAM/TIKTOK ADS",
      icon: <Instagram className="h-5 w-5 text-pink-400" />,
      locked: true,
      steps: [
        {
          id: "insta-1",
          label: "INSTAGRAM AD",
          completed: false,
          required: true,
        },
        {
          id: "tiktok-1",
          label: "TIKTOK AD",
          completed: false,
          required: true,
        },
      ],
    },
    {
      title: "SNIPPET/REEL",
      icon: <Video className="h-5 w-5 text-blue-400" />,
      locked: true,
      steps: [
        {
          id: "snippet-1",
          label: "SNIPPET/REEL ESTILO TRILLER",
          completed: false,
          required: true,
        },
      ],
    },
    {
      title: "INSTAGRAM FLEX POST",
      icon: <Instagram className="h-5 w-5 text-pink-400" />,
      locked: true,
      steps: [
        {
          id: "insta-flex-1",
          label: "INSTAGRAM FLEX POST",
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

    // For promotional campaigns, add any necessary confirmation checks here
    // (e.g., specific KPIs validation)
    step.completed = !step.completed;

    // Unlock next phase if all required steps of current phase are completed
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
    <ContentLayout title="Workflow de Lançamento">
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
                window.location.href = "/next-step";
              }
            }}
          >
            <Rocket className="mr-2 h-4 w-4" />
            Finalizar Promoção
          </Button>
        </div>

        {!allRequiredCompleted && (
          <div className="text-center p-4 bg-red-900/30 rounded-lg border border-red-400/50">
            <p className="text-red-400 animate-pulse">
              ⚠️ Complete todas as etapas obrigatórias para finalizar a promoção
            </p>
          </div>
        )}
      </div>
    </ContentLayout>
  );
}
