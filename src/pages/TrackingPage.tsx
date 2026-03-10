import { useEffect, useMemo, useState } from 'react'
import { fetchGpsVehicles } from '../data/gpsApi'
import type { GpsVehicle } from '../data/types'
import PageHeader from '../components/layout/PageHeader'
import MapView from '../components/map/MapView'
import { ModalOverlay } from '../components/ui/ModelOverlay'

export default function TrackingPage() {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [items, setItems] = useState<GpsVehicle[]>([])
  const [detailItem, setDetailItem] = useState<GpsVehicle | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(9)

  useEffect(() => {
    setLoading(true)
    setError(null)

    void fetchGpsVehicles()
      .then((data) => {
        setItems(data)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load GPS data')
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((t) => {
      const hay = [t.name, t.imei, t.group ?? '', t.status, t.engine].join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [items, search])

  const markers = useMemo(() => {
    return items
      .filter((t) => t.lat && t.lng)
      .map((t) => {
        const lat = Number(t.lat)
        const lng = Number(t.lng)
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

        const statusCategory = getStatusCategory(t)

        return {
          id: t.imei,
          position: { lat, lng },
          label: t.name,
          subtitle: t.status,
          status: t.status,
          color: statusCategory.color,
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

  const handleSelectVehicle = (vehicle: GpsVehicle) => {
    setSelectedId(vehicle.imei)
    setDetailItem(vehicle)

    const lat = Number(vehicle.lat)
    const lng = Number(vehicle.lng)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      // Zoom in to show roads clearly
      setZoom(15)
    }
  }

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Left Panel - Fleet List */}
      <div className="w-48 border-r border-[#D1D5DB] bg-white overflow-hidden flex flex-col">
        <div className="border-b border-[#D1D5DB] p-3">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Fleet List</div>
          <input
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Search Fleet…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#D1D5DB]">
          {loading && (
            <div className="p-4 text-sm text-text-muted">Loading…</div>
          )}
          {error && !loading && (
            <div className="p-4 text-sm text-red-600">Error: {error}</div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="p-4 text-sm text-text-muted">No vehicles.</div>
          )}

          {!loading &&
            !error &&
            filtered.map((t) => {
              const statusCategory = getStatusCategory(t)
              const isSelected = selectedId === t.imei

              return (
                <div
                  key={t.imei}
                  className={`p-3 text-left hover:bg-muted cursor-pointer transition ${
                    isSelected ? 'border-l-4 border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleSelectVehicle(t)}
                >
                  <div className="text-xs font-semibold text-text">{t.name}</div>
                  <div className="mt-1 text-xs text-text-muted">{t.group ?? 'No Group'}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                      style={{
                        backgroundColor: `${statusCategory.color}1A`,
                        color: statusCategory.color,
                      }}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>
              )
            })}
        </div>

        <div className="border-t border-[#D1D5DB] p-3 flex items-center justify-between text-xs">
          <span className="text-text-muted">SHOWING {filtered.length} OF {items.length}</span>
          <button className="text-primary hover:text-primary/80 transition font-semibold">
            VIEW ALL
          </button>
        </div>
      </div>

      {/* Center Panel - Map */}
      <div className="flex-1 relative">
        <MapView
          center={center}
          zoom={zoom}
          markers={markers}
          selectedMarkerId={selectedId}
          onMarkerSelect={(id) => {
            setSelectedId(id)
            setZoom(15)
          }}
        />
      </div>

      {/* Right Panel - Vehicle Details */}
      {detailItem && (
        <div className="w-96 border-l border-[#D1D5DB] bg-white overflow-hidden flex flex-col">
          <div className="border-b border-[#D1D5DB] p-4 bg-primary text-white flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-white/30 flex items-center justify-center text-white font-bold text-sm">
                  🚚
                </div>
                <div>
                  <div className="text-sm font-semibold">{detailItem.name} | SCANIA</div>
                  <div className="text-xs opacity-90">{getDisplayStatus(detailItem.status)}</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setDetailItem(null)}
              className="text-white hover:opacity-80 transition text-xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#D1D5DB]">
            {/* Driver Section */}
            <div className="p-4">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                Senior Captain
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                  {(detailItem.group || 'M')[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold text-text">{detailItem.group || 'Mudugueta Haile'}</div>
                  <div className="text-xs text-text-muted">IP: {detailItem.imei || 'EP-D-98624'}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 rounded-lg border border-primary text-primary text-xs font-semibold py-2 hover:bg-primary/5 transition">
                  ☎
                </button>
                <button className="flex-1 rounded-lg border border-primary text-primary text-xs font-semibold py-2 hover:bg-primary/5 transition">
                  💬
                </button>
              </div>
            </div>

            {/* Cargo Details */}
            <div className="p-4">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                Cargo Details
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">Fuel Type</span>
                  <span className="text-sm font-semibold text-text">Jet Fuel</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">Volume</span>
                  <span className="text-sm font-semibold text-text">45,000 Liters</span>
                </div>
              </div>
            </div>

            {/* Route Schedule */}
            <div className="p-4">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                Route Schedule
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
                98% Completed
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-text mb-1">Origin</div>
                  <div className="text-xs text-text-muted">Horizon Djibouti Terminal</div>
                  <div className="text-xs text-text-muted">Departure: 00:24, 04:30 AM</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Current Position</div>
                  <div className="text-xs text-text-muted">A1 Highway Near Nazret</div>
                  <div className="text-xs text-text-muted">Approx ETA 05:20 Hourly</div>
                </div>
              </div>
            </div>

            {/* Destination */}
            <div className="p-4">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                Destination
              </div>
              <div className="text-sm font-semibold text-text">Bole International Hub</div>
              <div className="text-xs text-primary mt-1">ETD: 20+43m/10:20 PM</div>
            </div>
          </div>

          <div className="border-t border-[#D1D5DB] p-3 flex gap-2">
            <button className="flex-1 rounded-lg bg-primary text-white text-xs font-semibold py-2.5 hover:bg-primary/90 transition">
              Open Telemetry
            </button>
            <button className="flex-1 rounded-lg border border-primary text-primary text-xs font-semibold py-2.5 hover:bg-primary/5 transition">
              Fuel Logs
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function getDisplayStatus(status: string): string {
  const lowerStatus = status.toLowerCase()
  if (lowerStatus.includes('moving')) return 'MOVING'
  if (lowerStatus.includes('idle')) return 'IDLE'
  if (lowerStatus.includes('stopped') || lowerStatus.includes('offline')) return 'OFFLINE'
  if (lowerStatus.includes('alert')) return 'ALERT'
  return status.toUpperCase()
}

function getStatusCategory(v: GpsVehicle): { color: string } {
  const status = v.status.toLowerCase()
  const speed = Number(v.speed)

  if (status.includes('moving') || Number.isFinite(speed) && speed > 0) {
    return { color: '#16a34a' } // green
  }

  if (status.includes('engine idle')) {
    return { color: '#eab308' } // yellow
  }

  if (status.includes('stopped') || status.includes('offline')) {
    return { color: '#dc2626' } // red
  }

  if (status.includes('alert')) {
    return { color: '#dc2626' } // red for alerts
  }

  // Fallback neutral cyan
  return { color: '#06b6d4' } // cyan
}

  if (status.includes('engine idle')) {
    return { color: '#eab308' } // yellow
  }

  if (status.includes('stopped') || status.includes('offline')) {
    return { color: '#dc2626' } // red
  }

  // Fallback neutral cyan
  return { color: '#27A2D8' }
}
