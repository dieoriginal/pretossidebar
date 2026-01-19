import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { PublicEvent } from "@/types/public";

export function usePublicEvents() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const response = await apiClient.getPublicEvents();
        setEvents(response.events);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar eventos");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return { events, loading, error, refetch: () => {
    setLoading(true);
    apiClient.getPublicEvents()
      .then((response) => {
        setEvents(response.events);
        setError(null);
      })
      .catch((err: any) => {
        setError(err.message || "Erro ao carregar eventos");
      })
      .finally(() => setLoading(false));
  } };
}

export function usePublicEvent(id: string | null) {
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchEvent() {
      try {
        setLoading(true);
        const response = await apiClient.getPublicEvent(id);
        setEvent(response.event);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar evento");
        setEvent(null);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  return { event, loading, error };
}



