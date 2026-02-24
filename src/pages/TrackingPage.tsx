import { useEffect, useMemo, useState } from 'react'
import { getDispatchTasks, getVehiclesOnTransit } from '../data/mockApi'
import type { DispatchTask } from '../data/types'
import PageHeader from '../components/layout/PageHeader'
import MapView from '../components/map/MapView'
import StatusPill from '../components/ui/StatusPill'
import { ModalOverlay } from '../components/ui/ModelOverlay'

export default function TrackingPage() {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [items, setItems] = useState<Awaited<ReturnType<typeof getVehiclesOnTransit>>>([])
  const [tasks, setTasks] = useState<DispatchTask[]>([])
  const [detailItem, setDetailItem] =
    useState<Awaited<ReturnType<typeof getVehiclesOnTransit>>[number] | null>(null)

  useEffect(() => {
    void Promise.all([getVehiclesOnTransit(), getDispatchTasks()]).then(([vt, t]) => {
      setItems(vt)
      setTasks(t)
    })
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((t) => {
      const hay = [
        t.vehiclePlate,
        t.peaDispatchNo,
        t.oilCompanyName,
        t.transporterName,
        t.destinationDepotId,
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [items, search])

  const markers = useMemo(() => {
    return items
      .filter((t) => t.lastGpsPoint?.position)
      .map((t) => ({
        id: t.peaDispatchNo,
        position: t.lastGpsPoint!.position,
        label: t.vehiclePlate,
        subtitle: t.peaDispatchNo,
        status: t.status,
      }))
  }, [items])

  const center = useMemo(() => {
    const selected = markers.find((m) => m.id === selectedId)
    if (selected) return selected.position
    if (markers.length === 0) return { lat: 9.0192, lng: 38.7525 }
    const avgLat = markers.reduce((s, m) => s + m.position.lat, 0) / markers.length
    const avgLng = markers.reduce((s, m) => s + m.position.lng, 0) / markers.length
    return { lat: avgLat, lng: avgLng }
  }, [markers, selectedId])

  const tasksByDispatchNo = useMemo(() => {
    return new Map(tasks.map((t) => [t.peaDispatchNo, t] as const))
  }, [tasks])

  return (
    <div>
      <PageHeader
        title="GPS Tracking"
        subtitle="Map + vehicle list (map provider will be connected to backend later)."
      />
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <MapView
            center={center}
            zoom={9}
            markers={markers}
            selectedMarkerId={selectedId}
            onMarkerSelect={setSelectedId}
          />
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-xl border border-[#D1D5DB] bg-white">
            <div className="border-b border-[#D1D5DB] p-4">
              <div className="text-sm font-semibold text-text">Vehicles</div>
              <div className="mt-1 text-xs text-text-muted">
                Mock list derived from dispatch tasks (ready to replace with backend later).
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Search plate, dispatch no…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  type="button"
                  className="rounded-lg bg-gradient-to-r from-primary to-primary-strong px-3 py-2 text-sm font-semibold text-slate-900 shadow-soft transition-shadow hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {filtered.length}
                </button>
              </div>
            </div>

            <div className="divide-y divide-[#D1D5DB]">
              {filtered.map((t) => {
                const task = tasksByDispatchNo.get(t.peaDispatchNo)
                return (
                  <div
                    key={t.peaDispatchNo}
                    className={`w-full p-4 text-left hover:bg-muted/60 cursor-pointer ${
                      selectedId === t.peaDispatchNo ? 'border-l-4 border-cyan-500 bg-cyan-50/30' : ''
                    }`}
                    onClick={() => setSelectedId(t.peaDispatchNo)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-text">{t.vehiclePlate}</div>
                        <div className="mt-1 text-xs text-text-muted">
                          Dispatch: {t.peaDispatchNo} • {t.oilCompanyName} • {t.transporterName}
                        </div>
                        <div className="mt-1 text-xs text-text-muted">
                          Last GPS:{' '}
                          {t.lastGpsPoint
                            ? `${t.lastGpsPoint.position.lat.toFixed(3)}, ${t.lastGpsPoint.position.lng.toFixed(3)}`
                            : '—'}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {task ? (
                          <StatusPill status={t.status} task={task} />
                        ) : (
                          <StatusPill status={t.status} />
                        )}
                        <button
                          type="button"
                          className="px-3 py-1 text-xs font-semibold rounded-lg border border-[#27A2D8] text-[#27A2D8] hover:bg-[#27A2D8]/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedId(t.peaDispatchNo)
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
        title={detailItem ? `${detailItem.vehiclePlate} - Details` : 'Vehicle Details'}
      >
        {detailItem && (
          <div className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs text-text-muted">Plate Number</div>
                <div className="font-semibold">{detailItem.vehiclePlate}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Dispatch No.</div>
                <div className="font-semibold">{detailItem.peaDispatchNo}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Oil Company</div>
                <div className="font-semibold">{detailItem.oilCompanyName}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Transporter</div>
                <div className="font-semibold">{detailItem.transporterName}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Destination Depot</div>
                <div className="font-semibold">{detailItem.destinationDepotName}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Engine / Status</div>
                <div className="font-semibold">{detailItem.status}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Last GPS Time (dt_tracker)</div>
                <div className="font-semibold">
                  {detailItem.lastGpsPoint ? detailItem.lastGpsPoint.timestamp : '—'}
                </div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Last GPS Position (lat, lng)</div>
                <div className="font-semibold">
                  {detailItem.lastGpsPoint
                    ? `${detailItem.lastGpsPoint.position.lat}, ${detailItem.lastGpsPoint.position.lng}`
                    : '—'}
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-3 text-xs text-text-muted">
              The other fields from your tracker payload (IMEI, odometer, fuel levels, etc.) can be
              mapped here once the backend provides them; this layout is ready to display them per
              vehicle.
            </div>
          </div>
        )}
      </ModalOverlay>
    </div>
  )
}
