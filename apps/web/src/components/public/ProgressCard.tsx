"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PublicProject, PublicEvent } from "@/types/public";
import Link from "next/link";
import { Music, CalendarClock, ShoppingBag, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

interface ProgressCardProps {
  project?: PublicProject;
  event?: PublicEvent;
  type: "single" | "event" | "merch";
}

export function ProgressCard({ project, event, type }: ProgressCardProps) {
  if (type === "single" && project) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{project.title}</CardTitle>
              <CardDescription className="mt-1">
                {project.artist}
                {project.featuring && project.featuring.length > 0 && (
                  <span className="ml-1">
                    ft. {project.featuring.join(", ")}
                  </span>
                )}
              </CardDescription>
            </div>
            <Music className="w-5 h-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Etapa {project.currentStep + 1} de {project.totalSteps}
              </span>
              <Badge variant="outline" className="text-xs">
                {project.progress < 50 ? "Em produção" : project.progress < 100 ? "Quase pronto" : "Concluído"}
              </Badge>
            </div>
            <Link href={`/fan/singles/${project.id}`}>
              <div className="flex items-center gap-2 text-sm text-primary hover:underline mt-2">
                Ver detalhes
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === "event" && event) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{event.eventName}</CardTitle>
              <CardDescription className="mt-1">
                {event.venue} • {event.date && format(new Date(event.date), "d MMM yyyy", { locale: ptBR })}
              </CardDescription>
            </div>
            <CalendarClock className="w-5 h-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{event.progress}%</span>
              </div>
              <Progress value={event.progress} className="h-2" />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Etapa {event.currentStep + 1} de {event.totalSteps}
              </span>
              <Badge variant="outline" className="text-xs">
                {event.progress < 50 ? "Em planeamento" : event.progress < 100 ? "Quase pronto" : "Confirmado"}
              </Badge>
            </div>
            {event.ticketPrice && (
              <div className="text-sm">
                <span className="text-muted-foreground">Bilhetes: </span>
                <span className="font-medium">{event.ticketPrice}€</span>
              </div>
            )}
            <Link href={`/fan/events/${event.id}`}>
              <div className="flex items-center gap-2 text-sm text-primary hover:underline mt-2">
                Ver detalhes
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}



