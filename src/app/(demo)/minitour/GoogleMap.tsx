"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { GoogleMap as GMap, Marker, Polyline, useJsApiLoader, Autocomplete } from "@react-google-maps/api"

type Stop = { id: string; name: string; lat: number; lng: number }
type Venue = { id: string; name: string; lat?: number; lng?: number; city?: string; country?: string }

export default function GoogleMap({
  stops,
  venues,
  onStopDrag,
  onRouteChange,
  showDistricts = true,
  showConcelhos = true,
  useDirections = false,
  onVenueClick,
  onAddStopFromLatLng,
  daySegments,
}: {
  stops: Stop[]
  venues: Venue[]
  onStopDrag?: (id: string, lat: number, lng: number) => void
  onRouteChange?: (line: { type: "LineString"; coordinates: Array<[number, number]> } | null, steps: any[]) => void
  showDistricts?: boolean
  showConcelhos?: boolean
  useDirections?: boolean
  onVenueClick?: (v: Venue) => void
  onAddStopFromLatLng?: (lat: number, lng: number, name?: string) => void
  daySegments?: Array<{ date: string; path: Array<{ lat: number; lng: number }> }>
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  const libraries = useMemo(() => {
    const libs: ("places" | "routes")[] = ["places"]
    if (useDirections) libs.push("routes")
    return libs
  }, [useDirections])
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: apiKey, libraries })
  const mapRef = useRef<google.maps.Map | null>(null)
  const districtsLayerRef = useRef<google.maps.Data | null>(null)
  const concelhosLayerRef = useRef<google.maps.Data | null>(null)
  const [path, setPath] = useState<Array<{ lat: number; lng: number }>>([])
  const [districtLabels, setDistrictLabels] = useState<Array<{ name: string; lat: number; lng: number }>>([])
  const [concelhoLabels, setConcelhoLabels] = useState<Array<{ name: string; lat: number; lng: number }>>([])
  const acRef = useRef<google.maps.places.Autocomplete | null>(null)

  const center = useMemo(() => ({ lat: stops[0]?.lat ?? 39.5, lng: stops[0]?.lng ?? -8.0 }), [stops])

  // Compute a simple path or a Directions-based path
  useEffect(() => {
    ;(async () => {
      if (!isLoaded) return
      if (stops.length < 2) {
        setPath(stops.map(s => ({ lat: s.lat, lng: s.lng })))
        onRouteChange?.(null, [])
        return
      }
      if (!useDirections) {
        setPath(stops.map(s => ({ lat: s.lat, lng: s.lng })))
        onRouteChange?.({ type: "LineString", coordinates: stops.map(s => [s.lng, s.lat]) }, [])
        return
      }
      try {
        const dirService = new google.maps.DirectionsService()
        const combined: Array<google.maps.LatLngLiteral> = []
        const allSteps: any[] = []
        for (let i = 0; i < stops.length - 1; i++) {
          const origin = { lat: stops[i].lat, lng: stops[i].lng }
          const destination = { lat: stops[i + 1].lat, lng: stops[i + 1].lng }
          const result = await dirService.route({ origin, destination, travelMode: google.maps.TravelMode.DRIVING })
          const route = result.routes[0]
          const overview = route.overview_path
          overview.forEach(pt => combined.push({ lat: pt.lat(), lng: pt.lng() }))
          route.legs.forEach(leg => leg.steps.forEach(st => allSteps.push({ instruction: st.instructions || st.maneuver, distance: st.distance?.value || 0 })))
        }
        setPath(combined)
        onRouteChange?.({ type: "LineString", coordinates: combined.map(p => [p.lng, p.lat]) }, allSteps)
      } catch {
        setPath(stops.map(s => ({ lat: s.lat, lng: s.lng })))
        onRouteChange?.({ type: "LineString", coordinates: stops.map(s => [s.lng, s.lat]) }, [])
      }
    })()
  }, [isLoaded, stops, useDirections, onRouteChange])

  function onMapLoad(map: google.maps.Map) {
    mapRef.current = map
    // Style a bit
    map.setOptions({ fullscreenControl: true, mapTypeControl: true, streetViewControl: true, zoomControl: true })
    // Load overlays lazily
    if (showDistricts) {
      const layer = new google.maps.Data({ map })
      layer.setStyle({ strokeColor: "#7c3aed", strokeWeight: 1, fillOpacity: 0 })
      layer.loadGeoJson("https://raw.githubusercontent.com/jfoclpf/geopt-unofficial-boundaries/master/distritos.geojson")
      districtsLayerRef.current = layer
    }
    if (showConcelhos) {
      const layer = new google.maps.Data({ map })
      layer.setStyle({ strokeColor: "#2563eb", strokeWeight: 0.5, fillOpacity: 0 })
      layer.loadGeoJson("https://raw.githubusercontent.com/jfoclpf/geopt-unofficial-boundaries/master/concelhos.geojson")
      concelhosLayerRef.current = layer
    }
  }

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (showDistricts && !districtsLayerRef.current) {
      const layer = new google.maps.Data({ map })
      layer.setStyle({ strokeColor: "#7c3aed", strokeWeight: 1, fillOpacity: 0 })
      layer.loadGeoJson("https://raw.githubusercontent.com/jfoclpf/geopt-unofficial-boundaries/master/distritos.geojson")
      districtsLayerRef.current = layer
    }
    if (!showDistricts && districtsLayerRef.current) {
      districtsLayerRef.current.setMap(null)
      districtsLayerRef.current = null
    }
  }, [showDistricts])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (showConcelhos && !concelhosLayerRef.current) {
      const layer = new google.maps.Data({ map })
      layer.setStyle({ strokeColor: "#2563eb", strokeWeight: 0.5, fillOpacity: 0 })
      layer.loadGeoJson("https://raw.githubusercontent.com/jfoclpf/geopt-unofficial-boundaries/master/concelhos.geojson")
      concelhosLayerRef.current = layer
    }
    if (!showConcelhos && concelhosLayerRef.current) {
      concelhosLayerRef.current.setMap(null)
      concelhosLayerRef.current = null
    }
  }, [showConcelhos])

  // Fetch centroids for labels (simple average of vertices)
  useEffect(() => {
    async function fetchLabels(url: string, nameKeys: string[]): Promise<Array<{ name: string; lat: number; lng: number }>> {
      try {
        const r = await fetch(url)
        const gj = await r.json()
        const out: Array<{ name: string; lat: number; lng: number }> = []
        for (const f of gj.features || []) {
          const n = nameKeys.map(k => f.properties?.[k]).find(Boolean) || f.properties?.name || ""
          const geom = f.geometry
          const centroid = computeCentroid(geom)
          if (centroid) out.push({ name: String(n), lat: centroid.lat, lng: centroid.lng })
        }
        return out
      } catch { return [] }
    }
    if (showDistricts && districtLabels.length === 0) {
      fetchLabels(
        "https://raw.githubusercontent.com/jfoclpf/geopt-unofficial-boundaries/master/distritos.geojson",
        ["distrito", "Distrito", "name", "NAME", "NOME"]
      ).then(setDistrictLabels)
    }
    if (showConcelhos && concelhoLabels.length === 0) {
      fetchLabels(
        "https://raw.githubusercontent.com/jfoclpf/geopt-unofficial-boundaries/master/concelhos.geojson",
        ["concelho", "Concelho", "name", "NAME", "NOME"]
      ).then(setConcelhoLabels)
    }
  }, [showDistricts, showConcelhos, districtLabels.length, concelhoLabels.length])

  if (loadError) return <div className="absolute inset-0 flex items-center justify-center">Erro ao carregar Google Maps</div>
  if (!isLoaded) return <div className="absolute inset-0 flex items-center justify-center">A carregar mapa…</div>

  return (
    <div className="absolute inset-0">
      <GMap
        mapContainerStyle={{ position: "absolute", inset: 0 as unknown as number, width: "100%", height: "100%" }}
        center={center}
        zoom={6}
        onLoad={onMapLoad}
      >
        {/* Labels for districts */}
        {showDistricts && districtLabels.map((d, i) => (
          <Marker key={`dl-${i}`} position={{ lat: d.lat, lng: d.lng }}
            icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 0.01, fillOpacity: 0, strokeOpacity: 0 }}
            label={{ text: d.name, color: "#6b21a8", fontSize: "11px", fontWeight: "600" }} />
        ))}
        {/* Labels for concelhos */}
        {showConcelhos && concelhoLabels.map((c, i) => (
          <Marker key={`cl-${i}`} position={{ lat: c.lat, lng: c.lng }}
            icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 0.01, fillOpacity: 0, strokeOpacity: 0 }}
            label={{ text: c.name, color: "#1d4ed8", fontSize: "10px", fontWeight: "500" }} />
        ))}

        {/* Venues */}
        {venues.filter(v => typeof v.lat === "number" && typeof v.lng === "number").map(v => (
          <Marker key={`v-${v.id}`} position={{ lat: v.lat as number, lng: v.lng as number }} title={[v.name, v.city, v.country].filter(Boolean).join(" • ")}
            icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 4, fillColor: "#ef4444", fillOpacity: 1, strokeColor: "white", strokeWeight: 1 }}
            onClick={() => onVenueClick?.(v)}
          />
        ))}

        {/* Stops (numbered + draggable) */}
        {stops.map((s, idx) => (
          <Marker key={s.id} position={{ lat: s.lat, lng: s.lng }} label={{ text: String(idx + 1), color: "white", fontSize: "12px", fontWeight: "700" }}
            icon={{ url: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png" }}
            draggable
            onDragEnd={(e) => {
              const lat = e.latLng?.lat(); const lng = e.latLng?.lng();
              if (typeof lat === "number" && typeof lng === "number") onStopDrag?.(s.id, lat, lng)
            }}
          />
        ))}

        {/* Daily segments (if provided) */}
        {daySegments && daySegments.length > 0 ? (
          daySegments.map((seg, i) => (
            <Polyline key={`day-${seg.date}-${i}`} path={seg.path} options={{ strokeColor: dayColor(i), strokeOpacity: 1, strokeWeight: 5 }} />
          ))
        ) : null}

        {/* Route path (overall) */}
        {path.length >= 2 && (
          <Polyline path={path} options={{ strokeColor: "#2563eb", strokeOpacity: 0.7, strokeWeight: 3 }} />
        )}
      </GMap>

      {/* Search box with autocomplete */}
      <div className="absolute right-2 top-2 z-10">
        <Autocomplete onLoad={(ac) => (acRef.current = ac)} onPlaceChanged={() => {
          const place = acRef.current?.getPlace()
          const loc = place?.geometry?.location
          if (!loc) return
          const lat = loc.lat(); const lng = loc.lng()
          mapRef.current?.panTo({ lat, lng })
          const name = place?.formatted_address || place?.name
          onAddStopFromLatLng?.(lat, lng, name)
        }}>
          <input placeholder="Procurar morada…" className="px-2 py-1 rounded border bg-white/90 text-sm w-72" />
        </Autocomplete>
      </div>
    </div>
  )
}

