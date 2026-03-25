
import { useEffect, useMemo, useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { getDepots, getDispatchTasks, getOilCompanies, getTransporters } from '../data/mockApi'
import type { Depot, DispatchTask, FuelType, OilCompany, Transporter } from '../data/types'
import StatusPill from '../components/ui/StatusPill'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { ModalOverlay } from '../components/ui/ModelOverlay'
import MapView from '../components/map/MapView'
import { MapPinIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

export default function FuelDispatchPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<DispatchTask[]>([])
  const [depots, setDepots] = useState<Depot[]>([])
  const [transporters, setTransporters] = useState<Transporter[]>([])
  const [oilCompanies, setOilCompanies] = useState<OilCompany[]>([])
  const [showNewDispatchForm, setShowNewDispatchForm] = useState(false)
  const [trackingTask, setTrackingTask] = useState<DispatchTask | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    void Promise.all([
      getDispatchTasks(user?.companyId), 
      getDepots(user?.companyId), 
      getTransporters(user?.companyId), 
      getOilCompanies()
    ]).then(
      ([t, d, tr, oc]) => {
        setTasks(t)
        setDepots(d)
        setTransporters(tr)
        setOilCompanies(oc)
      },
    )
  }, [user?.companyId])

  const transportersById = useMemo(() => new Map(transporters.map((t) => [t.id, t] as const)), [transporters])
  const depotsById = useMemo(() => new Map(depots.map((d) => [d.id, d] as const)), [depots])
  const oilCompaniesById = useMemo(() => new Map(oilCompanies.map((c) => [c.id, c] as const)), [oilCompanies])

  const vehiclesById = useMemo(() => {
    const vehicles = transporters.flatMap((t) => t.vehicles)
    return new Map(vehicles.map((v) => [v.id, v] as const))
  }, [transporters])

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesStatus = statusFilter === 'All' ? true : t.status === statusFilter

      const transporter = transportersById.get(t.transporterId)?.name ?? ''
      const vehicle = vehiclesById.get(t.vehicleId)?.plateRegNo ?? ''
      const depot = depotsById.get(t.destinationDepotId)?.name ?? ''
      const oilCompany = oilCompaniesById.get(t.oilCompanyId)?.name ?? ''

      const text =
        `${t.peaDispatchNo} ${transporter} ${vehicle} ${depot} ${oilCompany} ${t.fuelType}`.toLowerCase()

      const matchesSearch = text.includes(search.toLowerCase())

      return matchesStatus && matchesSearch
    })
  }, [
    tasks,
    search,
    statusFilter,
    transportersById,
    vehiclesById,
    depotsById,
    oilCompaniesById,
    user?.role,
    user?.companyId,
  ])

  return (
    <div>
      <ModalOverlay
        isOpen={showNewDispatchForm}
        onClose={() => setShowNewDispatchForm(false)}
        title="Add New Dispatch"
      >
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
      </ModalOverlay>

      {/* Tracking Modal */}
      <ModalOverlay
        isOpen={trackingTask !== null}
        onClose={() => setTrackingTask(null)}
        title={trackingTask ? `Tracking ${vehiclesById.get(trackingTask.vehicleId)?.plateRegNo ?? ''}` : 'Tracking'}
        noPadding
      >
        <div className="h-[65vh] min-h-[500px] w-full relative">
          {trackingTask?.lastGpsPoint ? (
            <MapView
              center={{ lat: trackingTask.lastGpsPoint.position.lat, lng: trackingTask.lastGpsPoint.position.lng }}
              zoom={13}
              markers={[
                {
                  id: trackingTask.vehicleId,
                  position: { lat: trackingTask.lastGpsPoint.position.lat, lng: trackingTask.lastGpsPoint.position.lng },
                  label: vehiclesById.get(trackingTask.vehicleId)?.plateRegNo ?? 'Vehicle',
                  status: trackingTask.status,
                  color: trackingTask.status === 'On transit' ? '#067cc1' : trackingTask.status === 'Delivered' ? '#22c55e' : '#f59f0a'
                }
              ]}
              className="absolute inset-0"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
              No recent GPS coordinates available for this vehicle.
            </div>
          )}
        </div>
      </ModalOverlay>

      <div className="space-y-6">

        <Card>
          <CardHeader
            title="Fuel Dispatches"
            subtitle={`${filteredTasks.length} dispatch records`}
          />

          <CardBody>

            {/* Search + Filter */}
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

              <input
                type="text"
                placeholder="Search dispatch..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-72 rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-56 rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="All">All Events</option>
                <option value="On transit">On transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Exceeded ETA">Exceeded ETA</option>
                <option value="GPS Offline >24h">GPS Offline &gt;24h</option>
                <option value="Stopped >5h">Stopped &gt;5h</option>
              </select>
              <div>
          <button
            type="button"
            onClick={() => setShowNewDispatchForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-primary-strong transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <PlusIcon className="size-4" />
            New Dispatch
          </button>
        </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-300 w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs text-text-muted">
                  <tr>
                    {[
                      'PEA Dispatch No.',
                      'Oil Company',
                      'Transporter',
                      'Vehicle Plate',
                      'Fuel Type',
                      'Liters',
                      'Dispatch Location',
                      'Destination Depot',
                      'Dispatch Date',
                      'ETA',
                      'Drop-off',
                      'Event',
                      '',
                    ].map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#D1D5DB]">
                  {filteredTasks.map((t) => {
                    const transporter = transportersById.get(t.transporterId)?.name ?? '—'
                    const vehicle = vehiclesById.get(t.vehicleId)?.plateRegNo ?? '—'
                    const depot = depotsById.get(t.destinationDepotId)?.name ?? t.destinationDepotId
                    const oilCompany = oilCompaniesById.get(t.oilCompanyId)?.name ?? '—'

                    return (
                      <tr key={t.peaDispatchNo} className="hover:bg-muted/30">
                        <td className="whitespace-nowrap px-4 py-4 font-semibold">
                          {t.peaDispatchNo}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">{oilCompany}</td>
                        <td className="whitespace-nowrap px-4 py-4">{transporter}</td>
                        <td className="whitespace-nowrap px-4 py-4">{vehicle}</td>
                        <td className="whitespace-nowrap px-4 py-4">{t.fuelType}</td>
                        <td className="whitespace-nowrap px-4 py-4">
                          {t.dispatchedLiters.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">{t.dispatchLocation}</td>
                        <td className="whitespace-nowrap px-4 py-4">{depot}</td>
                        <td className="whitespace-nowrap px-4 py-4">
                          {t.dispatchDateTime.replace('T', ' ').replace('Z', '')}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          {t.etaDateTime.replace('T', ' ').replace('Z', '')}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          {t.dropOffDateTime
                            ? t.dropOffDateTime.replace('T', ' ').replace('Z', '')
                            : '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <StatusPill status={t.status} task={t} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setTrackingTask(t)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                          >
                            <MapPinIcon className="size-3.5" />
                            Follow
                          </button>
                        </td>
                      </tr>
                    )
                  })}

                  {filteredTasks.length === 0 && (
                    <tr>
                      <td colSpan={13} className="px-4 py-6 text-text-muted">
                        No dispatch records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </CardBody>
        </Card>

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
          <label className="block text-sm font-semibold mb-1">PEA Dispatch No.</label>
          <input
            type="text"
            required
            placeholder="e.g. PEA001"
            value={formData.peaDispatchNo}
            onChange={(e) => setFormData({ ...formData, peaDispatchNo: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm"
          />
        </div>

        <div>
           <label className="block text-sm font-semibold mb-1">Oil Company</label>
          <select
            required
            value={formData.oilCompanyId}
            onChange={(e) => setFormData({ ...formData, oilCompanyId: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm"
          >
            <option value="">Select...</option>
            {oilCompanies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Transporter</label>
          <select
            required
            value={formData.transporterId}
            onChange={(e) =>
              setFormData({ ...formData, transporterId: e.target.value, vehicleId: '' })
            }
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm"
          >
            <option value="">Select...</option>
            {transporters.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Vehicle</label>
          <select
            required
            value={formData.vehicleId}
            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
            disabled={!formData.transporterId}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm"
          >
            <option value="">Select...</option>
            {availableVehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plateRegNo} - {v.manufacturer} {v.model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Dispatch Date & Time</label>
          <input
            type="datetime-local"
            required
            value={formData.dispatchDateTime}
            onChange={(e) => setFormData({ ...formData, dispatchDateTime: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Dispatch Location</label>
          <input
            type="text"
            required
            placeholder="Enter dispatch location"
            value={formData.dispatchLocation}
            onChange={(e) => setFormData({ ...formData, dispatchLocation: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Destination Depot</label>
          <select
            required
            value={formData.destinationDepotId}
            onChange={(e) => setFormData({ ...formData, destinationDepotId: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm"
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
          <label className="block text-sm font-semibold mb-1">ETA Date & Time</label>
          <input
            type="datetime-local"
            required
            value={formData.etaDateTime}
            onChange={(e) => setFormData({ ...formData, etaDateTime: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Fuel Type</label>
          <select
            required
            value={formData.fuelType}
            onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as FuelType })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm"
          >
            <option value="Benzine">Benzine</option>
            <option value="Diesel">Diesel</option>
            <option value="Jet Fuel">Jet Fuel</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Dispatched Liters</label>
          <input
            type="number"
            required
            min="1"
            placeholder="e.g. 45000"
            value={formData.dispatchedLiters}
            onChange={(e) => setFormData({ ...formData, dispatchedLiters: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm"
          />
        </div>

      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[#D1D5DB] px-4 py-2 text-sm"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-strong transition"
        >
          Create Dispatch
        </button>
      </div>
    </form>
  )
}

