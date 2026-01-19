"use client";

import { usePublicEvent } from "@/hooks/use-public-events";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock, MapPin, Users, Ticket } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ProjectTimeline } from "@/components/public/ProjectTimeline";

export default function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { event, loading, error } = usePublicEvent(params.id);

  if (loading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-6 w-48 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">
              {error || "Evento não encontrado"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{event.eventName}</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4" />
            <span>
              {event.date && format(new Date(event.date), "d MMM yyyy 'às' HH:mm", { locale: ptBR })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{event.venue}</span>
          </div>
          {event.capacity > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Lotação: {event.capacity}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{event.progress}%</span>
                <Badge variant={event.progress === 100 ? "default" : "secondary"}>
                  {event.progress === 100 ? "Confirmado" : "Em planeamento"}
                </Badge>
              </div>
              <Progress value={event.progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Etapa {event.currentStep + 1} de {event.totalSteps}
              </p>
            </div>
          </CardContent>
        </Card>

        {event.ticketPrice && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Bilhetes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{event.ticketPrice}€</span>
              </div>
              {event.soldTickets !== undefined && event.totalTickets !== undefined && (
                <p className="text-xs text-muted-foreground mt-2">
                  {event.soldTickets} / {event.totalTickets} vendidos
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tipo de Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-sm">
              {event.eventType}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {event.description && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {event.description}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Timeline do Planeamento</CardTitle>
          <CardDescription>
            Acompanha o progresso através das etapas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectTimeline
            currentStep={event.currentStep}
            totalSteps={event.totalSteps}
          />
        </CardContent>
      </Card>
    </div>
  );
}