// Helpers
function computeCentroid(geom: any): { lat: number; lng: number } | null {
  if (!geom) return null
  const type = geom.type
  if (type === "Polygon") return centroidOfPolygon(geom.coordinates)
  if (type === "MultiPolygon") {
    // take the largest polygon by vertex count
    let best: any = null
    for (const poly of geom.coordinates || []) {
      if (!best || (poly?.[0]?.length || 0) > (best?.[0]?.length || 0)) best = poly
    }
    return centroidOfPolygon(best)
  }
  return null
}

function centroidOfPolygon(coordinates: any): { lat: number; lng: number } | null {
  if (!Array.isArray(coordinates) || coordinates.length === 0) return null
  const ring = coordinates[0] // outer ring: [ [lng,lat], ... ]
  let sx = 0, sy = 0, n = 0
  for (const pt of ring) {
    if (Array.isArray(pt) && pt.length >= 2) {
      sx += pt[0]; sy += pt[1]; n++
    }
  }
  if (n === 0) return null
  return { lng: sx / n, lat: sy / n }
}

function dayColor(i: number) {
  const colors = ["#ef4444", "#22c55e", "#eab308", "#06b6d4", "#a78bfa", "#f97316", "#84cc16", "#ec4899"]
  return colors[i % colors.length]
}
