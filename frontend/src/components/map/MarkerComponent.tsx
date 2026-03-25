import { memo, useMemo } from 'react'
import { Marker } from 'react-leaflet'
import L from 'leaflet'

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

type Props = {
  marker: MarkerType
  isSelected: boolean
  onSelect: (id: string) => void
}

// ===== PHASE 2: OPTIMIZED ICON CACHE =====
// Cache key now ONLY includes id, color, and selection status
// Angle and label are NOT in the cache key because they change frequently
// We use CSS transform for rotation instead of regenerating the icon

const vehicleIconCache = new Map<string, L.DivIcon>()

const getDirectionArrow = (deg: number) => {
  const directions = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖']
  const index = Math.round((deg % 360) / 45) % 8
  return directions[index]
}

const getVehicleIcon = (marker: MarkerType, isSelected: boolean) => {
  const size = isSelected ? 14 : 10
  const angle = marker.angle ?? 0
  const plateName = marker.label?.split(' ')[0] ?? ''
  const color = marker.color ?? '#94a3b8'
  
  // ===== OPTIMIZED CACHE KEY =====
  // Only cache based on id, color, and selection state
  // This prevents cache misses when angle or label changes
  const cacheKey = `${marker.id}-${color}-${isSelected}`
  const cached = vehicleIconCache.get(cacheKey)
  if (cached) return cached
  
  const directionArrow = getDirectionArrow(angle)

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; width: ${size * 1.5}px; height: ${size * 2.5}px;">
      ${isSelected && marker.label ? `<div style="position: absolute; bottom: 100%; margin-bottom: 6px; background: white; padding: 4px 8px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 11px; font-weight: 700; white-space: nowrap; color: #0f172a; border: 1px solid ${marker.color ?? '#e2e8f0'}; z-index: 10; display: flex; align-items: center; gap: 4px; left: 50%; transform: translateX(-50%);">
        <span>${plateName}</span>
        <span style="color: ${marker.color ?? '#0f172a'}; font-size: 13px;">${directionArrow}</span>
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
          <rect x="10" y="60" width="44" height="64" rx="10" fill="#f8fafc" stroke="${marker.color ?? '#cbd5e1'}" stroke-width="3" />
          <line x1="12" y1="76" x2="52" y2="76" stroke="${marker.color ?? '#cbd5e1'}" stroke-width="2" opacity="0.5" />
          <line x1="12" y1="92" x2="52" y2="92" stroke="${marker.color ?? '#cbd5e1'}" stroke-width="2" opacity="0.5" />
          <line x1="12" y1="108" x2="52" y2="108" stroke="${marker.color ?? '#cbd5e1'}" stroke-width="2" opacity="0.5" />
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

// ===== MEMOIZED MARKER COMPONENT =====
// This component will ONLY re-render if:
// 1. isSelected changes (vehicle was selected/deselected)
// 2. marker.color changes (status changed)
// 3. onSelect function reference changes (unlikely)
//
// It will NOT re-render when:
// - Other vehicles are selected
// - Angle updates (parent re-renders)
// - Other marker properties change
const MarkerComponent = memo(
  ({ marker, isSelected, onSelect }: Props) => {
    const icon = useMemo(() => getVehicleIcon(marker, isSelected), [marker.id, marker.color, isSelected])

    return (
      <Marker
        position={[marker.position.lat, marker.position.lng]}
        icon={icon}
        eventHandlers={{
          click: () => onSelect(marker.id)
        }}
        zIndexOffset={isSelected ? 1000 : 0}
      />
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if these specific properties change
    return (
      prevProps.marker.id === nextProps.marker.id &&
      prevProps.marker.color === nextProps.marker.color &&
      prevProps.isSelected === nextProps.isSelected
    )
  }
)

MarkerComponent.displayName = 'MarkerComponent'

export default MarkerComponent
