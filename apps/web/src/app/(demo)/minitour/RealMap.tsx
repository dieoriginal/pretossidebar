"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"

type Stop = { id: string; name: string; lat: number; lng: number }
type LineString = { type: "LineString"; coordinates: Array<[number, number]> }

export default function RealMap({
  stops,
  profile = "driving-car",
  onStopDrag,
  onRouteChange,
}: {
  stops: Stop[]
  profile?: "driving-car" | "foot-walking" | "cycling-regular"
  onStopDrag?: (id: string, lat: number, lng: number) => void
  onRouteChange?: (line: LineString | null, steps: any[]) => void
}) {
  const ORS_KEY = process.env.NEXT_PUBLIC_ORS_KEY
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const libRef = useRef<any>(null) // maplibre lib once loaded
  const markersRef = useRef<Record<string, any>>({})

  const [routeLine, setRouteLine] = useState<LineString | null>(null)
  const [routeSteps, setRouteSteps] = useState<any[]>([])
  const [libLoadError, setLibLoadError] = useState<string | null>(null)

  const initial = useMemo(() => {
    const lng = stops[0]?.lng ?? -8.0
    const lat = stops[0]?.lat ?? 39.5
    return { center: [lng, lat] as [number, number], zoom: 6 }
  }, [stops])

  // Init map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return
    ;(async () => {
      try {
        const mod: any = await import("maplibre-gl")
        const maplibregl = mod.default ?? mod
        libRef.current = maplibregl
        const map: any = new maplibregl.Map({
          container: containerRef.current,
          style: "https://demotiles.maplibre.org/style.json",
          center: initial.center,
          zoom: initial.zoom,
          attributionControl: true,
        })
        mapRef.current = map

        map.on("load", () => {
          // Prepare empty source/layer for route
          map.addSource("route-src", { type: "geojson", data: { type: "Feature", geometry: { type: "LineString", coordinates: [] } } as any })
          map.addLayer({ id: "route-line", type: "line", source: "route-src", paint: { "line-color": "#2563eb", "line-width": 5, "line-opacity": 0.9 } })
        })

        return () => {}
      } catch (e) {
        console.warn("Map library failed to load", e)
        setLibLoadError("Falha ao carregar o mapa (dependência ausente)")
      }
    })()
    return () => { try { mapRef.current?.remove() } catch {} mapRef.current = null }
  }, [initial.center, initial.zoom])

  // Update markers when stops change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Remove markers that no longer exist
    for (const id of Object.keys(markersRef.current)) {
      if (!stops.find(s => s.id === id)) {
        markersRef.current[id].remove()
        delete markersRef.current[id]
      }
    }

    // Add/update markers
    stops.forEach((s, idx) => {
      let mk = markersRef.current[s.id]
      const el = document.createElement("div")
      el.className = "rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center"
      el.style.width = "24px"
      el.style.height = "24px"
      el.textContent = String(idx + 1)

      if (!mk) {
        mk = new libRef.current.Marker({ element: el, draggable: true })
          .setLngLat([s.lng, s.lat])
          .addTo(map)
        mk.on("dragend", async () => {
          const pos = mk!.getLngLat()
          const snapped = await snapPoint(profile, ORS_KEY, pos.lat, pos.lng)
          onStopDrag?.(s.id, snapped.lat, snapped.lng)
        })
        markersRef.current[s.id] = mk
      } else {
        mk.setLngLat([s.lng, s.lat])
        // update label
        const node = mk.getElement()
        node.textContent = String(idx + 1)
      }
    })
  }, [stops, onStopDrag, ORS_KEY, profile])

  // Fit bounds to all stops when they change
  useEffect(() => {
    const map = mapRef.current
    if (!map || stops.length === 0) return
    if (stops.length === 1) {
      map.setCenter([stops[0].lng, stops[0].lat])
      map.setZoom(9)
      return
    }
    const b = new libRef.current.LngLatBounds([stops[0].lng, stops[0].lat], [stops[0].lng, stops[0].lat])
    stops.forEach(s => b.extend([s.lng, s.lat]))
    map.fitBounds(b, { padding: 40 })
  }, [stops])

  // Fetch route when stops change
  useEffect(() => {
    let aborted = false
    ;(async () => {
      if (!ORS_KEY || stops.length < 2) {
        setRouteLine(null); setRouteSteps([]); onRouteChange?.(null, []); updateRouteOnMap(null); return
      }
      try {
        const coords = stops.map(s => [s.lng, s.lat])
        const res = await fetch(`https://api.openrouteservice.org/v2/directions/${profile}/geojson`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: ORS_KEY },
          body: JSON.stringify({ coordinates: coords, instructions: true, elevation: false })
        })
        const data = await res.json()
        if (aborted) return
        const feat = data?.features?.[0]
        if (feat?.geometry) {
          const line = feat.geometry as LineString
          setRouteLine(line)
          const segs = feat.properties?.segments || []
          const stps = segs.flatMap((s: any) => s.steps || [])
          setRouteSteps(stps)
          onRouteChange?.(line, stps)
          updateRouteOnMap(line)
        } else {
          setRouteLine(null); setRouteSteps([]); onRouteChange?.(null, []); updateRouteOnMap(null)
        }
      } catch (e) {
        if (aborted) return
        setRouteLine(null); setRouteSteps([]); onRouteChange?.(null, []); updateRouteOnMap(null)
      }
    })()
    return () => { aborted = true }
  }, [stops, ORS_KEY, profile, onRouteChange])

  function updateRouteOnMap(line: LineString | null) {
    const map = mapRef.current
    if (!map || !map.getSource("route-src")) return
    const feature: any = { type: "Feature", geometry: line || { type: "LineString", coordinates: [] } }
    ;(map.getSource("route-src") as any).setData(feature)
  }

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="absolute inset-0" />
      {libLoadError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 text-sm px-3 py-2 rounded shadow">{libLoadError}. Instala <code>maplibre-gl</code> e recarrega.</div>
        </div>
      )}
      <div className="absolute right-2 top-2 max-h-[40vh] w-80 overflow-auto bg-white/90 p-2 rounded shadow">
        <div className="font-semibold">Instruções</div>
        {routeSteps.length === 0 ? (
          <div className="text-sm text-muted-foreground">Sem rota</div>
        ) : (
          <ol className="text-xs space-y-1">
            {routeSteps.map((st, i) => (
              <li key={i} className="flex justify-between">
                {/* ORS retorna instruction como string (HTML simples em alguns casos) */}
                <span>{st.instruction}</span>
                <span className="text-muted-foreground ml-2">{Math.round(st.distance)} m</span>
              </li>
            ))}
          </ol>
        )}
      </div>
      <div className="absolute left-2 bottom-2 text-[10px] bg-white/80 px-1 rounded">© OpenStreetMap contributors</div>
    </div>
  )
}

async function snapPoint(profile: string, key: string | undefined, lat: number, lng: number) {
  if (!key) return { lat, lng }
  try {
    const res = await fetch("https://api.openrouteservice.org/v2/snap/point", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: key },
      body: JSON.stringify({ point: [lng, lat], radius: 50, profile })
    })
    const data = await res.json()
    const snapped = data?.snappedPoint?.coordinates
    if (Array.isArray(snapped) && snapped.length === 2) return { lat: snapped[1], lng: snapped[0] }
    return { lat, lng }
  } catch { return { lat, lng } }
}
