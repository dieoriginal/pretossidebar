"use client";

import { usePublicEvents } from "@/hooks/use-public-events";
import { ProgressCard } from "@/components/public/ProgressCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock } from "lucide-react";

export default function EventsPage() {
  const { events, loading } = usePublicEvents();

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <CalendarClock className="w-6 h-6 text-primary" />
          <h1 className="text-4xl font-bold">Eventos Planeados</h1>
        </div>
        <p className="text-muted-foreground">
          Acompanha o progresso dos eventos em planeamento
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <ProgressCard key={event.id} event={event} type="event" />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum evento em planeamento no momento
          </CardContent>
        </Card>
      )}
    </div>
  );
}
