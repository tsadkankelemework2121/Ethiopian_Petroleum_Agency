import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import useSupercluster from 'use-supercluster'
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
  clusterVehicles?: { plate: string, statusColor: string }[]
}

export type MapApi = {
  zoomIn: () => void
  zoomOut: () => void
  flyTo: (pos: Position, zoom?: number) => void
  fitBounds: (bounds: [[number, number], [number, number]], padding?: number) => void
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
  isClustered?: boolean
}

// MapController exposes the imperative API and syncs bounds for supercluster
function MapController({ 
  apiRef, 
  onMapReady, 
  center, 
  zoomProp, 
  setBounds, 
  setZoom 
}: any) {
  const map = useMap()

  useEffect(() => {
    const api: MapApi = {
      zoomIn: () => map.zoomIn(),
      zoomOut: () => map.zoomOut(),
      flyTo: (pos, zoom) => map.flyTo([pos.lat, pos.lng], zoom ?? map.getZoom(), { animate: true }),
      fitBounds: (bounds, padding = 40) => map.fitBounds(bounds, { padding: [padding, padding], maxZoom: 15, animate: true }),
    }
    if (apiRef) apiRef.current = api
    onMapReady?.(api)
  }, [map, apiRef, onMapReady])

  useEffect(() => {
    if (center && center.lat && center.lng) {
      if (!map.getCenter() || map.getCenter().lat !== center.lat || map.getCenter().lng !== center.lng) {
         map.setView([center.lat, center.lng], zoomProp ?? map.getZoom())
      }
    }
  }, [center.lat, center.lng, zoomProp, map])

  useEffect(() => {
    function update() {
      const b = map.getBounds()
      setBounds([
        b.getSouthWest().lng,
        b.getSouthWest().lat,
        b.getNorthEast().lng,
        b.getNorthEast().lat
      ])
      setZoom(map.getZoom())
    }
    map.on('moveend', update)
    map.on('zoomend', update)
    update() 
    return () => {
      map.off('moveend', update)
      map.off('zoomend', update)
    }
  }, [map, setBounds, setZoom])

  return null
}

const getDirectionArrow = (deg: number) => {
  const directions = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖']
  const index = Math.round((deg % 360) / 45) % 8
  return directions[index]
}

const vehicleIconCache = new Map<string, L.DivIcon>()

