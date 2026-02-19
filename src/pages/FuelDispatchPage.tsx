import { useEffect, useMemo, useState } from 'react'
import { getDepots, getDispatchTasks, getTransporters, getVehiclesOnTransit } from '../data/mockApi'
import type { Depot, DispatchTask, FuelType, Transporter } from '../data/types'
import PageHeader from '../components/layout/PageHeader'

export default function FuelDispatchPage() {
  const [tasks, setTasks] = useState<DispatchTask[]>([])
  const [depots, setDepots] = useState<Depot[]>([])
  const [transporters, setTransporters] = useState<Transporter[]>([])
  const [transit, setTransit] = useState<Awaited<ReturnType<typeof getVehiclesOnTransit>>>([])
  const [fuelFilter, setFuelFilter] = useState<FuelType | 'All'>('All')

  useEffect(() => {
    void Promise.all([getDispatchTasks(), getDepots(), getTransporters(), getVehiclesOnTransit()]).then(
      ([t, d, tr, vt]) => {
      setTasks(t)
      setDepots(d)
      setTransporters(tr)
        setTransit(vt)
      },
    )
  }, [])

  const transportersById = useMemo(() => new Map(transporters.map((t) => [t.id, t] as const)), [transporters])
  const depotsById = useMemo(() => new Map(depots.map((d) => [d.id, d] as const)), [depots])
  const vehiclesById = useMemo(() => {
    const vehicles = transporters.flatMap((t) => t.vehicles)
    return new Map(vehicles.map((v) => [v.id, v] as const))
  }, [transporters])

  const totals = useMemo(() => {
    const byFuel: Record<string, number> = {}
    for (const t of tasks) byFuel[t.fuelType] = (byFuel[t.fuelType] ?? 0) + t.dispatchedLiters
    return byFuel
  }, [tasks])

  const transitFiltered = useMemo(() => {
    if (fuelFilter === 'All') return transit
    return transit.filter((t) => t.fuelType === fuelFilter)
  }, [fuelFilter, transit])

  return (
    <div>
      <PageHeader
        title="Fuel Dispatch & Transit"
        subtitle="Task assignments, dispatched fuel volume, and vehicles currently on transit."
      />
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-muted/50 p-4">
          <div className="text-sm font-semibold text-text">Task assignment</div>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="text-xs text-text-muted">
                <tr>
                  {[
                    'PEA Dispatch No.',
                    'Transporter',
                    'Vehicle Plate',
                    'Side No.',
                    'Fuel Type',
                    'Dispatched (Ltr)',
                    'Destination Depot',
                    'ETA',
                  ].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tasks.map((t) => {
                  const transporter = transportersById.get(t.transporterId)?.name ?? '—'
                  const vehicle = vehiclesById.get(t.vehicleId)?.plateRegNo ?? '—'
                  const depot = depotsById.get(t.destinationDepotId)?.id ?? t.destinationDepotId
                  const eta = t.etaDateTime.replace('T', ' ').replace('Z', '')
                  return (
                    <tr key={t.peaDispatchNo} className="bg-surface hover:bg-muted/40">
                      <td className="whitespace-nowrap px-3 py-3 text-text">{t.peaDispatchNo}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-text">{transporter}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-text">{vehicle}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-text">{vehiclesById.get(t.vehicleId)?.sideNo ?? '—'}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-text">{t.fuelType}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-text">
                        {t.dispatchedLiters.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-text">{depot}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-text">{eta}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {[
            { label: 'Benzine (Ltr)', value: (totals.Benzine ?? 0).toLocaleString() },
            { label: 'Diesel (Ltr)', value: (totals.Diesel ?? 0).toLocaleString() },
            { label: 'Jet Fuel (Ltr)', value: (totals['Jet Fuel'] ?? 0).toLocaleString() },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-border bg-surface p-4 shadow-soft">
              <div className="text-sm font-medium text-text-muted">{card.label}</div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-text">{card.value}</div>
              <div className="mt-3 h-2 rounded-full bg-border/50">
                <div className="h-2 w-2/3 rounded-full bg-primary" />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-surface shadow-soft">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-text">Vehicles on transit</div>
              <div className="mt-1 text-xs text-text-muted">
                Includes on-transit, exceeded ETA, offline GPS, and long stops.
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['All', 'Benzine', 'Diesel', 'Jet Fuel'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFuelFilter(f)}
                  className={[
                    'rounded-full px-4 py-2 text-sm font-semibold transition',
                    fuelFilter === f ? 'bg-primary text-slate-900' : 'bg-muted text-text hover:bg-muted/70',
                  ].join(' ')}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs text-text-muted">
                <tr>
                  {[
                    'Vehicle',
                    'Dispatch',
                    'Oil Company',
                    'Transporter',
                    'Fuel Type',
                    'Liters',
                    'Destination',
                    'ETA',
                    'Status',
                  ].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transitFiltered.map((t) => (
                  <tr key={t.peaDispatchNo} className="hover:bg-muted/40">
                    <td className="whitespace-nowrap px-3 py-3 text-text">{t.vehiclePlate}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-text">{t.peaDispatchNo}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-text">{t.oilCompanyName}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-text">{t.transporterName}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-text">{t.fuelType}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-text">
                      {t.dispatchedLiters.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-text">{t.destinationDepotId}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-text">
                      {t.etaDateTime.replace('T', ' ').replace('Z', '')}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-text">{t.status}</td>
                  </tr>
                ))}
                {transitFiltered.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-sm text-text-muted" colSpan={9}>
                      No vehicles match the selected filter.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

