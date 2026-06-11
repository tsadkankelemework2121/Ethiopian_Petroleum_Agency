import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { GpsVehicle, DispatchTask, Depot } from '../../data/types'
import { isVehicleInDjibouti } from '../../lib/geofence'

type DjiboutiGeofenceReportProps = {
  gpsVehicles: GpsVehicle[]
  dispatches: DispatchTask[]
  depotsById: Map<string, Depot>
}

export default function DjiboutiGeofenceReport({
  gpsVehicles,
  dispatches,
  depotsById,
}: DjiboutiGeofenceReportProps) {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState<'all' | 'waiting' | 'loaded'>('all')

  // Map of active dispatches by vehicle ID (plate or imei)
  const activeDispatchesByVehicle = useMemo(() => {
    const map = new Map<string, DispatchTask>()
    dispatches.forEach((d) => {
      if (d.status && d.status.toLowerCase() !== 'delivered') {
        const vehicleKey = String(d.vehicleId).trim().toLowerCase()
        map.set(vehicleKey, d)
      }
    })
    return map
  }, [dispatches])

  // Filter vehicles into category lists
  const data = useMemo(() => {
    const allInside: GpsVehicle[] = []
    const insideWaiting: GpsVehicle[] = []
    const insideLoaded: GpsVehicle[] = []

    gpsVehicles.forEach((v) => {
      const isInside = isVehicleInDjibouti(v.lat, v.lng)
      const vehicleKey = String(v.imei).trim().toLowerCase()
      const plateKey = String(v.name).trim().toLowerCase()

      const activeDispatch = activeDispatchesByVehicle.get(vehicleKey) || activeDispatchesByVehicle.get(plateKey)
      const hasActiveDispatch = !!activeDispatch

      if (isInside) {
        allInside.push(v)
        if (hasActiveDispatch) {
          insideLoaded.push(v)
        } else {
          insideWaiting.push(v)
        }
      }
    })

    return {
      all: allInside,
      waiting: insideWaiting,
      loaded: insideLoaded,
    }
  }, [gpsVehicles, activeDispatchesByVehicle])

  const categoryConfig = {
    all: {
      title: 'All Vehicles in Djibouti',
      description: 'Vehicles currently located inside the Djibouti port geofence zone.',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      countColor: 'text-slate-900',
    },
    waiting: {
      title: 'Inside Djibouti — Waiting for Dispatch',
      description: 'Vehicles inside Djibouti but have no active dispatch assigned (unloaded & waiting).',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      countColor: 'text-amber-600',
    },
    loaded: {
      title: 'Inside Djibouti — Dispatch Assigned',
      description: 'Vehicles inside Djibouti with an active dispatch assigned (loaded & ready to depart).',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      countColor: 'text-emerald-600',
    },
  }

  const handleLocateVehicle = (imei: string) => {
    navigate(`/tracking?vehicle=${imei}`)
  }

  const selectedList = data[activeCategory]

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((catKey) => {
          const config = categoryConfig[catKey]
          const list = data[catKey]
          const isSelected = activeCategory === catKey

          return (
            <button
              key={catKey}
              onClick={() => setActiveCategory(catKey)}
              className={`text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between h-32 ${
                isSelected
                  ? 'bg-white border-primary shadow-lg ring-2 ring-primary/20 scale-[1.02]'
                  : 'bg-white border-[#D1D5DB] hover:border-slate-400 hover:shadow-md'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                {catKey === 'all' ? 'In Djibouti (Total)' : catKey === 'waiting' ? 'Waiting for Dispatch' : 'Dispatch Assigned'}
              </span>
              <div className="mt-2">
                <span className={`text-3xl font-extrabold tracking-tight ${config.countColor}`}>
                  {list.length}
                </span>
                <span className="text-xs text-text-muted ml-1.5 font-medium">vehicles</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Category Details Table */}
      <div className="rounded-2xl border border-[#D1D5DB] bg-white overflow-hidden shadow-card">
        <div className="p-5 border-b border-[#E5E7EB]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-text">
                {categoryConfig[activeCategory].title}
              </h3>
              <p className="text-xs text-text-muted mt-1 font-normal">
                {categoryConfig[activeCategory].description}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 max-w-fit ${categoryConfig[activeCategory].badgeColor}`}>
              {selectedList.length} Vehicles Listed
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Plate No.</th>
                <th className="px-5 py-3">Oil Company</th>
                <th className="px-5 py-3">Telemetry</th>
                <th className="px-5 py-3">Last GPS Ping</th>
                <th className="px-5 py-3">Active Dispatch</th>
                <th className="px-5 py-3">Target Destination</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedList.map((v) => {
                const vehicleKey = String(v.imei).trim().toLowerCase()
                const plateKey = String(v.name).trim().toLowerCase()
                const dispatch = activeDispatchesByVehicle.get(vehicleKey) || activeDispatchesByVehicle.get(plateKey)
                const isEngineOn = v.engine?.toLowerCase() === 'on'
                
                return (
                  <tr key={v.imei} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-text whitespace-nowrap">
                      {v.name}
                    </td>
                    <td className="px-5 py-3.5 text-text-muted whitespace-nowrap">
                      {v.group || '—'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-text">
                          {v.speed} km/h
                        </span>
                        <span className={`text-[10px] font-bold ${isEngineOn ? 'text-emerald-600' : 'text-slate-400'}`}>
                          Engine {v.engine || 'Off'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-text-muted whitespace-nowrap">
                      {v.dt_tracker || '—'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {dispatch ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-primary">
                            {dispatch.peaDispatchNo}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            {dispatch.fuelType} • {dispatch.dispatchedLiters.toLocaleString()} L
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic font-normal">
                          No Active Dispatch
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-text-muted whitespace-nowrap">
                      {dispatch ? (
                        depotsById.get(dispatch.destinationDepotId)?.name || dispatch.destinationDepotId
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleLocateVehicle(v.imei)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition"
                      >
                        <svg className="size-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Locate on Map
                      </button>
                    </td>
                  </tr>
                )
              })}

              {selectedList.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-text-muted italic">
                    No vehicles found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
