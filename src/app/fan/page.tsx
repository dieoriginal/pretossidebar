"use client";

import { usePublicProjects } from "@/hooks/use-public-projects";
import { usePublicEvents } from "@/hooks/use-public-events";
import { ProgressCard } from "@/components/public/ProgressCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Music, CalendarClock, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FanHomePage() {
  const { projects, loading: projectsLoading } = usePublicProjects();
  const { events, loading: eventsLoading } = usePublicEvents();

  const singles = projects.filter((p) => p.type === "single");
  const activeEvents = events.filter((e) => {
    const eventDate = new Date(e.date);
    return eventDate >= new Date();
  });

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Bem-vindo</h1>
        <p className="text-muted-foreground">
          Acompanha o progresso dos projetos em desenvolvimento
        </p>
      </div>

      {/* Singles em Produção */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-semibold">Singles em Produção</h2>
          </div>
          <Link href="/fan/singles">
            <Button variant="ghost">Ver todos</Button>
          </Link>
        </div>

        {projectsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-2 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : singles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {singles.slice(0, 6).map((project) => (
              <ProgressCard key={project.id} project={project} type="single" />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum single em produção no momento
            </CardContent>
          </Card>
        )}
      </section>

      {/* Eventos Próximos */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-semibold">Próximos Eventos</h2>
          </div>
          <Link href="/fan/events">
            <Button variant="ghost">Ver todos</Button>
          </Link>
        </div>

        {eventsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-2 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : activeEvents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeEvents.slice(0, 6).map((event) => (
              <ProgressCard key={event.id} event={event} type="event" />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum evento próximo no momento
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
