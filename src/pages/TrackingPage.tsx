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

    const lat = Number(vehicle.lat)
    const lng = Number(vehicle.lng)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      // Zoom in to show roads clearly
      setZoom(15)
    }
  }

  return (
    <div>
      <PageHeader
        title="GPS Tracking"
        subtitle="Live GPS view of all vehicles."
      />
      <div className="relative mt-4 h-[calc(100vh-140px)]">
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

        <div className="absolute right-4 top-4 bottom-4 w-full max-w-md">
          <div className="flex h-full flex-col rounded-xl border border-[#D1D5DB] bg-white/95 backdrop-blur-sm">
            <div className="border-b border-[#D1D5DB] p-4">
              <div className="text-sm font-semibold text-text">Vehicles</div>
              <div className="mt-1 text-xs text-text-muted">
                Live data from GPS provider.
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Search plate, IMEI, status…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  type="button"
                  className="rounded-lg bg-[#27A2D8] px-3 py-2 text-sm font-semibold text-white shadow-card hover:bg-[#1d7fb0] transition"
                >
                  {filtered.length}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#D1D5DB]">
              {loading && (
                <div className="p-4 text-sm text-text-muted">Loading GPS data…</div>
              )}
              {error && !loading && (
                <div className="p-4 text-sm text-red-600">
                  Failed to load GPS data: {error}
                </div>
              )}
              {!loading && !error && filtered.length === 0 && (
                <div className="p-4 text-sm text-text-muted">No vehicles found.</div>
              )}

              {!loading &&
                !error &&
                filtered.map((t) => {
                  const statusCategory = getStatusCategory(t)
                  const lat = Number(t.lat)
                  const lng = Number(t.lng)
                  const hasPosition = Number.isFinite(lat) && Number.isFinite(lng)

                  return (
                    <div
                      key={t.imei}
                      className={`w-full p-4 text-left hover:bg-muted/60 cursor-pointer ${selectedId === t.imei ? 'border-l-4 border-cyan-500 bg-cyan-50/30' : ''
                        }`}
                      onClick={() => handleSelectVehicle(t)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-white text-xs font-semibold"
                            style={{ backgroundColor: statusCategory.color }}
                          >
                            {t.name.split(' ')[0]}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-text">{t.name}</div>
                            <div className="mt-1 text-xs text-text-muted">
                              IMEI: {t.imei}
                              {t.group ? ` • ${t.group}` : ''}
                            </div>
                            <div className="mt-1 text-xs text-text-muted">
                              Last GPS:{' '}
                              {hasPosition
                                ? `${lat.toFixed(3)}, ${lng.toFixed(3)}`
                                : '—'}{' '}
                              • {t.dt_tracker}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span
                            className="inline-flex rounded-full px-2 py-1 text-[11px] font-semibold"
                            style={{
                              backgroundColor: `${statusCategory.color}1A`,
                              color: statusCategory.color,
                            }}
                          >
                            {t.status}
                          </span>
                          <button
                            type="button"
                            className="px-3 py-1 text-xs font-semibold rounded-lg border border-[#27A2D8] text-[#27A2D8] hover:bg-[#27A2D8]/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectVehicle(t)
                              setDetailItem(t)
                            }}
                          >
                            See detail
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      </div>

      <ModalOverlay
        isOpen={detailItem !== null}
        onClose={() => setDetailItem(null)}
        title={detailItem ? `${detailItem.name} - Details` : 'Vehicle Details'}
      >
        {detailItem && (
          <div className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs text-text-muted">Plate Number</div>
                <div className="font-semibold">{detailItem.name}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">IMEI</div>
                <div className="font-semibold">{detailItem.imei}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Group</div>
                <div className="font-semibold">{detailItem.group ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Odometer</div>
                <div className="font-semibold">{detailItem.odometer}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Engine</div>
                <div className="font-semibold">{detailItem.engine}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Status</div>
                <div className="font-semibold">{detailItem.status}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Last GPS Time (dt_tracker)</div>
                <div className="font-semibold">{detailItem.dt_tracker}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Last GPS Position (lat, lng)</div>
                <div className="font-semibold">
                  {detailItem.lat}, {detailItem.lng}
                </div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Speed</div>
                <div className="font-semibold">{detailItem.speed} km/h</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Fuel 1</div>
                <div className="font-semibold">{detailItem.fuel_1}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Fuel 2</div>
                <div className="font-semibold">{detailItem.fuel_2}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Fuel CAN Level %</div>
                <div className="font-semibold">
                  {detailItem.fuel_can_level_percent ?? '—'}
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-3 text-xs text-text-muted">
              Server time: {detailItem.dt_server}. Altitude: {detailItem.altitude} m. Angle:{' '}
              {detailItem.angle}°. Raw CAN value: {detailItem.fuel_can_level_value ?? '—'}.
            </div>
          </div>
        )}
      </ModalOverlay>
    </div>
  )
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

  // Fallback neutral cyan
  return { color: '#27A2D8' }
}
