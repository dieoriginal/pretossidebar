"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectTimelineProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_NAMES = [
  "Maquete",
  "Gravação",
  "Vestuário",
  "Orçamento",
  "Filmagem",
  "Fotografia",
  "Edição de Vídeo",
  "Contratualização",
  "Direitos Autorais",
  "Lançamento",
];

export function ProjectTimeline({ currentStep, totalSteps }: ProjectTimelineProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index <= currentStep;
        const isCurrent = index === currentStep;
        const stepName = STEP_NAMES[index] || `Etapa ${index + 1}`;

        return (
          <div
            key={index}
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg border transition-colors",
              isCompleted && "bg-primary/5 border-primary/20",
              isCurrent && "ring-2 ring-primary"
            )}
          >
            <div className="flex-shrink-0">
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6 text-primary" />
              ) : (
                <Circle className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <div
                className={cn(
                  "font-medium",
                  isCompleted ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {stepName}
              </div>
              {isCurrent && (
                <div className="text-sm text-primary mt-1">Em progresso...</div>
              )}
            </div>
            {isCompleted && (
              <div className="text-xs text-muted-foreground">
                Concluído
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}



