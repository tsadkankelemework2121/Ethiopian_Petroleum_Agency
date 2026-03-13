import { useEffect, useMemo, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { cn } from '../../lib/cn'

type Position = {
  lat: number
  lng: number
}

type MarkerType = {
  id: string
  position: Position
  label?: string
  subtitle?: string
  status?: string
  angle?: number
  color?: string
}

export type MapApi = {
  zoomIn: () => void
  zoomOut: () => void
  flyTo: (pos: Position, zoom?: number) => void
}

type Props = {
  center: Position
  zoom?: number
  markers?: MarkerType[]
  selectedMarkerId?: string
  onMarkerSelect?: (id: string) => void
  onMapReady?: (api: MapApi) => void
  styleUrl?: string
  className?: string
}

export default function MapView({
  center,
  zoom = 9,
  markers = [],
  selectedMarkerId,
  onMarkerSelect,
  onMapReady,
  // default to light basemap similar to Google light style
  styleUrl = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  className,
}: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef(new Map<string, maplibregl.Marker>())
  const markerElsRef = useRef(new Map<string, HTMLDivElement>())

  const api = useMemo<MapApi>(() => {
    return {
      zoomIn: () => mapRef.current?.zoomIn(),
      zoomOut: () => mapRef.current?.zoomOut(),
      flyTo: (pos, nextZoom) => {
        mapRef.current?.flyTo({
          center: [pos.lng, pos.lat],
          zoom: nextZoom ?? mapRef.current?.getZoom(),
          essential: true,
        })
      },
    }
  }, [])

  // init map once
  useEffect(() => {
    if (!mapContainer.current) return
    if (mapRef.current) return

    const markersMap = markersRef.current
    const markerElsMap = markerElsRef.current

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: [center.lng, center.lat],
      zoom,
      attributionControl: false,
    })

    mapRef.current = map

    onMapReady?.(api)

    return () => {
      markersMap.forEach((mk) => mk.remove())
      markersMap.clear()
      markerElsMap.clear()
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // update basemap style if changed
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setStyle(styleUrl)
  }, [styleUrl])

  // keep camera in sync with props without recreating map
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.jumpTo({ center: [center.lng, center.lat], zoom })
  }, [center, zoom])

  // markers diff/update
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const nextIds = new Set(markers.map((m) => m.id))

    // remove stale markers
    markersRef.current.forEach((mk, id) => {
      if (!nextIds.has(id)) {
        mk.remove()
        markersRef.current.delete(id)
        markerElsRef.current.delete(id)
      }
    })

    // add/update markers
    markers.forEach((m) => {
      const isSelected = m.id === selectedMarkerId
      const size = isSelected ? 32 : 24
      const angle = m.angle ?? 0

      let el = markerElsRef.current.get(m.id)
      if (!el) {
        el = document.createElement('div')
        el.style.cursor = 'pointer'
        el.addEventListener('click', () => onMarkerSelect?.(m.id))
        markerElsRef.current.set(m.id, el)
      }

      // Get direction arrow based on angle
      const getDirectionArrow = (deg: number) => {
        const directions = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖']
        const index = Math.round((deg % 360) / 45) % 8
        return directions[index]
      }

      const directionArrow = getDirectionArrow(angle)
      const plateName = m.label?.split(' ')[0] ?? ''

      el.innerHTML = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          ${isSelected && m.label ? `<div style="position: absolute; bottom: 100%; margin-bottom: 4px; background: white; padding: 4px 8px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-size: 11px; font-weight: bold; white-space: nowrap; color: #0f172a; border: 1px solid #e2e8f0; z-index: 10;">${plateName} ${directionArrow}</div>` : ''}
          <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${m.color ?? '#ffffff'}" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); transition: all 0.2s ease; transform: rotate(${angle}deg);">
            <!-- Truck icon pointing up -->
            <path d="M19 13h-5v-5h-2v5H9.5C8.1 13 7 14.1 7 15.5V17h2v-1.5h10V17h2v-1.5c0-1.4-1.1-2.5-2.5-2.5zM6 6h12V4H6v2zm13 7.5h-1v-2.5H8v2.5H7V8h12v5.5z"/>
          </svg>
        </div>
      `

      let mk = markersRef.current.get(m.id)
      if (!mk) {
        mk = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([m.position.lng, m.position.lat])
          .addTo(map)
        markersRef.current.set(m.id, mk)
      } else {
        mk.setLngLat([m.position.lng, m.position.lat])
      }
    })
  }, [markers, onMarkerSelect, selectedMarkerId])

  return (
    <div
      ref={mapContainer}
      className={cn('w-full h-full min-h-100 overflow-hidden', className)}
    />
  )
}
