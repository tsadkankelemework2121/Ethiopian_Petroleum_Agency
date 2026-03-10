import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchGpsVehicles } from '../data/gpsApi'
import type { GpsVehicle } from '../data/types'
import MapView from '../components/map/MapView'

const COLORS = {
  blue: '#067cc1',
  gold: '#f59f0a',
  gray: '#cbd5e1',
  bg: '#f3f4f6',
} as const

export default function TrackingPage() {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [items, setItems] = useState<GpsVehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(9)
  const mapApiRef = useRef<import('../components/map/MapView').MapApi | null>(null)
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false)

  // Define statusTag function first (hoisted with function declaration)
  const statusTag = (v: GpsVehicle): { label: string; color: string } => {
    const status = v.status.toLowerCase()
    const speed = Number(v.speed)
    if (status.includes('offline')) return { label: 'OFFLINE', color: COLORS.gray }
    if (status.includes('alert')) return { label: 'ALERT', color: '#ef4444' }
    if (status.includes('idle') || (Number.isFinite(speed) && speed === 0 && v.engine === 'on')) {
      return { label: 'IDLE', color: COLORS.gold }
    }
    if (status.includes('moving') || (Number.isFinite(speed) && speed > 0)) {
      return { label: 'MOVING', color: '#22c55e' }
    }
    return { label: 'MOVING', color: '#22c55e' }
  }

  const plateFromName = (name: string) => name.trim().split(/\s+/)[0] ?? name

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (!cancelled) {
          setLoading(true)
          setError(null)
        }
        const data = await fetchGpsVehicles()
        if (!cancelled) setItems(data)
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load GPS data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((t) => {
      const hay = [t.name, t.imei, t.group ?? '', t.status, t.engine].join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [items, search])

  const fleetListItems = useMemo(() => filtered.slice(0, 5), [filtered])

  const markers = useMemo(() => {
    return items
      .filter((t) => t.lat && t.lng)
      .map((t) => {
        const lat = Number(t.lat)
        const lng = Number(t.lng)
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

        const tag = statusTag(t)
        const markerColor =
          tag.label === 'MOVING'
            ? '#22c55e'
            : tag.label === 'IDLE'
              ? COLORS.gold
              : tag.label === 'OFFLINE'
                ? COLORS.gray
                : '#ef4444'

        return {
          id: t.imei,
          position: { lat, lng },
          label: t.name,
          subtitle: t.status,
          status: t.status,
          color: markerColor,
        }
      })
      .filter((m): m is NonNullable<typeof m> => m !== null)
  }, [items])

  const center = useMemo(() => {
    const selected = markers.find((m) => m.id === selectedId)
    if (selected) return selected.position
    if (markers.length === 0) return { lat: 9.0192, lng: 38.7525 }
    const avgLat = markers.reduce((s, m) => s + m.position.lat, 0) / markers.length
    const avgLng = markers.reduce((s, m) => s + m.position.lng, 0) / markers.length
    return { lat: avgLat, lng: avgLng }
  }, [markers, selectedId])

  const selectedVehicle = useMemo(() => {
    if (selectedId) return items.find((v) => v.imei === selectedId) ?? null
    return items[0] ?? null
  }, [items, selectedId])

  const selectedPosition = useMemo(() => {
    if (!selectedVehicle) return null
    const lat = Number(selectedVehicle.lat)
    const lng = Number(selectedVehicle.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
    return { lat, lng }
  }, [selectedVehicle])

  const handleSelectVehicle = (vehicle: GpsVehicle) => {
    setSelectedId(vehicle.imei)

    const lat = Number(vehicle.lat)
    const lng = Number(vehicle.lng)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      // Zoom in to show roads clearly
      setZoom(15)
      mapApiRef.current?.flyTo({ lat, lng }, 15)
    }

    if (window.matchMedia('(max-width: 1279px)').matches) {
      setMobileDetailsOpen(true)
    }
  }

  return (
    <div className="relative mt-4 h-[calc(100vh-140px)]">
      {/* Map background */}
      <MapView
        className="absolute inset-0 h-full w-full rounded-2xl"
        center={center}
        zoom={zoom}
        markers={markers}
        selectedMarkerId={selectedId}
        onMarkerSelect={(id) => {
          setSelectedId(id)
          setZoom(15)
          const v = items.find((x) => x.imei === id)
          if (v) handleSelectVehicle(v)
        }}
        onMapReady={(api) => {
          mapApiRef.current = api
        }}
      />

      {/* Left overlay: fleet list */}
      <div className="absolute left-4 top-4 bottom-4 w-[320px] rounded-2xl border border-[#D1D5DB] bg-white/95 backdrop-blur-sm shadow-elevated flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#64748b' }}>
            Fleet list
          </div>
          <div className="mt-3 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 flex items-center gap-2">
            <div className="size-4 rounded-full" style={{ backgroundColor: COLORS.gray }} />
            <input
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Search fleet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-sm text-slate-600">Loading…</div>
          ) : error ? (
            <div className="p-4 text-sm text-red-600">{error}</div>
          ) : (
            fleetListItems.map((v) => {
              const tag = statusTag(v)
              const plate = plateFromName(v.name)
              const isSelected = v.imei === selectedId

              return (
                <button
                  key={v.imei}
                  type="button"
                  onClick={() => handleSelectVehicle(v)}
                  className="w-full px-5 py-4 text-left border-b border-[#EEF2F7] hover:bg-slate-50 transition"
                  style={isSelected ? { backgroundColor: 'rgba(6,124,193,0.08)' } : undefined}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold" style={{ color: isSelected ? COLORS.blue : '#0f172a' }}>
                        {plate}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500 truncate">{v.name}</div>
                    </div>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold"
                      style={{ backgroundColor: `${tag.color}1A`, color: tag.color }}
                    >
                      {tag.label}
                    </span>
                  </div>
                </button>
              )
            })
          )}
        </div>

        <div className="px-5 py-3 border-t border-[#EEF2F7] flex items-center justify-between text-[11px] text-slate-500">
          <span>
            SHOWING {fleetListItems.length} OF {items.length}
          </span>
          <button type="button" className="font-semibold" style={{ color: COLORS.blue }}>
            VIEW ALL
          </button>
        </div>
      </div>

      {/* Bottom controls - Simplified */}
      <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-[#D1D5DB] bg-white/95 px-4 py-2 shadow-card">
          <button 
            type="button" 
            className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 border border-[#E5E7EB] hover:bg-slate-50 transition"
          >
            LAYERS
          </button>
          <button 
            type="button" 
            className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 border border-[#E5E7EB] hover:bg-slate-50 transition"
          >
            TRAFFIC
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => mapApiRef.current?.zoomOut()}
              className="grid size-9 place-items-center rounded-full bg-white border border-[#D1D5DB] text-slate-700 hover:bg-slate-50 transition"
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedPosition) mapApiRef.current?.flyTo(selectedPosition, 15)
                else mapApiRef.current?.flyTo(center, zoom)
              }}
              className="grid size-10 place-items-center rounded-full text-white font-semibold hover:opacity-90 transition"
              style={{ backgroundColor: COLORS.blue }}
              aria-label="Center map"
            >
              CENTER
            </button>
            <button
              type="button"
              onClick={() => mapApiRef.current?.zoomIn()}
              className="grid size-9 place-items-center rounded-full bg-white border border-[#D1D5DB] text-slate-700 hover:bg-slate-50 transition"
              aria-label="Zoom in"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Right overlay: details (desktop) */}
      <div className="hidden xl:block absolute right-4 top-4 bottom-4 w-90 rounded-2xl border border-[#D1D5DB] bg-white/95 backdrop-blur-sm shadow-elevated overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="px-5 py-4 text-white" style={{ background: `linear-gradient(180deg, ${COLORS.blue}, #0b2a3a)` }}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold">{selectedVehicle ? plateFromName(selectedVehicle.name) : '—'}</div>
              <button 
                type="button" 
                className="text-white/80 hover:text-white transition"
                onClick={() => setSelectedId(undefined)}
                aria-label="Close details"
              >
                ×
              </button>
            </div>
            {selectedVehicle ? (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-[10px] font-semibold">
                <span>{statusTag(selectedVehicle).label}</span>
                <span className="h-1 w-1 rounded-full bg-white/60" />
                <span>{Number(selectedVehicle.speed) || 0} KM/H</span>
              </div>
            ) : null}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 text-sm">
            {selectedVehicle ? (
              <div className="space-y-5">
                <div className="rounded-xl border border-[#EEF2F7] bg-white p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Vehicle
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{selectedVehicle.name}</div>
                  <div className="mt-1 text-[11px] text-slate-500">IMEI: {selectedVehicle.imei}</div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Cargo details
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#EEF2F7] bg-white p-3">
                      <div className="text-[11px] text-slate-500">Odometer</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{selectedVehicle.odometer}</div>
                    </div>
                    <div className="rounded-xl border border-[#EEF2F7] bg-white p-3">
                      <div className="text-[11px] text-slate-500">Engine</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{selectedVehicle.engine}</div>
                    </div>
                    <div className="rounded-xl border border-[#EEF2F7] bg-white p-3">
                      <div className="text-[11px] text-slate-500">Fuel 1</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{selectedVehicle.fuel_1}</div>
                    </div>
                    <div className="rounded-xl border border-[#EEF2F7] bg-white p-3">
                      <div className="text-[11px] text-slate-500">Fuel 2</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{selectedVehicle.fuel_2}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Route schedule
                    </div>
                    <div className="text-[11px] font-semibold" style={{ color: COLORS.blue }}>
                      68% Completed
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl border border-[#EEF2F7] bg-white p-4 text-[11px] text-slate-600 space-y-2">
                    <div><span className="font-semibold text-slate-900">Last tracker</span>: {selectedVehicle.dt_tracker}</div>
                    <div><span className="font-semibold text-slate-900">Last GPS</span>: {selectedVehicle.lat}, {selectedVehicle.lng}</div>
                    <div><span className="font-semibold text-slate-900">Status</span>: {selectedVehicle.status}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-600">Select a vehicle to view details.</div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile slide-over details */}
      {mobileDetailsOpen ? (
        <div className="xl:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0"
            style={{ background: 'rgba(2,6,23,0.55)' }}
            onClick={() => setMobileDetailsOpen(false)}
            aria-label="Close mobile details"
          />
          <div className="absolute right-0 top-0 h-full w-[88vw] max-w-md bg-white shadow-elevated">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
              <div className="text-sm font-semibold text-slate-900">Vehicle details</div>
              <button 
                type="button" 
                onClick={() => setMobileDetailsOpen(false)} 
                className="text-slate-500 hover:text-slate-700 transition"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="p-5 text-sm text-slate-700">
              {selectedVehicle ? (
                <div className="space-y-3">
                  <div className="text-lg font-bold" style={{ color: COLORS.blue }}>
                    {plateFromName(selectedVehicle.name)}
                  </div>
                  <div className="text-[11px] text-slate-500">IMEI: {selectedVehicle.imei}</div>
                  <div className="text-[11px] text-slate-500">Status: {selectedVehicle.status}</div>
                  <div className="text-[11px] text-slate-500">Speed: {selectedVehicle.speed}</div>
                  <div className="text-[11px] text-slate-500">
                    GPS: {selectedVehicle.lat}, {selectedVehicle.lng}
                  </div>
                </div>
              ) : (
                <div>Select a vehicle.</div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}