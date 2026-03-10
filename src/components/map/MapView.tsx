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
      const size = isSelected ? 42 : 36

      let el = markerElsRef.current.get(m.id)
      if (!el) {
        el = document.createElement('div')
        el.style.cursor = 'pointer'
        el.addEventListener('click', () => onMarkerSelect?.(m.id))
        markerElsRef.current.set(m.id, el)
      }

      el.innerHTML = `
        <div style="
          width:${size}px;
          height:${size}px;
          background:${m.color ?? '#ffffff'};
          border-radius:10px;
          display:flex;
          align-items:center;
          justify-content:center;
          box-shadow:0 10px 22px rgba(2,6,23,0.22);
          border:2px solid ${isSelected ? '#067cc1' : 'rgba(203,213,225,0.9)'};
          transition:all 0.2s ease;
        ">
          <span style="font-size:${isSelected ? 20 : 18}px">🚚</span>
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