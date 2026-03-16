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
  isCluster?: boolean
  clusterCount?: number
  clusterVehicles?: {plate: string, statusColor: string}[]
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

      if (m.isCluster) {
        el.innerHTML = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;" class="group">
            <!-- Wrapper with padding bottom bridging the hover gap -->
            <div class="absolute bottom-full hidden group-hover:flex flex-col pb-2 z-50">
              <div class="flex flex-col bg-white p-3 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 min-w-[160px] max-h-[220px] overflow-y-auto cursor-default pointer-events-auto">
                <div class="text-[10px] font-bold text-slate-400 mb-2 border-b border-slate-100 pb-2 uppercase tracking-wider">Vehicles (${m.clusterCount})</div>
                <div class="flex flex-col gap-1.5">
                  ${(m.clusterVehicles || []).map(cv => `
                    <div class="flex items-center justify-between bg-slate-50/50 px-2 py-1.5 rounded-md">
                      <span class="text-[11px] font-bold text-slate-700">${cv.plate}</span>
                      <div class="w-2.5 h-2.5 rounded-full shadow-sm" style="background-color: ${cv.statusColor};"></div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <div style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); transition: transform 0.2s ease; position: relative; display: flex; align-items: center; justify-content: center;" class="hover:scale-105">
              <svg viewBox="0 0 64 128" width="40" height="66">
                <!-- Wheels -->
                <rect x="8" y="24" width="8" height="20" rx="3" fill="#1e293b" />
                <rect x="48" y="24" width="8" height="20" rx="3" fill="#1e293b" />
                <rect x="6" y="70" width="8" height="20" rx="3" fill="#1e293b" />
                <rect x="50" y="70" width="8" height="20" rx="3" fill="#1e293b" />
                <rect x="6" y="96" width="8" height="20" rx="3" fill="#1e293b" />
                <rect x="50" y="96" width="8" height="20" rx="3" fill="#1e293b" />

                <!-- Truck Cab -->
                <path d="M 14 26 C 14 10 24 4 32 4 C 40 4 50 10 50 26 L 50 42 C 50 48 48 52 40 52 L 24 52 C 16 52 14 48 14 42 Z" fill="#94a3b8" />
                <path d="M 18 30 L 46 30 L 44 14 C 44 14 40 10 32 10 C 24 10 20 14 20 14 Z" fill="#38bdf8" opacity="0.9" />
                <rect x="22" y="34" width="20" height="12" rx="4" fill="#ffffff" opacity="0.3" />
                
                <rect x="28" y="52" width="8" height="10" fill="#475569" />

                <!-- Cargo Tank Base -->
                <rect x="10" y="60" width="44" height="64" rx="10" fill="#f8fafc" stroke="#94a3b8" stroke-width="3" />
              </svg>

              <!-- Central badge with number -->
              <div class="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-6 px-1 h-6 bg-[#067cc1] text-white rounded-full flex items-center justify-center font-bold text-[11px] border-2 border-white shadow-sm">
                ${m.clusterCount}
              </div>
            </div>
          </div>
        `
      } else {
        const directionArrow = getDirectionArrow(angle)
        const plateName = m.label?.split(' ')[0] ?? ''

      el.innerHTML = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          ${isSelected && m.label ? `<div style="position: absolute; bottom: 100%; margin-bottom: 6px; background: white; padding: 4px 8px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 11px; font-weight: 700; white-space: nowrap; color: #0f172a; border: 1px solid ${m.color ?? '#e2e8f0'}; z-index: 10; display: flex; align-items: center; gap: 4px;">
            <span>${plateName}</span>
            <span style="color: ${m.color ?? '#0f172a'}; font-size: 13px;">${directionArrow}</span>
          </div>` : ''}
          <div style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); transition: all 0.2s ease; transform: rotate(${angle}deg);">
            <svg viewBox="0 0 64 128" width="${size * 1.5}" height="${size * 2.5}">
              <!-- Wheels -->
              <!-- Cab Wheels -->
              <rect x="8" y="24" width="8" height="20" rx="3" fill="#1e293b" />
              <rect x="48" y="24" width="8" height="20" rx="3" fill="#1e293b" />
              <!-- Trailer Wheels -->
              <rect x="6" y="70" width="8" height="20" rx="3" fill="#1e293b" />
              <rect x="50" y="70" width="8" height="20" rx="3" fill="#1e293b" />
              <rect x="6" y="96" width="8" height="20" rx="3" fill="#1e293b" />
              <rect x="50" y="96" width="8" height="20" rx="3" fill="#1e293b" />

              <!-- Truck Cab -->
              <path d="M 14 26 C 14 10 24 4 32 4 C 40 4 50 10 50 26 L 50 42 C 50 48 48 52 40 52 L 24 52 C 16 52 14 48 14 42 Z" fill="${m.color ?? '#94a3b8'}" />
              <!-- Cab Window -->
              <path d="M 18 30 L 46 30 L 44 14 C 44 14 40 10 32 10 C 24 10 20 14 20 14 Z" fill="#38bdf8" opacity="0.9" />
              <!-- Cab Highlights/Roof -->
              <rect x="22" y="34" width="20" height="12" rx="4" fill="#ffffff" opacity="0.3" />

              <!-- Trailer Connection -->
              <rect x="28" y="52" width="8" height="10" fill="#475569" />

              <!-- Cargo Tank Base -->
              <rect x="10" y="60" width="44" height="64" rx="10" fill="#f8fafc" stroke="${m.color ?? '#cbd5e1'}" stroke-width="3" />
              
              <!-- Tank Details (Caps and separators) -->
              <line x1="12" y1="76" x2="52" y2="76" stroke="${m.color ?? '#cbd5e1'}" stroke-width="2" opacity="0.5" />
              <line x1="12" y1="92" x2="52" y2="92" stroke="${m.color ?? '#cbd5e1'}" stroke-width="2" opacity="0.5" />
              <line x1="12" y1="108" x2="52" y2="108" stroke="${m.color ?? '#cbd5e1'}" stroke-width="2" opacity="0.5" />

              <!-- Tanker Hatches (Circles) -->
              <circle cx="32" cy="68" r="4" fill="#94a3b8" />
              <circle cx="32" cy="84" r="4" fill="#94a3b8" />
              <circle cx="32" cy="100" r="4" fill="#94a3b8" />
              <circle cx="32" cy="116" r="4" fill="#94a3b8" />
              
              <!-- Outline/Highlight line along the tank -->
              <line x1="20" y1="62" x2="20" y2="122" stroke="#ffffff" stroke-width="2" opacity="0.7" />
            </svg>
          </div>
        </div>
      `
      }

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
