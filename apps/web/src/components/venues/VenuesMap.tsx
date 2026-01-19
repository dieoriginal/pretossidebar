"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export type MapVenue = { id: string; name: string; lat?: number; lng?: number; region?: string; city?: string; country?: string };

export default function VenuesMap({ venues, onVenueClick }: { venues: MapVenue[]; onVenueClick?: (venue: MapVenue) => void }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!MAPBOX_TOKEN) {
      setError("Token do Mapbox não configurado. Configure NEXT_PUBLIC_MAPBOX_TOKEN no arquivo .env.local");
      return;
    }

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const center: [number, number] = venues.length > 0 && venues[0].lng && venues[0].lat
        ? [venues[0].lng, venues[0].lat]
        : [-9.1393, 38.7223]; // Lisboa por padrão

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "https://api.mapbox.com/styles/v1/mapbox/streets-v12",
        center: center,
        zoom: venues.length > 0 ? 8 : 6,
        attributionControl: true,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.current.on("load", () => {
        setMapLoaded(true);
        setError(null);
      });

      map.current.on("error", (e) => {
        setError(`Erro ao carregar mapa: ${e.error?.message || "Erro desconhecido"}`);
      });

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (err: any) {
      setError(`Erro ao inicializar mapa: ${err.message || "Erro desconhecido"}`);
    }
  }, [MAPBOX_TOKEN]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const venuesWithCoords = venues.filter(v => typeof v.lat === 'number' && typeof v.lng === 'number');

    venuesWithCoords.forEach((venue) => {
      if (!map.current) return;

      const el = document.createElement("div");
      el.className = "venue-marker";
      el.style.width = "24px";
      el.style.height = "24px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#001845";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
      el.style.cursor = "pointer";

      const popup = new mapboxgl.Popup({ offset: 25 }).setText(venue.name);

      const marker = new mapboxgl.Marker({
        element: el,
      })
        .setLngLat([venue.lng!, venue.lat!])
        .setPopup(popup)
        .addTo(map.current);

      if (onVenueClick) {
        el.addEventListener("click", () => onVenueClick(venue));
      }

      markersRef.current.push(marker);
    });

    if (venuesWithCoords.length > 0 && map.current) {
      const bounds = new mapboxgl.LngLatBounds();
      venuesWithCoords.forEach(venue => {
        bounds.extend([venue.lng!, venue.lat!]);
      });
      
      if (venuesWithCoords.length > 1) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 12,
        });
      } else {
        map.current.setCenter([venuesWithCoords[0].lng!, venuesWithCoords[0].lat!]);
        map.current.setZoom(12);
      }
    }
  }, [venues, mapLoaded, onVenueClick]);

  if (error) {
    return (
      <div className="w-full h-64 rounded border bg-muted flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <div ref={mapContainer} className="w-full h-64 rounded border" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">A carregar mapa...</p>
          </div>
        </div>
      )}
      <style jsx global>{`
        .venue-marker:hover {
          transform: scale(1.2);
          transition: transform 0.2s;
        }
      `}</style>
    </div>
  );
}
