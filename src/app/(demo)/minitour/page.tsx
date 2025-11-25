"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Calendar, Download, MapPin, MoveUp, MoveDown, Save, Trash2, Upload, Route, Map as MapIcon, Hotel, UtensilsCrossed, Info } from "lucide-react"
import { addVenue, getAllVenues, Venue } from "@/lib/venuesDb"

// Mini-tour data model
type Stop = {
  id: string
  venueId?: string
  name: string
  lat: number
  lng: number
  date?: string // yyyy-mm-dd
  locked?: boolean
}

type MiniTour = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  stops: Stop[]
}

const STORAGE_KEY = "minitour-project-v1"
type RouteLine = { type: "LineString"; coordinates: Array<[number, number]> }

// Simple equirectangular projection helpers (works with an equirectangular background image)
function lngLatToXY(lng: number, lat: number, width: number, height: number) {
  const x = ((lng + 180) / 360) * width
  const y = ((90 - lat) / 180) * height
  return { x, y }
}
function xyToLngLat(x: number, y: number, width: number, height: number) {
  const lng = (x / width) * 360 - 180
  const lat = 90 - (y / height) * 180
  return { lng, lat }
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const c = 2 * Math.asin(Math.sqrt(sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng))
  return R * c
}

export default function MiniTourPlannerPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [filter, setFilter] = useState("")
  const [project, setProject] = useState<MiniTour>(() => ({ id: "default", name: "Mini-tour", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), stops: [] }))
  const [autosave, setAutosave] = useState(true)
  const mapRef = useRef<HTMLDivElement | null>(null)
  const [mapSize, setMapSize] = useState({ w: 1200, h: 600 })
  const [onlyPortugal, setOnlyPortugal] = useState(true)
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null)
  const [nearby, setNearby] = useState<Record<string, Array<{ id: string; lat: number; lng: number; type: string; name?: string }>>>({})
  const [savingVenueFor, setSavingVenueFor] = useState<string | null>(null)
  const [newVenueName, setNewVenueName] = useState("")
  const [newVenueCity, setNewVenueCity] = useState("")
  const [useRealMap, setUseRealMap] = useState(false)
  const [showVenuesList, setShowVenuesList] = useState(false)
  const [showDistricts, setShowDistricts] = useState(true)
  const [showConcelhos, setShowConcelhos] = useState(true)
  const [useGDirections, setUseGDirections] = useState(true)
  const [showDailyRoutes, setShowDailyRoutes] = useState(false)
  const [dailySegments, setDailySegments] = useState<Array<{ date: string; path: Array<{ lat: number; lng: number }> }>>([])
  const [routeLine, setRouteLine] = useState<RouteLine | null>(null)
  const [routeSteps, setRouteSteps] = useState<any[]>([])

  const GoogleMap = useMemo(() => dynamic(() => import("./GoogleMap"), { ssr: false }), [])

  // Load saved project
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setProject(JSON.parse(saved) as MiniTour)
    } catch {}
  }, [])

  // Load venues from IndexedDB
  useEffect(() => {
    ;(async () => {
      try {
        const all = await getAllVenues()
        // Only venues with coordinates show on map
        const withCoords = all.filter(v => typeof v.lat === "number" && typeof v.lng === "number") as Venue[]
        setVenues(withCoords)
      } catch {}
    })()
  }, [])

  // Observe map size for proper projection
  useEffect(() => {
    const el = mapRef.current
    if (!el) return
    const obs = new ResizeObserver(() => setMapSize({ w: el.clientWidth, h: el.clientHeight }))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Autosave
  useEffect(() => {
    if (!autosave) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
    } catch {}
  }, [project, autosave])

  const filteredVenues = useMemo(() => {
    const source = venues.filter(v => {
      if (!onlyPortugal) return true
      if (typeof v.lat !== "number" || typeof v.lng !== "number") return false
      return inPortugal(v.lat as number, v.lng as number)
    })
    if (!filter.trim()) return source
    const k = filter.toLowerCase()
    return source.filter(v => (v.name || "").toLowerCase().includes(k) || (v.city || "").toLowerCase().includes(k) || (v.country || "").toLowerCase().includes(k))
  }, [venues, filter, onlyPortugal])

  function addStopFromVenue(v: Venue) {
    if (typeof v.lat !== "number" || typeof v.lng !== "number") return
    const stop: Stop = { id: `${v.id}-${Date.now()}`, venueId: v.id, name: v.name, lat: v.lat, lng: v.lng }
    setProject(p => ({ ...p, updatedAt: new Date().toISOString(), stops: [...p.stops, stop] }))
  }

  function addCustomStopAt(x: number, y: number) {
    const { lng, lat } = xyToLngLat(x, y, mapSize.w, mapSize.h)
    const stop: Stop = { id: `custom-${Date.now()}`, name: "Custom", lat, lng }
    setProject(p => ({ ...p, updatedAt: new Date().toISOString(), stops: [...p.stops, stop] }))
  }

  function setStopDate(id: string, date?: string) {
    setProject(p => ({ ...p, updatedAt: new Date().toISOString(), stops: p.stops.map(s => (s.id === id ? { ...s, date } : s)) }))
  }
  function toggleLock(id: string) {
    setProject(p => ({ ...p, updatedAt: new Date().toISOString(), stops: p.stops.map(s => (s.id === id ? { ...s, locked: !s.locked } : s)) }))
  }
  function moveStop(id: string, dir: -1 | 1) {
    setProject(p => {
      const idx = p.stops.findIndex(s => s.id === id)
      if (idx < 0) return p
      const j = idx + dir
      if (j < 0 || j >= p.stops.length) return p
      const next = [...p.stops]
      const [sp] = next.splice(idx, 1)
      next.splice(j, 0, sp)
      return { ...p, updatedAt: new Date().toISOString(), stops: next }
    })
  }
  function removeStop(id: string) {
    setProject(p => ({ ...p, updatedAt: new Date().toISOString(), stops: p.stops.filter(s => s.id !== id) }))
  }
  function clearRoute() {
    setProject(p => ({ ...p, updatedAt: new Date().toISOString(), stops: [] }))
  }

  async function saveStopAsVenue(id: string) {
    const stop = project.stops.find(s => s.id === id)
    if (!stop) return
    if (!newVenueName.trim()) return
    try {
      const vid = await addVenue({
        name: newVenueName.trim(),
        city: newVenueCity.trim() || undefined,
        country: "Portugal",
        lat: stop.lat,
        lng: stop.lng,
        notes: "Adicionado via planner",
      })
      setProject(p => ({ ...p, updatedAt: new Date().toISOString(), stops: p.stops.map(s => s.id === id ? { ...s, venueId: vid, name: newVenueName.trim() } : s) }))
      // Refresh list
      const all = await getAllVenues()
      setVenues(all)
      setSavingVenueFor(null)
      setNewVenueName("")
      setNewVenueCity("")
    } catch (e) {
      console.error(e)
      alert("Falha ao guardar venue.")
    }
  }

  async function fetchNearbyFor(id: string) {
    const stop = project.stops.find(s => s.id === id)
    if (!stop) return
    try {
      // Overpass: amenities within 1200m
      const q = `[
        out:json
      ];
      (
        node["amenity"~"restaurant|cafe|fast_food|bar|pub|supermarket|parking|hotel|hostel|guest_house|motel"](around:1200,${stop.lat},${stop.lng});
      );
      out body;`;
      const res = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: q, headers: { "Content-Type": "text/plain;charset=UTF-8" } })
      const data = await res.json()
      const items: Array<{ id: string; lat: number; lng: number; type: string; name?: string }> = (data?.elements || [])
        .filter((el: any) => el.type === "node" && typeof el.lat === "number" && typeof el.lon === "number")
        .map((el: any) => ({ id: String(el.id), lat: el.lat, lng: el.lon, type: el.tags?.amenity || "amenity", name: el.tags?.name }))
      setNearby(prev => ({ ...prev, [id]: items }))
      setSelectedStopId(id)
    } catch (e) {
      console.warn("Nearby fetch failed", e)
      setNearby(prev => ({ ...prev, [id]: [] }))
      setSelectedStopId(id)
    }
  }

  function saveNow() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
  }
  function exportJSON() {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${project.name || "minitour"}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  function exportKML() {
    if (!routeLine || routeLine.coordinates.length === 0) return
    const kml = lineStringToKml(routeLine, project.name || "Mini-tour")
    const blob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${project.name || "minitour"}.kml`
    a.click()
    URL.revokeObjectURL(url)
  }
  function exportGeoJSON() {
    if (!routeLine) return
    const gj = JSON.stringify({ type: "Feature", properties: { name: project.name || "Mini-tour" }, geometry: routeLine }, null, 2)
    const blob = new Blob([gj], { type: "application/geo+json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${project.name || "minitour"}.geojson`
    a.click()
    URL.revokeObjectURL(url)
  }
  function generateDailyRoutes() {
    // Group consecutive stops by same date; ignore stops without date
    const segs: Array<{ date: string; path: Array<{ lat: number; lng: number }> }> = []
    let current: { date: string; path: Array<{ lat: number; lng: number }> } | null = null
    for (let i = 0; i < project.stops.length; i++) {
      const s = project.stops[i]
      if (!s.date) { current = null; continue }
      if (!current || current.date !== s.date) {
        current = { date: s.date, path: [{ lat: s.lat, lng: s.lng }] }
        segs.push(current)
      } else {
        current.path.push({ lat: s.lat, lng: s.lng })
      }
    }
    // Remove segments with less than 2 points
    const cleaned = segs.map(x => ({ ...x, path: x.path.slice() })).filter(x => x.path.length >= 2)
    setDailySegments(cleaned)
    setShowDailyRoutes(true)
  }
  function addStopFromLatLng(lat: number, lng: number, name?: string) {
    const stop: Stop = { id: `geo-${Date.now()}`, name: name || "Local", lat, lng }
    setProject(p => ({ ...p, updatedAt: new Date().toISOString(), stops: [...p.stops, stop] }))
  }
  function fixRouteAsWaypoints() {
    if (!routeLine || routeLine.coordinates.length < 3) return
    if (!confirm("Adicionar waypoints intermédios à rota atual?")) return
    const coords = routeLine.coordinates
    const step = Math.max(5, Math.floor(coords.length / 50)) // ~até 50 waypoints
    const newStops: Stop[] = []
    for (let i = 1; i < coords.length - 1; i += step) {
      const [lng, lat] = coords[i]
      newStops.push({ id: `wp-${Date.now()}-${i}`, name: "Waypoint", lat, lng })
    }
    setProject(p => ({ ...p, updatedAt: new Date().toISOString(), stops: [...p.stops, ...newStops] }))
  }
  function exportGPX() {
    if (!routeLine || routeLine.coordinates.length === 0) return
    const gpx = lineStringToGpx(routeLine, project.name || "Mini-tour")
    const blob = new Blob([gpx], { type: "application/gpx+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${project.name || "minitour"}.gpx`
    a.click()
    URL.revokeObjectURL(url)
  }
  function importJSON(file: File) {
    const r = new FileReader()
    r.onload = () => {
      try {
        const parsed = JSON.parse(String(r.result || "")) as MiniTour
        setProject(parsed)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      } catch {}
    }
    r.readAsText(file)
  }

  const totalKm = useMemo(() => {
    let sum = 0
    for (let i = 1; i < project.stops.length; i++) sum += haversineKm(project.stops[i - 1], project.stops[i])
    return Math.round(sum)
  }, [project.stops])

  const worldBg = "https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"

  // Click handler on SVG to drop custom stops
  function onSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    addCustomStopAt(x, y)
  }

  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 p-3 border-b bg-background">
        <div className="flex items-center gap-2">
          <Route className="w-5 h-5" />
          <Input className="w-56" value={project.name} onChange={(e) => setProject({ ...project, name: e.target.value, updatedAt: new Date().toISOString() })} />
          <Badge variant="secondary">{project.stops.length} paragens</Badge>
          <Badge variant="outline">{totalKm} km</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Procurar venue…" value={filter} onChange={(e) => setFilter(e.target.value)} className="w-56" />
          <label className="text-sm flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={onlyPortugal} onChange={(e) => setOnlyPortugal(e.target.checked)} /> Portugal only
          </label>
          <label className="text-sm flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={useRealMap} onChange={(e) => setUseRealMap(e.target.checked)} /> Mapa real (beta)
          </label>
          {useRealMap && (
            <>
              <Button variant="outline" onClick={() => setShowVenuesList(v => !v)}>Venues</Button>
              <label className="text-sm flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={showDistricts} onChange={(e) => setShowDistricts(e.target.checked)} /> Distritos
              </label>
              <label className="text-sm flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={showConcelhos} onChange={(e) => setShowConcelhos(e.target.checked)} /> Concelhos
              </label>
              <label className="text-sm flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={useGDirections} onChange={(e) => setUseGDirections(e.target.checked)} /> Snap à estrada
              </label>
            </>
          )}
          <label className="text-sm flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={autosave} onChange={(e) => setAutosave(e.target.checked)} /> Autosave
          </label>
          <Button variant="outline" onClick={saveNow}><Save className="w-4 h-4 mr-2" />Guardar</Button>
          <Button variant="outline" onClick={exportJSON}><Download className="w-4 h-4 mr-2" />Export</Button>
          <Button variant="outline" onClick={exportGPX} disabled={!routeLine}><Download className="w-4 h-4 mr-2" />GPX</Button>
          <Button variant="outline" onClick={exportKML} disabled={!routeLine}><Download className="w-4 h-4 mr-2" />KML</Button>
          <Button variant="outline" onClick={exportGeoJSON} disabled={!routeLine}><Download className="w-4 h-4 mr-2" />GeoJSON</Button>
          <Button variant="outline" onClick={generateDailyRoutes}><Route className="w-4 h-4 mr-2" />Gerar rotas por dia</Button>
          <Button variant="outline" onClick={fixRouteAsWaypoints} disabled={!routeLine}><Save className="w-4 h-4 mr-2" />Fixar rota como waypoints</Button>
          <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer bg-background">
            <Upload className="w-4 h-4" /> Import
            <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])} />
          </label>
          <Button variant="destructive" onClick={clearRoute}><Trash2 className="w-4 h-4 mr-2" />Limpar</Button>
        </div>
      </div>

      {/* Main content: Map + Sidebar */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_360px]">
        {/* Map */}
        <div ref={mapRef} className="relative overflow-hidden">
          {useRealMap ? (
            <>
              <GoogleMap
                stops={project.stops}
                venues={filteredVenues as any}
                onStopDrag={(id, lat, lng) => setProject(p => ({ ...p, updatedAt: new Date().toISOString(), stops: p.stops.map(s => s.id === id ? { ...s, lat, lng } : s) }))}
                onRouteChange={(line, steps) => { setRouteLine(line as any); setRouteSteps(steps) }}
                showDistricts={showDistricts}
                showConcelhos={showConcelhos}
                useDirections={useGDirections}
                onVenueClick={(v:any) => addStopFromVenue(v)}
                onAddStopFromLatLng={(lat,lng,name)=> addStopFromLatLng(lat,lng,name)}
                daySegments={showDailyRoutes ? dailySegments : []}
              />
              {showVenuesList && (
                <div className="absolute left-2 top-2 w-80 max-h-[60vh] overflow-auto bg-white/90 rounded shadow p-2 space-y-1">
                  <div className="font-semibold mb-1">Venues filtradas</div>
                  {filteredVenues.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Sem venues</div>
                  ) : (
                    <ul className="space-y-1">
                      {filteredVenues.slice(0, 100).map(v => (
                        <li key={v.id} className="flex items-center justify-between gap-2">
                          <div className="truncate">
                            <div className="truncate text-sm font-medium">{v.name}</div>
                            <div className="text-xs text-muted-foreground">{[v.city, v.country].filter(Boolean).join(" • ")}</div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => addStopFromVenue(v)}>Add</Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <div className="absolute left-2 bottom-2 text-[10px] bg-black/60 text-white px-1 rounded">Arrasta os pins para ajustar. Usa o botão Venues para adicionar.</div>
            </>
          ) : (
            <>
              <svg
                className="absolute inset-0"
                width="100%"
                height="100%"
                viewBox={`0 0 ${mapSize.w} ${mapSize.h}`}
                onClick={onSvgClick}
              >
                {/* Background map image */}
                <image href={worldBg} x={0} y={0} width={mapSize.w} height={mapSize.h} preserveAspectRatio="xMidYMid slice" />

                {/* Route polyline */}
                {project.stops.length >= 2 && (
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={project.stops
                      .map((s) => {
                        const { x, y } = lngLatToXY(s.lng, s.lat, mapSize.w, mapSize.h)
                        return `${x},${y}`
                      })
                      .join(" ")}
                  />
                )}

                {/* Venues as clickable pins */}
                {filteredVenues.map((v) => {
                  const { x, y } = lngLatToXY((v.lng as number), (v.lat as number), mapSize.w, mapSize.h)
                  const title = [v.name, v.city, v.country].filter(Boolean).join(" • ")
                  return (
                    <g key={v.id} onClick={(e) => { e.stopPropagation(); addStopFromVenue(v) }} className="cursor-pointer">
                      <title>{title}</title>
                      <circle cx={x} cy={y} r={3.5} fill="#ef4444" stroke="#ffffff" strokeWidth={1.5} />
                    </g>
                  )
                })}

                {/* Nearby POIs for selected stop */}
                {selectedStopId && (nearby[selectedStopId]?.length || 0) > 0 && (
                  <g>
                    {(nearby[selectedStopId] || []).map((poi) => {
                      const { x, y } = lngLatToXY(poi.lng, poi.lat, mapSize.w, mapSize.h)
                      const color = poi.type.match(/hotel|hostel|guest_house|motel/) ? "#10b981" : poi.type.match(/restaurant|cafe|fast_food|bar|pub/) ? "#f59e0b" : "#6b7280"
                      return (
                        <g key={poi.id} transform={`translate(${x},${y})`}>
                          <rect x={-3} y={-3} width={6} height={6} fill={color} stroke="#fff" strokeWidth={1} />
                          {poi.name ? <title>{poi.name}</title> : null}
                        </g>
                      )
                    })}
                  </g>
                )}

                {/* Selected stops (numbered) */}
                {project.stops.map((s, idx) => {
                  const { x, y } = lngLatToXY(s.lng, s.lat, mapSize.w, mapSize.h)
                  return (
                    <g key={s.id} transform={`translate(${x},${y})`}>
                      <circle r={7} fill="#2563eb" />
                      <text textAnchor="middle" dy={3} fill="#fff" fontSize={10} fontWeight={700}>
                        {idx + 1}
                      </text>
                    </g>
                  )
                })}
              </svg>

              {/* Click hint */}
              <div className="absolute bottom-3 left-3 text-xs px-2 py-1 rounded bg-black/60 text-white">Clique no mapa para adicionar um ponto custom. Clique num pin para adicionar ao trajeto.</div>
            </>
          )}
        </div>

        {/* Sidebar route */}
        <div className="border-l p-3 space-y-3 bg-background/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="font-medium">Itinerário</div>
            <div className="text-xs text-muted-foreground">Atualizado {new Date(project.updatedAt).toLocaleString()}</div>
          </div>

          {project.stops.length === 0 && (
            <div className="text-sm text-muted-foreground">Começa por clicar nos pins do mapa (ou no mapa) para construir a rota.</div>
          )}

          <div className="space-y-2 max-h-[calc(100vh-180px)] overflow-auto pr-1">
            {project.stops.map((s, i) => (
              <Card key={s.id} className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">{i + 1}</div>
                    <div className="truncate">
                      <div className="font-medium truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500" /> {s.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{s.lat.toFixed(2)}, {s.lng.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => moveStop(s.id, -1)} title="Subir"><MoveUp className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => moveStop(s.id, +1)} title="Descer"><MoveDown className="w-4 h-4" /></Button>
                    <Button size="icon" variant={s.locked ? "default" : "outline"} onClick={() => toggleLock(s.id)} title="Lock date"><Calendar className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => removeStop(s.id)} title="Remover"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Input type="date" value={s.date || ""} onChange={(e) => setStopDate(s.id, e.target.value || undefined)} className="h-8" />
                  {s.date ? <Badge variant="secondary">{new Date(s.date).toDateString()}</Badge> : <span className="text-xs text-muted-foreground">Define a data</span>}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {!s.venueId ? (
                    <>
                      {savingVenueFor === s.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <Input placeholder="Nome da venue" className="h-8" value={newVenueName} onChange={(e)=>setNewVenueName(e.target.value)} />
                          <Input placeholder="Cidade" className="h-8" value={newVenueCity} onChange={(e)=>setNewVenueCity(e.target.value)} />
                          <Button size="sm" onClick={()=> saveStopAsVenue(s.id)}>Guardar no DB</Button>
                          <Button size="sm" variant="ghost" onClick={()=> { setSavingVenueFor(null); setNewVenueName(""); setNewVenueCity("") }}>Cancelar</Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" onClick={()=> { setSavingVenueFor(s.id); setNewVenueName(s.name || ""); setNewVenueCity("") }}>
                          <MapIcon className="w-4 h-4 mr-1" /> Guardar como Venue
                        </Button>
                      )}
                    </>
                  ) : (
                    <Badge variant="outline">Venue ligada</Badge>
                  )}
                  <Button size="sm" variant={selectedStopId === s.id ? "default" : "outline"} onClick={()=> fetchNearbyFor(s.id)}>
                    <Info className="w-4 h-4 mr-1" /> Serviços perto
                  </Button>
                </div>
                {selectedStopId === s.id && (
                  <div className="mt-2 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <UtensilsCrossed className="w-3 h-3 text-amber-500" /> Restaurantes/Bares • <Hotel className="w-3 h-3 text-emerald-500" /> Hotéis/Hostels • Cinza: outros
                    </div>
                    {nearby[s.id] && nearby[s.id].length > 0 ? (
                      <ul className="grid grid-cols-1 gap-1 max-h-32 overflow-auto">
                        {nearby[s.id].slice(0, 12).map(p => (
                          <li key={p.id} className="flex items-center justify-between">
                            <span className="truncate mr-2">{p.name || p.type}</span>
                            <span className="text-muted-foreground">{p.type}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-muted-foreground">Sem resultados (ou falha de rede). Tenta de novo.</div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {project.stops.length >= 2 && (
            <div className="pt-2 text-sm">
              Distância total: <span className="font-semibold">{totalKm} km</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Basic PT bounds check (mainland + Madeira + Açores)
function inPortugal(lat: number, lng: number) {
  const mainland = lat >= 36 && lat <= 42.3 && lng >= -9.8 && lng <= -6
  const madeira = lat >= 32 && lat <= 33.5 && lng >= -17.5 && lng <= -15
  const azores = lat >= 36 && lat <= 40.5 && lng >= -31.7 && lng <= -24
  return mainland || madeira || azores
}

// Minimal GPX export from a GeoJSON-like LineString
function lineStringToGpx(line: RouteLine, name: string) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  const header = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="MiniTour" xmlns="http://www.topografix.com/GPX/1/1">\n<trk><name>${esc(name)}</name><trkseg>`
  const pts = line.coordinates
    .map(([lon, lat]) => `<trkpt lat="${lat}" lon="${lon}"></trkpt>`) // time/elev omitted
    .join("")
  const footer = `</trkseg></trk></gpx>`
  return header + pts + footer
}

function lineStringToKml(line: RouteLine, name: string) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  const coords = line.coordinates.map(([lon, lat]) => `${lon},${lat},0`).join(" ")
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<kml xmlns="http://www.opengis.net/kml/2.2">\n` +
    `<Document>\n` +
    `<name>${esc(name)}</name>\n` +
    `<Placemark>\n` +
    `<name>${esc(name)}</name>\n` +
    `<LineString><tessellate>1</tessellate><coordinates>${coords}</coordinates></LineString>\n` +
    `</Placemark>\n` +
    `</Document>\n` +
    `</kml>`
}