const getVehicleIcon = (m: MarkerType, isSelected: boolean) => {
  const size = isSelected ? 14 : 10
  const angle = m.angle ?? 0
  const plateName = m.label?.split(' ')[0] ?? ''
  const color = m.color ?? '#94a3b8'
  
  const cacheKey = `${m.id}-${size}-${angle}-${color}-${plateName}-${isSelected}`
  const cached = vehicleIconCache.get(cacheKey)
  if (cached) return cached
  
  const directionArrow = getDirectionArrow(angle)

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; width: ${size * 1.5}px; height: ${size * 2.5}px;">
      ${isSelected && m.label ? `<div style="position: absolute; bottom: 100%; margin-bottom: 6px; background: white; padding: 4px 8px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 11px; font-weight: 700; white-space: nowrap; color: #0f172a; border: 1px solid ${m.color ?? '#e2e8f0'}; z-index: 10; display: flex; align-items: center; gap: 4px; left: 50%; transform: translateX(-50%);">
        <span>${plateName}</span>
        <span style="color: ${m.color ?? '#0f172a'}; font-size: 13px;">${directionArrow}</span>
      </div>` : ''}
      <div style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); transition: all 0.2s ease; transform: rotate(${angle}deg); transform-origin: center;">
        <svg viewBox="0 0 64 128" width="${size * 1.5}" height="${size * 2.5}">
          <rect x="8" y="24" width="8" height="20" rx="3" fill="#1e293b" />
          <rect x="48" y="24" width="8" height="20" rx="3" fill="#1e293b" />
          <rect x="6" y="70" width="8" height="20" rx="3" fill="#1e293b" />
          <rect x="50" y="70" width="8" height="20" rx="3" fill="#1e293b" />
          <rect x="6" y="96" width="8" height="20" rx="3" fill="#1e293b" />
          <rect x="50" y="96" width="8" height="20" rx="3" fill="#1e293b" />
          <path d="M 14 26 C 14 10 24 4 32 4 C 40 4 50 10 50 26 L 50 42 C 50 48 48 52 40 52 L 24 52 C 16 52 14 48 14 42 Z" fill="${color}" />
          <path d="M 18 30 L 46 30 L 44 14 C 44 14 40 10 32 10 C 24 10 20 14 20 14 Z" fill="#38bdf8" opacity="0.9" />
          <rect x="22" y="34" width="20" height="12" rx="4" fill="#ffffff" opacity="0.3" />
          <rect x="28" y="52" width="8" height="10" fill="#475569" />
          <rect x="10" y="60" width="44" height="64" rx="10" fill="#f8fafc" stroke="${m.color ?? '#cbd5e1'}" stroke-width="3" />
          <line x1="12" y1="76" x2="52" y2="76" stroke="${m.color ?? '#cbd5e1'}" stroke-width="2" opacity="0.5" />
          <line x1="12" y1="92" x2="52" y2="92" stroke="${m.color ?? '#cbd5e1'}" stroke-width="2" opacity="0.5" />
          <line x1="12" y1="108" x2="52" y2="108" stroke="${m.color ?? '#cbd5e1'}" stroke-width="2" opacity="0.5" />
          <circle cx="32" cy="68" r="4" fill="#94a3b8" />
          <circle cx="32" cy="84" r="4" fill="#94a3b8" />
          <circle cx="32" cy="100" r="4" fill="#94a3b8" />
          <circle cx="32" cy="116" r="4" fill="#94a3b8" />
          <line x1="20" y1="62" x2="20" y2="122" stroke="#ffffff" stroke-width="2" opacity="0.7" />
        </svg>
      </div>
    </div>
  `
  const icon = L.divIcon({
    html,
    className: '', 
    iconSize: [size * 1.5, size * 2.5],
    iconAnchor: [(size * 1.5) / 2, size * 2.5]
  })
  
  vehicleIconCache.set(cacheKey, icon)
  return icon
}

const clusterIconCache = new Map<string, L.DivIcon>()

const getClusterIcon = (cluster: any, supercluster: any) => {
  const count = cluster.properties.point_count
  const cacheKey = `cluster-${cluster.id}-${count}`
  const cached = clusterIconCache.get(cacheKey)
  if (cached) return cached

  // Optionally, get some leaves to show plates if it's a small cluster
  const maxLeavesToShow = 8
  const leaves = count <= maxLeavesToShow && supercluster ? supercluster.getLeaves(cluster.id, maxLeavesToShow) : []
  
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;" class="group">
      <div class="absolute bottom-full hidden group-hover:flex flex-col pb-2 z-50">
        <div class="flex flex-col bg-white p-3 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 min-w-[160px] max-h-[220px] overflow-y-auto cursor-default pointer-events-auto">
          <div class="text-[10px] font-bold text-slate-400 mb-2 border-b border-slate-100 pb-2 uppercase tracking-wider">Vehicles (${count})</div>
          ${leaves.length > 0 ? `
            <div class="flex flex-col gap-1.5">
              ${leaves.map((l: any) => {
                const m = l.properties.marker as MarkerType
                return `
                  <div class="flex items-center justify-between bg-slate-50/50 px-2 py-1.5 rounded-md">
                    <span class="text-[11px] font-bold text-slate-700">${m.label?.split(' ')[0] ?? ''}</span>
                    <div class="w-2.5 h-2.5 rounded-full shadow-sm" style="background-color: ${m.color ?? '#cbd5e1'};"></div>
                  </div>
                `
              }).join('')}
            </div>
          ` : `
             <div class="text-xs text-slate-500">Zoom in to view vehicles.</div>
          `}
        </div>
      </div>

      <div style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); transition: transform 0.2s ease; position: relative; display: flex; align-items: center; justify-content: center;" class="hover:scale-105">
        <div style="position: absolute; top: -10px; right: -10px; background: #ef4444; color: white; border-radius: 999px; padding: 2px 6px; font-size: 10px; font-weight: bold; border: 2px solid white; z-index: 10;">
          ${count}
        </div>
        <svg viewBox="0 0 64 128" width="14" height="24">
          <rect x="8" y="24" width="8" height="20" rx="3" fill="#1e293b" />
          <rect x="48" y="24" width="8" height="20" rx="3" fill="#1e293b" />
          <rect x="6" y="70" width="8" height="20" rx="3" fill="#1e293b" />
          <rect x="50" y="70" width="8" height="20" rx="3" fill="#1e293b" />
          <rect x="6" y="96" width="8" height="20" rx="3" fill="#1e293b" />
          <rect x="50" y="96" width="8" height="20" rx="3" fill="#1e293b" />
          <path d="M 14 26 C 14 10 24 4 32 4 C 40 4 50 10 50 26 L 50 42 C 50 48 48 52 40 52 L 24 52 C 16 52 14 48 14 42 Z" fill="#94a3b8" />
          <path d="M 18 30 L 46 30 L 44 14 C 44 14 40 10 32 10 C 24 10 20 14 20 14 Z" fill="#38bdf8" opacity="0.9" />
          <rect x="22" y="34" width="20" height="12" rx="4" fill="#ffffff" opacity="0.3" />
          <rect x="28" y="52" width="8" height="10" fill="#475569" />
          <rect x="10" y="60" width="44" height="64" rx="10" fill="#f8fafc" stroke="#94a3b8" stroke-width="3" />
        </svg>
      </div>
    </div>
  `
  const icon = L.divIcon({
    html,
    className: '',
    iconSize: [28, 48],
    iconAnchor: [14, 48]
  })
  clusterIconCache.set(cacheKey, icon)
  return icon
}

