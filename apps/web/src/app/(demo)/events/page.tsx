// app/events/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllEventsFromIndexedDB, deleteEventFromIndexedDB, saveEventToIndexedDB } from "@/lib/events-db";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, MapPin, Users, CalendarDays, Plus, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventCompletionCard } from "@/components/events/EventCompletionCard";
import { EventCalendar } from "@/components/events/EventCalendar";
import { calculateEventCompletion } from "@/lib/event-completion-tracker";
import { generateTemplatesForYears, getDefaultEventData } from "@/lib/event-templates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { AppShell } from "@/components/layout/app-shell";

interface EventProject {
  id: string;
  title: string;
  eventName: string;
  eventType: string;
  date: string;
  venue: string;
  lastModified: Date;
  data: any;
}

export default function EventsIndexPage() {
  const [savedEvents, setSavedEvents] = useState<EventProject[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [templatesCreated, setTemplatesCreated] = useState(false);

  const loadSavedEvents = async () => {
    try {
      setLoading(true);
      const events = await getAllEventsFromIndexedDB();
      setSavedEvents(events);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedEvents();
    checkAndCreateTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAndCreateTemplates = async () => {
    try {
      const events = await getAllEventsFromIndexedDB();
      const existingTemplates = events.filter((e: any) => e.data?.template === true);

      // Check if we have the correct number of templates (24 per year × 4 years = 96)
      const expectedCount = 24 * 4; // 96 templates for 2026-2029

      if (existingTemplates.length !== expectedCount && !templatesCreated) {
        // Delete old templates first
        for (const oldTemplate of existingTemplates) {
          await deleteEventFromIndexedDB(oldTemplate.id);
        }

        // Create new bi-weekly templates for 2026-2029
        const templates = generateTemplatesForYears(2026, 2029);

        console.log(`Creating ${templates.length} bi-weekly templates...`);

        for (const template of templates) {
          const eventData = getDefaultEventData(template.month, template.year, template.week, template.city);
          await saveEventToIndexedDB({
            id: template.id,
            ...eventData,
            template: true,
          });
        }

        console.log(`✅ Created ${templates.length} templates (${templates.length / 4} per year)`);
        setTemplatesCreated(true);
        await loadSavedEvents();
      } else if (existingTemplates.length === expectedCount) {
        console.log(`✅ Templates already exist: ${existingTemplates.length} templates`);
      }
    } catch (error) {
      console.error('Error creating templates:', error);
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      await deleteEventFromIndexedDB(eventId);
      await loadSavedEvents();
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const openDeleteDialog = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const handleEmailVenue = async (event: EventProject) => {
    // Open email composer or send email
    const venueEmail = event.data?.venueContact?.email;
    if (venueEmail) {
      window.location.href = `mailto:${venueEmail}?subject=Confirmação de Evento - ${event.eventName}&body=Olá,%0D%0A%0D%0AEscrevo para confirmar os detalhes do evento...`;
    } else {
      // Open event edit page to add email
      window.location.href = `/events/${event.id}`;
    }
  };

  const filteredEvents = savedEvents.filter((event) => {
    if (!event.date) return false;
    const eventYear = new Date(event.date).getFullYear();
    return eventYear === selectedYear;
  });

  const eventsByStatus = filteredEvents.reduce((acc, event) => {
    const completion = calculateEventCompletion(event.data || event);
    const status = completion.isComplete ? "complete" : "incomplete";
    if (!acc[status]) acc[status] = [];
    acc[status].push(event);
    return acc;
  }, {} as Record<string, EventProject[]>);

  const completeEvents = eventsByStatus.complete || [];
  const incompleteEvents = eventsByStatus.incomplete || [];

  return (
    <AppShell title="Eventos">
      <div>
        <header className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Eventos
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de tracking e execução. Todos os passos devem estar completos.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder={selectedYear.toString()} />
                </SelectTrigger>
                <SelectContent>
                  {[2026, 2027, 2028, 2029].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Link href="/events/annual">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  <span className="hidden sm:inline">Vista Anual</span>
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-card p-4 rounded-lg border">
              <div className="text-xs text-muted-foreground">Total Eventos</div>
              <div className="text-2xl font-bold">{filteredEvents.length}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-xs text-green-600 dark:text-green-400">Confirmados</div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{completeEvents.length}</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-xs text-red-600 dark:text-red-400">Por Completar</div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">{incompleteEvents.length}</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-xs text-blue-600 dark:text-blue-400">Taxa Conclusão</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {filteredEvents.length > 0
                  ? Math.round((completeEvents.length / filteredEvents.length) * 100)
                  : 0}%
              </div>
            </div>
          </div>

          <Tabs defaultValue="calendar" className="space-y-4">
            <TabsList>
              <TabsTrigger value="calendar"><Calendar className="w-4 h-4 mr-1.5" />Calendário</TabsTrigger>
              <TabsTrigger value="all">Todos ({filteredEvents.length})</TabsTrigger>
              <TabsTrigger value="complete">
                Confirmados ({completeEvents.length})
              </TabsTrigger>
              <TabsTrigger value="incomplete">
                Por Completar ({incompleteEvents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-4">
              <EventCalendar
                events={filteredEvents.map((e) => ({
                  id: e.id,
                  eventName: e.eventName,
                  date: e.date,
                  venue: e.venue,
                  city: e.data?.venue?.city || e.data?.overview?.city,
                }))}
                selectedYear={selectedYear}
                onDateClick={(date) => {
                  // Criar novo evento ou mostrar eventos do dia
                  const dateStr = date.toISOString().split('T')[0];
                  const dayEvents = filteredEvents.filter((e) => {
                    if (!e.date) return false;
                    const eventDate = new Date(e.date).toISOString().split('T')[0];
                    return eventDate === dateStr;
                  });

                  if (dayEvents.length > 0) {
                    // Se há eventos, abrir o primeiro
                    window.location.href = `/events/${dayEvents[0].id}`;
                  } else {
                    // Criar novo evento para esta data
                    window.location.href = `/events/new?date=${dateStr}`;
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {loading ? (
                <div className="text-center py-12 text-slate-500">A carregar eventos...</div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  Nenhum evento encontrado para {selectedYear}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEvents.map((event) => (
                    <EventCompletionCard
                      key={event.id}
                      event={event}
                      onEmailVenue={handleEmailVenue}
                      onEdit={(e) => window.location.href = `/events/${e.id}`}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="complete" className="space-y-4">
              {completeEvents.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  Nenhum evento confirmado ainda
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completeEvents.map((event) => (
                    <EventCompletionCard
                      key={event.id}
                      event={event}
                      onEmailVenue={handleEmailVenue}
                      onEdit={(e) => window.location.href = `/events/${e.id}`}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="incomplete" className="space-y-4">
              {incompleteEvents.length === 0 ? (
                <div className="text-center py-12 text-green-600 dark:text-green-400">
                  <Sparkles className="h-12 w-12 mx-auto mb-4" />
                  <div className="text-lg font-semibold">Todos os eventos estão completos!</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {incompleteEvents.map((event) => (
                    <EventCompletionCard
                      key={event.id}
                      event={event}
                      onEmailVenue={handleEmailVenue}
                      onEdit={(e) => window.location.href = `/events/${e.id}`}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Eliminação</DialogTitle>
              <DialogDescription>
                Tem a certeza que deseja eliminar este evento? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => eventToDelete && handleDelete(eventToDelete)}
              >
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
