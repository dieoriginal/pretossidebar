"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

type Stop = { id: string; name: string; lat: number; lng: number; date?: string }
type Venue = { id: string; name: string; lat?: number; lng?: number; city?: string; country?: string }

interface MapboxMapProps {
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
}

export default function MapboxMap({
  stops,
  venues,
  onStopDrag,
  onRouteChange,
  showDistricts = true,
  showConcelhos = true,
  useDirections = false,
  onVenueClick,
  onAddStopFromLatLng,
  daySegments = [],
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mapbox token - obrigatório
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  // Calcular centro do mapa baseado nas paragens, ou Lisboa por padrão
  // Lisboa: longitude -9.1393, latitude 38.7223
  const center = stops.length > 0 
    ? [stops[0].lng, stops[0].lat] as [number, number]
    : [-9.1393, 38.7223] as [number, number] // Lisboa

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    if (!MAPBOX_TOKEN) {
      setError("Token do Mapbox não configurado. Configure NEXT_PUBLIC_MAPBOX_TOKEN no arquivo .env.local")
      console.error("Mapbox token não configurado. Configure NEXT_PUBLIC_MAPBOX_TOKEN")
      return
    }

    try {
      // Configurar token do Mapbox
      mapboxgl.accessToken = MAPBOX_TOKEN

      // Usar estilo Mapbox oficial (URL completa com token)
      const mapStyle = `https://api.mapbox.com/styles/v1/mapbox/streets-v12`

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: center,
        zoom: stops.length > 0 ? 10 : 12, // Zoom maior para Lisboa (12) quando não há paragens
        attributionControl: true,
      })

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

      map.current.on("load", () => {
        setMapLoaded(true)
        setError(null)
        console.log("Mapbox map loaded successfully")
      })

      map.current.on("error", (e) => {
        console.error("Mapbox error:", e)
        setError(`Erro ao carregar mapa: ${e.error?.message || "Erro desconhecido"}`)
      })

      // Permitir adicionar paragens ao clicar no mapa
      map.current.on("click", (e) => {
        if (onAddStopFromLatLng) {
          onAddStopFromLatLng(e.lngLat.lat, e.lngLat.lng)
        }
      })

      return () => {
        if (map.current) {
          map.current.remove()
          map.current = null
        }
      }
    } catch (err: any) {
      console.error("Error initializing Mapbox:", err)
      setError(`Erro ao inicializar mapa: ${err.message || "Erro desconhecido"}`)
    }
  }, [MAPBOX_TOKEN, center, onAddStopFromLatLng])

  // Atualizar marcadores quando paragens mudarem
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Remover marcadores antigos
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Adicionar marcadores para cada paragem
    stops.forEach((stop, index) => {
      if (!map.current) return

      // Criar elemento HTML para o marcador
      const el = document.createElement("div")
      el.className = "custom-marker"
      el.style.width = "32px"
      el.style.height = "32px"
      el.style.borderRadius = "50%"
      el.style.backgroundColor = "#3b82f6"
      el.style.border = "3px solid white"
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)"
      el.style.cursor = "pointer"
      el.style.display = "flex"
      el.style.alignItems = "center"
      el.style.justifyContent = "center"
      el.style.fontSize = "12px"
      el.style.fontWeight = "bold"
      el.style.color = "white"
      el.textContent = String(index + 1)

      const marker = new mapboxgl.Marker({
        element: el,
        draggable: !!onStopDrag,
      })
        .setLngLat([stop.lng, stop.lat])
        .addTo(map.current)

      if (onStopDrag) {
        marker.on("dragend", () => {
          const lngLat = marker.getLngLat()
          onStopDrag(stop.id, lngLat.lat, lngLat.lng)
        })
      }

      markersRef.current.push(marker)
    })

    // Adicionar marcadores para venues
    venues.forEach((venue) => {
      if (!venue.lat || !venue.lng || !map.current) return

      const el = document.createElement("div")
      el.className = "venue-marker"
      el.style.width = "24px"
      el.style.height = "24px"
      el.style.borderRadius = "50%"
      el.style.backgroundColor = "#10b981"
      el.style.border = "2px solid white"
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)"
      el.style.cursor = "pointer"

      const marker = new mapboxgl.Marker({
        element: el,
      })
        .setLngLat([venue.lng, venue.lat])
        .addTo(map.current)

      if (onVenueClick) {
        el.addEventListener("click", () => onVenueClick(venue))
      }

      markersRef.current.push(marker)
    })

    // Ajustar bounds do mapa para incluir todas as paragens
    if (stops.length > 0 && map.current) {
      const bounds = new mapboxgl.LngLatBounds()
      stops.forEach(stop => bounds.extend([stop.lng, stop.lat]))
      venues.forEach(venue => {
        if (venue.lat && venue.lng) {
          bounds.extend([venue.lng, venue.lat])
        }
      })
      
      if (stops.length > 1 || venues.length > 0) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 12,
        })
      } else {
        map.current.setCenter([stops[0].lng, stops[0].lat])
        map.current.setZoom(12) // Zoom maior para paragens individuais
      }
    }
  }, [stops, venues, mapLoaded, onStopDrag, onVenueClick])

  // Adicionar rota/polilinha
  useEffect(() => {
    if (!map.current || !mapLoaded || stops.length < 2) return

    const sourceId = "route"
    const layerId = "route-layer"

    // Remover layer e source existentes
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId)
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId)
    }

    // Criar linha conectando as paragens
    const coordinates = stops.map(stop => [stop.lng, stop.lat] as [number, number])

    map.current.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: coordinates,
        },
      },
    })

    map.current.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#3b82f6",
        "line-width": 3,
        "line-opacity": 0.8,
      },
    })

    // Notificar mudança de rota
    if (onRouteChange) {
      onRouteChange(
        {
          type: "LineString",
          coordinates: coordinates,
        },
        []
      )
    }
  }, [stops, mapLoaded, onRouteChange])

  // Adicionar segmentos diários se fornecidos
  useEffect(() => {
    if (!map.current || !mapLoaded || daySegments.length === 0) return

    daySegments.forEach((segment, index) => {
      const sourceId = `day-segment-${index}`
      const layerId = `day-segment-layer-${index}`

      // Remover layer e source existentes
      if (map.current?.getLayer(layerId)) {
        map.current.removeLayer(layerId)
      }
      if (map.current?.getSource(sourceId)) {
        map.current.removeSource(sourceId)
      }

      const coordinates = segment.path.map(p => [p.lng, p.lat] as [number, number])

      map.current?.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: { date: segment.date },
          geometry: {
            type: "LineString",
            coordinates: coordinates,
          },
        },
      })

      map.current?.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": index % 2 === 0 ? "#10b981" : "#f59e0b",
          "line-width": 2,
          "line-opacity": 0.6,
          "line-dasharray": [2, 2],
        },
      })
    })

    return () => {
      daySegments.forEach((_, index) => {
        const sourceId = `day-segment-${index}`
        const layerId = `day-segment-layer-${index}`
        if (map.current?.getLayer(layerId)) {
          map.current.removeLayer(layerId)
        }
        if (map.current?.getSource(sourceId)) {
          map.current.removeSource(sourceId)
        }
      })
    }
  }, [daySegments, mapLoaded])

  if (error) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-2 text-red-600">Erro ao carregar mapa</h3>
          <p className="text-sm text-gray-700 mb-4">{error}</p>
          {!MAPBOX_TOKEN && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
              <p className="font-semibold mb-1">Como configurar:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Criar arquivo <code className="bg-gray-100 px-1 rounded">.env.local</code> na raiz do projeto</li>
                <li>Adicionar: <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN=seu_token_aqui</code></li>
                <li>Obter token em: <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">mapbox.com/access-tokens</a></li>
                <li>Reiniciar o servidor de desenvolvimento</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full min-h-[400px]" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">A carregar mapa...</p>
          </div>
        </div>
      )}
      <style jsx global>{`
        .mapboxgl-popup-content {
          padding: 12px;
          border-radius: 8px;
        }
        .custom-marker:hover {
          transform: scale(1.1);
          transition: transform 0.2s;
        }
        .venue-marker:hover {
          transform: scale(1.2);
          transition: transform 0.2s;
        }
      `}</style>
    </div>
  )
}