export default function MapView({
  center,
  zoom = 9,
  markers = [],
  selectedMarkerId,
  onMarkerSelect,
  onMapReady,
  styleUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', 
  className,
  isClustered = false
}: Props) {
  const apiRef = useRef<MapApi | null>(null)

  const [bounds, setBounds] = useState<[number, number, number, number] | undefined>(undefined)
  const [currentZoom, setCurrentZoom] = useState(zoom)

  const points = useMemo(() => {
    return markers.map(m => ({
      type: "Feature" as const,
      properties: {
        cluster: false,
        markerId: m.id,
        marker: m
      },
      geometry: {
        type: "Point" as const,
        coordinates: [m.position.lng, m.position.lat] as [number, number]
      }
    }))
  }, [markers])

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom: currentZoom,
    options: { radius: 75, maxZoom: 20 }
  })

  // When clustering is OFF, we still extremely aggressively cull points outside the map bounds
  // so we don't render 3000 markers at once, causing extreme lag.
  const renderFeatures = useMemo(() => {
    if (isClustered) return clusters
    if (!bounds) return points
    
    const [minLng, minLat, maxLng, maxLat] = bounds
    return points.filter(p => {
      const [lng, lat] = p.geometry.coordinates
      return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat
    })
  }, [isClustered, clusters, points, bounds])

  return (
    <div className={cn('w-full h-full min-h-[100px] overflow-hidden relative z-0', className)}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url={styleUrl}
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
        />
        <MapController 
          apiRef={apiRef} 
          onMapReady={onMapReady} 
          center={center} 
          zoomProp={zoom} 
          setBounds={setBounds}
          setZoom={setCurrentZoom}
        />
        
        {renderFeatures.map((feature: any) => {
          const [lng, lat] = feature.geometry.coordinates
          const { cluster: isCluster } = feature.properties
          
          if (isCluster) {
            return (
              <Marker
                key={`cluster-${feature.id}`}
                position={[lat, lng]}
                icon={getClusterIcon(feature, supercluster)}
                eventHandlers={{
                  click: () => {
                    if (!supercluster) return
                    const expansionZoom = Math.min(
                      supercluster.getClusterExpansionZoom(feature.id),
                      20
                    );
                    apiRef.current?.flyTo({ lat, lng }, expansionZoom)
                  }
                }}
              />
            )
          }

          const m = feature.properties.marker as MarkerType
          const isSelected = m.id === selectedMarkerId

          return (
              <Marker
              key={m.id}
              position={[m.position.lat, m.position.lng]}
              icon={getVehicleIcon(m, isSelected)}
              eventHandlers={{
                click: () => onMarkerSelect?.(m.id)
              }}
              zIndexOffset={isSelected ? 1000 : 0}
            />
          )
        })}
      </MapContainer>
    </div>
  )
}
