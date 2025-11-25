"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

export type MapVenue = { id: string; name: string; lat?: number; lng?: number; region?: string };

export default function VenuesMap({ venues }: { venues: MapVenue[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const initializeMap = () => {
    if (!mapRef.current || typeof window === "undefined" || !(window as any).google) return;
    const center = { lat: 39.557, lng: -8.135 }; // Portugal
    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 6,
      center,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });
    renderMarkers();
  };

  const renderMarkers = () => {
    if (!mapInstance.current || !(window as any).google) return;
    // clear old
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    venues.filter(v => typeof v.lat === 'number' && typeof v.lng === 'number').forEach(v => {
      const marker = new google.maps.Marker({
        position: { lat: v.lat as number, lng: v.lng as number },
        map: mapInstance.current!,
        title: v.name,
      });
      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    if ((window as any).google) {
      if (!mapInstance.current) initializeMap(); else renderMarkers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venues]);

  return (
    <div className="w-full">
      <Script src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`} strategy="afterInteractive" onLoad={initializeMap} />
      <div ref={mapRef} className="w-full h-64 rounded border" />
    </div>
  );
}
