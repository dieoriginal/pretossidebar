"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { usePublicEvent } from "@/hooks/use-public-events";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { Heading } from "@/components/public/events/Heading";
import { Section } from "@/components/public/events/Section";
import { EventCard } from "@/components/public/events/EventCard";
import { CardGroup } from "@/components/public/events/CardGroup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Ticket, Clock } from "lucide-react";
import { usePublicEvents } from "@/hooks/use-public-events";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { event, loading, error } = usePublicEvent(params.id);
  const { events } = usePublicEvents();

  // Buscar outros eventos para mostrar na seção "Outros eventos"
  const otherEvents = events.filter((e) => e.id !== params.id).slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">A carregar evento...</p>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-20">
            <Heading type={2} color="foreground" text="Evento não encontrado" />
            <p className="text-muted-foreground mb-4 mt-2">
              {error || "O evento que procuras não existe ou não está disponível."}
            </p>
            <Button asChild>
              <Link href="/public/concerts">Voltar aos Eventos</Link>
            </Button>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const formattedDate = eventDate.toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedPrice = event.ticketPrice
    ? new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
      }).format(event.ticketPrice)
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        {/* Hero Cover */}
        <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5"
            style={{
              backgroundImage: `url("https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=1200&auto=format&fit=crop")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex h-full flex-col justify-end p-8 text-white">
            <div className="container mx-auto">
              <Button variant="ghost" asChild className="mb-4 text-white hover:bg-white/20">
                <Link href="/public/concerts">← Voltar</Link>
              </Button>
              <Heading type={1} color="white" text={event.eventName} />
              <div className="mt-4 flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{formattedDate}</span>
                </div>
                {event.venue && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{event.venue}</span>
                  </div>
                )}
                {event.capacity > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>Lotação: {event.capacity}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <Section className="bg-background">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Heading type={4} color="foreground" text="Detalhes do Evento" />
              <div className="mt-4 space-y-4 text-muted-foreground">
                {event.description ? (
                  <p className="whitespace-pre-line">{event.description}</p>
                ) : (
                  <p>Mais informações em breve.</p>
                )}
              </div>

              {/* Link para página completa do evento */}
              <div className="mt-8">
                <Button asChild variant="outline">
                  <Link href={`/events/${event.id}`} target="_blank">
                    Ver Página Completa do Evento
                  </Link>
                </Button>
              </div>
            </div>

            <div>
              <div className="rounded-lg border bg-card p-6">
                <div className="space-y-4">
                  <div>
                    <Heading type={4} color="foreground" text="Informações" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Data e Hora</p>
                        <p className="text-sm text-muted-foreground">{formattedDate}</p>
                      </div>
                    </div>

                    {event.venue && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Local</p>
                          <p className="text-sm text-muted-foreground">{event.venue}</p>
                        </div>
                      </div>
                    )}

                    {event.capacity > 0 && (
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Lotação</p>
                          <p className="text-sm text-muted-foreground">{event.capacity} pessoas</p>
                        </div>
                      </div>
                    )}

                    {formattedPrice && (
                      <div className="flex items-start gap-3">
                        <Ticket className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Preço</p>
                          <p className="text-sm font-semibold text-foreground">
                            a partir de {formattedPrice}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {!isPast && formattedPrice && (
                    <div className="pt-4 border-t">
                      <Button className="w-full" size="lg" asChild>
                        <Link href={`/events/${event.id}`}>Ver Bilhetes</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Other Events */}
        {otherEvents.length > 0 && (
          <CardGroup title="Outros Eventos" color="orange" background="gray">
            {otherEvents.map((e) => (
              <EventCard
                key={e.id}
                id={e.id}
                name={e.eventName}
                date={e.date}
                venue={e.venue}
                city={e.city || e.venue}
                price={e.ticketPrice}
                ticketUrl={e.ticketUrl}
                status={
                  e.ticketPrice
                    ? "on-sale"
                    : new Date(e.date) > new Date()
                    ? "announced"
                    : "completed"
                }
                isPast={new Date(e.date) < new Date()}
              />
            ))}
          </CardGroup>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}

