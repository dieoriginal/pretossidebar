"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  XCircle, 
  Mail, 
  Calendar,
  MapPin,
  AlertTriangle,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import { calculateEventCompletion } from "@/lib/event-completion-tracker";

interface EventCompletionCardProps {
  event: any;
  onEmailVenue?: (event: any) => void;
  onEdit?: (event: any) => void;
}

export function EventCompletionCard({ event, onEmailVenue, onEdit }: EventCompletionCardProps) {
  const completion = calculateEventCompletion(event.data || event);
  
  const criticalSteps = [
    { key: "emailSent", label: "Email enviado", icon: Mail },
    { key: "venueConfirmed", label: "Venue confirmou", icon: CheckCircle2 },
    { key: "technicalRider", label: "Rider técnico", icon: AlertTriangle },
    { key: "schedule", label: "Horários", icon: Calendar },
    { key: "ticketPolicy", label: "Política bilhetes", icon: MapPin },
  ];

  return (
    <Card className={cn(
      "transition-all hover:shadow-lg",
      completion.isComplete 
        ? "border-green-500 bg-green-50/50 dark:bg-green-900/10" 
        : "border-red-500 bg-red-50/50 dark:bg-red-900/10"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{event.eventName || event.title}</CardTitle>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {event.date && new Date(event.date).toLocaleDateString('pt-PT', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>
          <EventStatusBadge status={completion} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Progresso</span>
            <span className="font-semibold">{completion.completionPercentage}%</span>
          </div>
          <Progress 
            value={completion.completionPercentage} 
            className={cn(
              completion.isComplete ? "bg-green-200" : "bg-red-200"
            )}
          />
        </div>

        {/* Critical Steps */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Passos Críticos:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {criticalSteps.map((step) => {
              const isComplete = completion.criticalSteps[step.key as keyof typeof completion.criticalSteps];
              const Icon = step.icon;
              
              return (
                <div
                  key={step.key}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded text-xs",
                    isComplete
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Missing Steps */}
        {completion.missingSteps.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-red-600 dark:text-red-400">
              Faltam {completion.missingSteps.length} passo(s):
            </div>
            <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1">
              {completion.missingSteps.slice(0, 3).map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
              {completion.missingSteps.length > 3 && (
                <li className="text-slate-400">+{completion.missingSteps.length - 3} mais...</li>
              )}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          {onEmailVenue && !completion.criticalSteps.emailSent && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onEmailVenue(event)}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Email
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(event)}
              className="flex-1"
            >
              Editar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}




