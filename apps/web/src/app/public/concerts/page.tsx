"use client";

import React, { useEffect, useState, useMemo } from "react";
import { usePublicEvents } from "@/hooks/use-public-events";
import { PublicEvent } from "@/types/public";
import { EventCard } from "@/components/public/events/EventCard";
import { CardGroup } from "@/components/public/events/CardGroup";
import { Section } from "@/components/public/events/Section";
import { Heading } from "@/components/public/events/Heading";
import { FormSearch } from "@/components/public/events/FormSearch";
import { CircleButtons } from "@/components/public/events/CircleButtons";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";

type FilterType = "all" | "upcoming" | "past";

export default function ConcertsPage() {
  const { events, loading, error } = usePublicEvents();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  // Separar eventos por data
  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();
    const upcoming: PublicEvent[] = [];
    const past: PublicEvent[] = [];

    events.forEach((event) => {
      const eventDate = new Date(event.date);
      if (eventDate >= now) {
        upcoming.push(event);
      } else {
        past.push(event);
      }
    });

    // Ordenar: próximos por data crescente, passados por data decrescente
    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events]);

  // Filtrar eventos baseado no filtro selecionado
  const filteredEvents = useMemo(() => {
    let filtered: PublicEvent[] = [];

    switch (filter) {
      case "upcoming":
        filtered = upcomingEvents;
        break;
      case "past":
        filtered = pastEvents;
        break;
      default:
        filtered = [...upcomingEvents, ...pastEvents];
    }

    // Aplicar busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.eventName.toLowerCase().includes(query) ||
          event.venue.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [filter, searchQuery, upcomingEvents, pastEvents]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">A carregar eventos...</p>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-destructive mb-4">Erro ao carregar eventos: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-primary hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        {/* Hero Section */}
        <Section className="bg-gradient-to-b from-primary/10 to-background">
          <div className="text-center space-y-4 mb-8">
            <Heading type={1} color="foreground" text="Descobrir Eventos" />
            <p className="text-muted-foreground text-lg">
              Descobre, pesquisa e filtra os melhores eventos.
            </p>
          </div>

          <div className="flex flex-col items-center gap-6 mb-8">
            <FormSearch onSearch={handleSearch} placeholder="Pesquisar eventos, venues, cidades..." />
            <CircleButtons
              buttons={[
                {
                  label: "Todos",
                  active: filter === "all",
                  onClick: () => handleFilterChange("all"),
                },
                {
                  label: "Próximos",
                  active: filter === "upcoming",
                  onClick: () => handleFilterChange("upcoming"),
                },
                {
                  label: "Passados",
                  active: filter === "past",
                  onClick: () => handleFilterChange("past"),
                },
              ]}
            />
          </div>
        </Section>

        {/* Upcoming Events */}
        {filter === "all" || filter === "upcoming" ? (
          <CardGroup
            title={`Próximos Eventos ${upcomingEvents.length > 0 ? `(${upcomingEvents.length})` : ""}`}
            color="blue"
            background="white"
          >
            {filteredEvents
              .filter((e) => !pastEvents.includes(e))
              .map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  name={event.eventName}
                  date={event.date}
                  venue={event.venue}
                  city={event.city || event.venue}
                  price={event.ticketPrice}
                  ticketUrl={event.ticketUrl}
                  status={
                    event.ticketPrice
                      ? "on-sale"
                      : event.date
                      ? new Date(event.date) > new Date()
                        ? "announced"
                        : "completed"
                      : "announced"
                  }
                  isPast={false}
                />
              ))}
          </CardGroup>
        ) : null}

        {/* Past Events */}
        {filter === "all" || filter === "past" ? (
          <CardGroup
            title={`Eventos Passados ${pastEvents.length > 0 ? `(${pastEvents.length})` : ""}`}
            color="orange"
            background="gray"
          >
            {filteredEvents
              .filter((e) => pastEvents.includes(e))
              .map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  name={event.eventName}
                  date={event.date}
                  venue={event.venue}
                  city={event.city || event.venue}
                  price={event.ticketPrice}
                  ticketUrl={event.ticketUrl}
                  status="completed"
                  isPast={true}
                />
              ))}
          </CardGroup>
        ) : null}

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <Section>
            <div className="text-center py-20">
              <Heading type={3} color="muted" text="Nenhum evento encontrado" />
              <p className="text-muted-foreground mt-4">
                {searchQuery
                  ? "Tenta pesquisar com outros termos."
                  : "Ainda não há eventos disponíveis."}
              </p>
            </div>
          </Section>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
