import { useEffect, useMemo, useState } from 'react'
import { getDepots, getDispatchTasks, getOilCompanies, getTransporters } from '../data/mockApi'
import type { Depot, DispatchTask, FuelType, OilCompany, Transporter } from '../data/types'
import PageHeader from '../components/layout/PageHeader'
import StatusPill from '../components/ui/StatusPill'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function FuelDispatchPage() {
  const [tasks, setTasks] = useState<DispatchTask[]>([])
  const [depots, setDepots] = useState<Depot[]>([])
  const [transporters, setTransporters] = useState<Transporter[]>([])
  const [oilCompanies, setOilCompanies] = useState<OilCompany[]>([])
  const [showNewDispatchForm, setShowNewDispatchForm] = useState(false)

  useEffect(() => {
    void Promise.all([getDispatchTasks(), getDepots(), getTransporters(), getOilCompanies()]).then(
      ([t, d, tr, oc]) => {
        setTasks(t)
        setDepots(d)
        setTransporters(tr)
        setOilCompanies(oc)
      },
    )
  }, [])

  const transportersById = useMemo(() => new Map(transporters.map((t) => [t.id, t] as const)), [transporters])
  const depotsById = useMemo(() => new Map(depots.map((d) => [d.id, d] as const)), [depots])
  const oilCompaniesById = useMemo(() => new Map(oilCompanies.map((c) => [c.id, c] as const)), [oilCompanies])
  const vehiclesById = useMemo(() => {
    const vehicles = transporters.flatMap((t) => t.vehicles)
    return new Map(vehicles.map((v) => [v.id, v] as const))
  }, [transporters])

  const newOnTransit = useMemo(() => {
    return tasks.filter((t) => t.status === 'On transit')
  }, [tasks])

  const delivered = useMemo(() => {
    return tasks.filter((t) => t.status === 'Delivered')
  }, [tasks])

  const problems = useMemo(() => {
    return tasks.filter(
      (t) => t.status === 'Exceeded ETA' || t.status === 'GPS Offline >24h' || t.status === 'Stopped >5h',
    )
  }, [tasks])

  return (
    <div>
      <PageHeader
        title="Fuel Dispatch & Transit"
        subtitle="Monitor dispatches: new/on-transit, delivered, and problem alerts."
        right={
          <button
            type="button"
            onClick={() => setShowNewDispatchForm(!showNewDispatchForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-primary-strong transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <PlusIcon className="size-4" />
            New Dispatch
          </button>
        }
      />

      {showNewDispatchForm && (
        <Card className="mb-6">
          <CardHeader title="Add New Dispatch" />
          <CardBody>
            <NewDispatchForm
              oilCompanies={oilCompanies}
              transporters={transporters}
              depots={depots}
              onClose={() => setShowNewDispatchForm(false)}
              onSubmit={(newTask) => {
                setTasks([...tasks, newTask])
                setShowNewDispatchForm(false)
              }}
            />
          </CardBody>
        </Card>
      )}

      <div className="space-y-6">
        {/* New / On Transit Table */}
        <Card>
          <CardHeader
            title="New / On Transit"
            subtitle={`${newOnTransit.length} active dispatches currently in transit`}
          />
          <CardBody>
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs text-text-muted">
                  <tr>
                    {[
                      'PEA Dispatch No.',
                      'Oil Company',
                      'Transporter',
                      'Vehicle Plate',
                      'Fuel Type',
                      'Liters',
                      'Destination Depot',
                      'Dispatch Date',
                      'ETA',
                      'Status',
                    ].map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1D5DB]">
                  {newOnTransit.map((t) => {
                    const transporter = transportersById.get(t.transporterId)?.name ?? '—'
                    const vehicle = vehiclesById.get(t.vehicleId)?.plateRegNo ?? '—'
                    const depot = depotsById.get(t.destinationDepotId)?.name ?? t.destinationDepotId
                    const oilCompany = oilCompaniesById.get(t.oilCompanyId)?.name ?? '—'
                    return (
                      <tr key={t.peaDispatchNo} className="hover:bg-muted/30">
                        <td className="whitespace-nowrap px-4 py-4 font-semibold text-text">{t.peaDispatchNo}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">{oilCompany}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">{transporter}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">{vehicle}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">{t.fuelType}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">
                          {t.dispatchedLiters.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">{depot}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">
                          {t.dispatchDateTime.replace('T', ' ').replace('Z', '')}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">
                          {t.etaDateTime.replace('T', ' ').replace('Z', '')}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <StatusPill status={t.status} task={t} />
                        </td>
                      </tr>
                    )
                  })}
                  {newOnTransit.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-sm text-text-muted" colSpan={10}>
                        No dispatches on transit.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Delivered Table */}
        <Card>
          <CardHeader title="Delivered" subtitle={`${delivered.length} completed dispatches`} />
          <CardBody>
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs text-text-muted">
                  <tr>
                    {[
                      'PEA Dispatch No.',
                      'Oil Company',
                      'Transporter',
                      'Vehicle Plate',
                      'Fuel Type',
                      'Liters',
                      'Destination Depot',
                      'Dispatch Date',
                      'ETA',
                      'Drop-off Date',
                      'Status',
                    ].map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1D5DB]">
                  {delivered.map((t) => {
                    const transporter = transportersById.get(t.transporterId)?.name ?? '—'
                    const vehicle = vehiclesById.get(t.vehicleId)?.plateRegNo ?? '—'
                    const depot = depotsById.get(t.destinationDepotId)?.name ?? t.destinationDepotId
                    const oilCompany = oilCompaniesById.get(t.oilCompanyId)?.name ?? '—'
                    return (
                      <tr key={t.peaDispatchNo} className="hover:bg-muted/30">
                        <td className="whitespace-nowrap px-4 py-4 font-semibold text-text">{t.peaDispatchNo}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">{oilCompany}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">{transporter}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">{vehicle}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">{t.fuelType}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">
                          {t.dispatchedLiters.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">{depot}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">
                          {t.dispatchDateTime.replace('T', ' ').replace('Z', '')}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">
                          {t.etaDateTime.replace('T', ' ').replace('Z', '')}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">
                          {t.dropOffDateTime ? t.dropOffDateTime.replace('T', ' ').replace('Z', '') : '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <StatusPill status={t.status} task={t} />
                        </td>
                      </tr>
                    )
                  })}
                  {delivered.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-sm text-text-muted" colSpan={11}>
                        No delivered dispatches.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Problem Dispatches Table */}
        <div id="problem-dispatches">
        <Card>
          <CardHeader
            title="Problem Dispatches"
            subtitle={`${problems.length} dispatches requiring attention: exceeded ETA, GPS offline, or stopped >5h`}
          />
          <CardBody>
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs text-text-muted">
                  <tr>
                    {[
                      'PEA Dispatch No.',
                      'Oil Company',
                      'Transporter',
                      'Vehicle Plate',
                      'Fuel Type',
                      'Liters',
                      'Destination Depot',
                      'Dispatch Date',
                      'ETA',
                      'Last GPS Location',
                      'Status',
                    ].map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1D5DB]">
                  {problems.map((t) => {
                    const transporter = transportersById.get(t.transporterId)?.name ?? '—'
                    const vehicle = vehiclesById.get(t.vehicleId)?.plateRegNo ?? '—'
                    const depot = depotsById.get(t.destinationDepotId)?.name ?? t.destinationDepotId
                    const oilCompany = oilCompaniesById.get(t.oilCompanyId)?.name ?? '—'
                    const lastLocation = t.lastGpsPoint
                      ? `${t.lastGpsPoint.position.lat.toFixed(3)}, ${t.lastGpsPoint.position.lng.toFixed(3)}`
                      : '—'
                    return (
                      <tr key={t.peaDispatchNo} className="hover:bg-muted/30">
                        <td className="whitespace-nowrap px-4 py-4 font-semibold text-text">{t.peaDispatchNo}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">{oilCompany}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">{transporter}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">{vehicle}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">{t.fuelType}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">
                          {t.dispatchedLiters.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">{depot}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">
                          {t.dispatchDateTime.replace('T', ' ').replace('Z', '')}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-text">
                          {t.etaDateTime.replace('T', ' ').replace('Z', '')}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-xs text-text-muted">{lastLocation}</td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <StatusPill status={t.status} task={t} />
                        </td>
                      </tr>
                    )
                  })}
                  {problems.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-sm text-text-muted" colSpan={11}>
                        No problem dispatches.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
        </div>
      </div>
    </div>
  )
}

function NewDispatchForm({
  oilCompanies,
  transporters,
  depots,
  onClose,
  onSubmit,
}: {
  oilCompanies: OilCompany[]
  transporters: Transporter[]
  depots: Depot[]
  onClose: () => void
  onSubmit: (task: DispatchTask) => void
}) {
  const [formData, setFormData] = useState({
    peaDispatchNo: '',
    oilCompanyId: '',
    transporterId: '',
    vehicleId: '',
    dispatchDateTime: '',
    dispatchLocation: '',
    destinationDepotId: '',
    etaDateTime: '',
    fuelType: 'Benzine' as FuelType,
    dispatchedLiters: '',
  })

  const availableVehicles = useMemo(() => {
    if (!formData.transporterId) return []
    const transporter = transporters.find((t) => t.id === formData.transporterId)
    return transporter?.vehicles ?? []
  }, [formData.transporterId, transporters])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newTask: DispatchTask = {
      peaDispatchNo: formData.peaDispatchNo,
      oilCompanyId: formData.oilCompanyId,
      transporterId: formData.transporterId,
      vehicleId: formData.vehicleId,
      dispatchDateTime: formData.dispatchDateTime,
      dispatchLocation: formData.dispatchLocation,
      destinationDepotId: formData.destinationDepotId,
      etaDateTime: formData.etaDateTime,
      fuelType: formData.fuelType,
      dispatchedLiters: Number(formData.dispatchedLiters),
      status: 'On transit',
    }
    onSubmit(newTask)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-text mb-1">PEA Dispatch No.</label>
          <input
            type="text"
            required
            value={formData.peaDispatchNo}
            onChange={(e) => setFormData({ ...formData, peaDispatchNo: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Oil Company</label>
          <select
            required
            value={formData.oilCompanyId}
            onChange={(e) => setFormData({ ...formData, oilCompanyId: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Select...</option>
            {oilCompanies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Transporter</label>
          <select
            required
            value={formData.transporterId}
            onChange={(e) => setFormData({ ...formData, transporterId: e.target.value, vehicleId: '' })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Select...</option>
            {transporters.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Vehicle</label>
          <select
            required
            value={formData.vehicleId}
            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
            disabled={!formData.transporterId}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 disabled:bg-muted/40"
          >
            <option value="">Select transporter first...</option>
            {availableVehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plateRegNo} - {v.manufacturer} {v.model}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Dispatch Date & Time</label>
          <input
            type="datetime-local"
            required
            value={formData.dispatchDateTime}
            onChange={(e) => setFormData({ ...formData, dispatchDateTime: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Dispatch Location</label>
          <input
            type="text"
            required
            value={formData.dispatchLocation}
            onChange={(e) => setFormData({ ...formData, dispatchLocation: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Destination Depot</label>
          <select
            required
            value={formData.destinationDepotId}
            onChange={(e) => setFormData({ ...formData, destinationDepotId: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Select...</option>
            {depots.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.location.city})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">ETA Date & Time</label>
          <input
            type="datetime-local"
            required
            value={formData.etaDateTime}
            onChange={(e) => setFormData({ ...formData, etaDateTime: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Fuel Type</label>
          <select
            required
            value={formData.fuelType}
            onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as FuelType })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="Benzine">Benzine</option>
            <option value="Diesel">Diesel</option>
            <option value="Jet Fuel">Jet Fuel</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Dispatched Liters</label>
          <input
            type="number"
            required
            min="1"
            value={formData.dispatchedLiters}
            onChange={(e) => setFormData({ ...formData, dispatchedLiters: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-semibold text-text hover:bg-muted/60"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-primary-strong transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Create Dispatch
        </button>
      </div>
    </form>
  )
}
