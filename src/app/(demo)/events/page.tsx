// app/events/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllEventsFromIndexedDB, deleteEventFromIndexedDB } from "@/lib/events-db";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, MapPin, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

const MOCK_EVENTS = [
  {
    id: "diepretty-mercedes-001",
    name: "Uma Noite com Diepretty Mercédes",
    type: "concerto_ao_vivo",
    date: "2025-11-12",
    venue: "Armazém X",
    capacity: 350,
    sold: 280,
    concept: {
      description: "Festas de hip-hop para a Gen Zs com atuação musical do Artista",
      revenueStreams: ["bilhetes", "patrocínios", "merch", "F&B", "vendas de stands"],
      targetAudience: "Gen Z",
      capacity: { min: 30, max: 200 }
    },
    caes: [
      { code: "90010", description: "Atividades das artes do espetáculo", applicable: true },
      { code: "90020", description: "Serviços de apoio as artes do espetáculo", applicable: true }
    ]
  },
  {
    id: "metaverse-hybrid-002",
    name: "Evento Híbrido - Metaverse",
    type: "evento_hibrido_metaverse",
    date: "2025-12-05",
    venue: "Online + Presencial",
    capacity: 200,
    sold: 150,
    isHybrid: true,
    streamingEnabled: true,
    ppvPrice: { value: 15, currency: "EUR" },
    concept: {
      description: "Show ao vivo com transmissão pay-per-view para público remoto",
      revenueStreams: ["bilhetes presenciais", "PPV/streaming", "patrocínios digitais", "VOD"],
      targetAudience: "Público remoto + presencial",
      capacity: { min: 30, max: 200 }
    }
  },
  {
    id: "beat-battle-003",
    name: "DIEPRETTY BEAT BATTLES",
    type: "beat_battle",
    date: "2025-10-25",
    venue: "Clube C",
    capacity: 200,
    sold: 150,
    techWorkshop: true,
    concept: {
      description: "Competição de beats + workshops técnicos",
      revenueStreams: ["inscrições/pagamento de participantes", "patrocínios de marcas de equipamento", "venda de conteúdos gravados"],
      targetAudience: "Produtores e beatmakers",
      capacity: { min: 50, max: 200 }
    }
  },
  {
    id: "feira-cultura-004",
    name: "Feira de Cultura Urbana",
    type: "feira_cultura_urbana",
    date: "2025-09-15",
    venue: "Parque das Nações",
    capacity: 1200,
    sold: 890,
    concept: {
      description: "Evento que junta música, graffiti, breakdance, skate e lifestyle",
      revenueStreams: ["bilhetes", "stands", "patrocínios lifestyle", "workshops pagos"],
      targetAudience: "Comunidade urbana",
      capacity: { min: 200, max: 1200 }
    }
  },
  // DIEPRETTY SONGWARS - Added
  {
    id: "songwars-005",
    name: "DIEPRETTY SONGWARS",
    type: "song_battle",
    date: "2025-08-20",
    venue: "Casa da Música",
    capacity: 500,
    sold: 320,
    concept: {
      description: "Competição criativa de composições originais entre artistas e produtores.",
      revenueStreams: ["inscrições", "bilhetes", "sponsorships", "streaming", "merchandising"],
      targetAudience: "Compositores, produtores e público jovem",
      capacity: { min: 40, max: 500 }
    }
  }
];

export default function EventsIndexPage() {
  const [savedEvents, setSavedEvents] = useState<EventProject[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <header className="max-w-6xl mx-auto mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Events — Painel</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-1">Visão rápida dos teus eventos. Clica num cartão para abrir o playbook do evento.</p>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* Saved Events Section */}
        {savedEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Meus Projetos de Eventos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {savedEvents.map((event) => (
                <div
                  key={event.id}
                  className="relative rounded-2xl bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-900/20 overflow-hidden transform transition hover:-translate-y-1 border border-slate-200 dark:border-slate-700"
                >
                  <Link href={`/events/${event.id}`} className="block">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{event.eventName || event.title || "Evento sem nome"}</h2>
                          <div className="mt-2 space-y-1 text-sm text-slate-500 dark:text-slate-400">
                            {event.date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(event.date).toLocaleDateString('pt-PT')}
                              </div>
                            )}
                            {event.venue && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.venue}
                              </div>
                            )}
                            {event.eventType && (
                              <div className="text-xs px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 inline-block mt-2">
                                {event.eventType}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block text-xs px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                            #{event.id.split('-')[1]?.slice(0, 6) || 'NOVO'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <footer className="bg-slate-50 dark:bg-slate-700 px-5 py-3 text-sm flex items-center justify-between border-t border-slate-200 dark:border-slate-600">
                    <div className="text-slate-500 dark:text-slate-400 text-xs">
                      {new Date(event.lastModified).toLocaleDateString('pt-PT')}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/events/${event.id}`} className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                        Abrir
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openDeleteDialog(event.id);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </footer>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mock Events Section (for reference) */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Templates de Exemplo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_EVENTS.map((e) => (
              <Link key={e.id} href={`/events/${e.id}/overview`} className="group">
            <article className="relative rounded-2xl bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-900/20 overflow-hidden transform transition hover:-translate-y-1 border border-slate-200 dark:border-slate-700">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{e.name}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{e.date} · {e.venue}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-xs px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">#{e.id}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="w-full">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Venda de bilhetes</div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden border border-slate-200 dark:border-slate-600">
                      <div className="h-3 rounded-full bg-indigo-600 dark:bg-indigo-500" style={{ width: `${Math.min(100, Math.round((e.sold / e.capacity) * 100))}%` }} />
                    </div>
                  </div>

                  <div className="w-20 text-right">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{Math.round((e.sold / e.capacity) * 100)}%</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500">{e.sold}/{e.capacity}</div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <span className="text-xs px-2 py-1 border border-slate-200 dark:border-slate-600 rounded text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700">Bilhetes</span>
                  <span className="text-xs px-2 py-1 border border-slate-200 dark:border-slate-600 rounded text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700">Merch</span>
                  <span className="text-xs px-2 py-1 border border-slate-200 dark:border-slate-600 rounded text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700">Sponsors</span>
                </div>
              </div>

              <footer className="bg-slate-50 dark:bg-slate-700 px-5 py-3 text-sm flex items-center justify-between border-t border-slate-200 dark:border-slate-600">
                <div className="text-slate-500 dark:text-slate-400">Status: Draft</div>
                <div className="flex gap-2">
                  <Link href={`/events/${e.id}/overview`} className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">Abrir</Link>
                </div>
              </footer>
            </article>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA card */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-900/20 p-6 flex items-center justify-center border border-slate-200 dark:border-slate-700">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Criar novo evento</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Usa um template, clona um evento ou começa do zero.</p>
            <div className="mt-4">
              <Link href="/events/new" className="inline-block px-4 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm">Criar Evento</Link>
            </div>
          </div>
        </div>
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
  );
}
