import { useEffect, useMemo, useState } from 'react'
import { PlusIcon } from 'lucide-react'
import api from '../api/axios'
import { fetchGpsVehicles } from '../data/gpsApi'
import type { Depot, DispatchTask, FuelType, OilCompany, Transporter } from '../data/types'
import StatusPill from '../components/ui/StatusPill'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { ModalOverlay } from '../components/ui/ModelOverlay'
import MapView from '../components/map/MapView'
import { MapPinIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { GpsVehicle } from '../data/types'

export default function FuelDispatchPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showNewDispatchForm, setShowNewDispatchForm] = useState(false)
  const [trackingTask, setTrackingTask] = useState<DispatchTask | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const canAddDispatch = user?.role?.toUpperCase() === 'EPA_ADMIN' || user?.role?.toUpperCase() === 'SUPER_ADMIN'

  // Fetch Dispatches
  const { data: rawTasks = [], refetch: refetchTasks } = useQuery({
    queryKey: ['dispatches'],
    queryFn: async () => {
      const res = await api.get('/dispatches', { 
        params: user?.role?.toUpperCase() === 'OIL_COMPANY' ? { oil_company_id: user?.companyId } : {} 
      });
      return res.data.map((d: any) => ({
        peaDispatchNo: d.pea_dispatch_no,
        oilCompanyId: d.oil_company_id,
        transporterId: d.transporter_id,
        vehicleId: d.vehicle_id,
        dispatchDateTime: d.dispatch_datetime.replace(' ', 'T'),
        dispatchLocation: d.dispatch_location,
        destinationDepotId: d.destination_depot_id?.toString() || '',
        etaDateTime: d.eta_datetime.replace(' ', 'T'),
        dropOffDateTime: d.drop_off_datetime?.replace(' ', 'T'),
        fuelType: d.fuel_type,
        dispatchedLiters: Number(d.dispatched_liters),
        status: d.status,
      }));
    },
    refetchInterval: 5 * 60 * 1000,
  });

  // Fetch Depots
  const { data: depots = [] } = useQuery<Depot[]>({
    queryKey: ['depots'],
    queryFn: async () => {
      const res = await api.get('/depots');
      return res.data.map((d: any) => ({
        ...d,
        id: d.id.toString(),
        location: { region: d.region, city: d.city, address: d.address },
        contacts: {
          person1: d.person1, person2: d.person2,
          phone1: d.phone1, phone2: d.phone2,
          email1: d.email1, email2: d.email2
        },
        mapLocation: d.lat && d.lng ? { lat: Number(d.lat), lng: Number(d.lng) } : undefined,
        mapLink: d.map_link,
        oilCompanyId: d.oil_company_id,
      }));
    }
  });

  // Fetch GPS Vehicles
  const { data: vehicles = [] } = useQuery<GpsVehicle[]>({
    queryKey: ['gps-vehicles'],
    queryFn: fetchGpsVehicles,
    refetchInterval: 5 * 60 * 1000,
  });

  // Derived Mappings
  const oilCompanies = useMemo(() => {
    const names = Array.from(new Set(vehicles.map(v => v.group).filter(Boolean))) as string[];
    return names.map(name => ({ id: name, name: name, contacts: {} }));
  }, [vehicles]);

  const transporters = useMemo(() => {
    const transportersMap = new Map<string, Transporter>();
    vehicles.forEach((v) => {
      const transName = typeof v.custom_fields === 'string' ? v.custom_fields : '';
      if (!transName) return;
      if (!transportersMap.has(transName)) {
        transportersMap.set(transName, {
          id: transName,
          name: transName,
          location: { region: '—', city: '—', address: '—' },
          contacts: {},
          vehicles: [],
          oilCompanyId: v.group || undefined,
        });
      }
      transportersMap.get(transName)?.vehicles.push({
        id: v.imei,
        plateRegNo: v.name,
        trailerRegNo: '—',
        sideNo: '—',
        driverName: '—',
        manufacturer: '—',
        model: '—',
        yearOfManufacture: new Date().getFullYear(),
        driverPhone: '—',
      });
    });
    return Array.from(transportersMap.values());
  }, [vehicles]);

  const transportersById = useMemo(() => new Map(transporters.map((t) => [t.id, t] as const)), [transporters])
  const depotsById = useMemo(() => new Map(depots.map((d) => [d.id, d] as const)), [depots])
  const oilCompaniesById = useMemo(() => new Map(oilCompanies.map((c) => [c.id, c] as const)), [oilCompanies])

  const vehiclesById = useMemo(() => {
    const vehicles = transporters.flatMap((t) => t.vehicles)
    return new Map(vehicles.map((v) => [v.id, v] as const))
  }, [transporters])

  const filteredTasks = useMemo(() => {
    return rawTasks.filter((t) => {
      const matchesStatus = statusFilter === 'All' ? true : t.status === statusFilter

      const transporter = transportersById.get(t.transporterId)?.name ?? t.transporterId
      const vehicle = vehiclesById.get(t.vehicleId)?.plateRegNo ?? t.vehicleId
      const depot = depotsById.get(t.destinationDepotId)?.name ?? t.destinationDepotId
      const oilCompany = oilCompaniesById.get(t.oilCompanyId)?.name ?? t.oilCompanyId

      const text =
        `${t.peaDispatchNo} ${transporter} ${vehicle} ${depot} ${oilCompany} ${t.fuelType}`.toLowerCase()

      const matchesSearch = text.includes(search.toLowerCase())

      return matchesStatus && matchesSearch
    })
  }, [
    search,
    statusFilter,
    transportersById,
    vehiclesById,
    depotsById,
    oilCompaniesById,
    user?.role,
    user?.companyId,
    rawTasks
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
           vehicles={vehicles}
           depots={depots}
           onClose={() => setShowNewDispatchForm(false)}
           onSubmit={() => {
              queryClient.invalidateQueries({ queryKey: ['dispatches'] })
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
               {canAddDispatch && (
                 <button
                   type="button"
                   onClick={() => setShowNewDispatchForm(true)}
                   className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-primary-strong transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                 >
                   <PlusIcon className="size-4" />
                   New Dispatch
                 </button>
               )}
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
                    const transporter = transportersById.get(t.transporterId)?.name ?? t.transporterId
                    const vehicle = vehiclesById.get(t.vehicleId)?.plateRegNo ?? t.vehicleId
                    const depot = depotsById.get(t.destinationDepotId)?.name ?? t.destinationDepotId
                    const oilCompany = oilCompaniesById.get(t.oilCompanyId)?.name ?? t.oilCompanyId

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
                          {t.dispatchDateTime?.replace('T', ' ').replace('Z', '')}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          {t.etaDateTime?.replace('T', ' ').replace('Z', '')}
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
  vehicles,
  depots,
  onClose,
  onSubmit,
}: {
  oilCompanies: OilCompany[]
  vehicles: GpsVehicle[]
  depots: Depot[]
  onClose: () => void
  onSubmit: (task: DispatchTask) => void
}) {
  const [formData, setFormData] = useState({
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

  const [vehicleSearch, setVehicleSearch] = useState('')
  const [saving, setSaving] = useState(false)

  // Filter valid vehicles for this company
  const availableVehicles = useMemo(() => {
    if (!formData.oilCompanyId) return []
    return vehicles.filter(v => v.group === formData.oilCompanyId)
  }, [formData.oilCompanyId, vehicles])

  // Apply search filter locally
  const searchedVehicles = useMemo(() => {
    const q = vehicleSearch.trim().toLowerCase()
    return availableVehicles.filter(v => 
      v.name.toLowerCase().includes(q) || 
      v.imei.includes(q)
    )
  }, [availableVehicles, vehicleSearch])

  // Update available depots dynamically 
  const availableDepots = useMemo(() => {
    if (!formData.oilCompanyId) return []
    return depots.filter(d => d.oilCompanyId === formData.oilCompanyId)
  }, [formData.oilCompanyId, depots])

  // Auto-fill transporter when vehicle changes
  const handleVehicleChange = (vId: string) => {
    const vehicle = vehicles.find(v => v.imei === vId)
    const transporterName = typeof vehicle?.custom_fields === 'string' ? vehicle.custom_fields : ''
    setFormData(prev => ({
      ...prev,
      vehicleId: vId,
      transporterId: transporterName || '' // Using name as ID here as per existing logic
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      oil_company_id: formData.oilCompanyId,
      transporter_id: formData.transporterId || null,
      vehicle_id: formData.vehicleId,
      dispatch_datetime: formData.dispatchDateTime,
      dispatch_location: formData.dispatchLocation,
      destination_depot_id: formData.destinationDepotId,
      eta_datetime: formData.etaDateTime,
      fuel_type: formData.fuelType,
      dispatched_liters: Number(formData.dispatchedLiters),
    }

    api.post('/dispatches', payload).then((res) => {
         onSubmit({
          peaDispatchNo: res.data.pea_dispatch_no,
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
        })
    }).catch(err => {
         console.error('Failed to create dispatch:', err)
         alert('Error creating dispatch. Please ensure all required fields are filled.')
    }).finally(() => setSaving(false))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">

        <div>
           <label className="block text-sm font-semibold mb-1">Oil Company *</label>
          <select
            required
            value={formData.oilCompanyId}
            onChange={(e) => setFormData({ ...formData, oilCompanyId: e.target.value, destinationDepotId: '', transporterId: '', vehicleId: '' })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm"
          >
            <option value="">Select Company...</option>
            {oilCompanies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
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

        <div className="sm:col-span-2 space-y-2">
          <label className="block text-sm font-semibold mb-1">Select Vehicle *</label>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Search plate number..."
              disabled={!formData.oilCompanyId}
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
              className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm"
            />
            <select
              required
              size={5}
              value={formData.vehicleId}
              onChange={(e) => handleVehicleChange(e.target.value)}
              disabled={!formData.oilCompanyId}
              className="w-full rounded-lg border border-[#D1D5DB] bg-white px-1 py-1 text-sm overflow-y-auto"
            >
              {searchedVehicles.length === 0 ? (
                <option value="" disabled>No vehicles found</option>
              ) : (
                searchedVehicles.map((v) => (
                  <option key={v.imei} value={v.imei} className="px-2 py-1.5 hover:bg-muted rounded text-xs">
                    {v.name}
                  </option>
                ))
              )}
            </select>
            {formData.transporterId && (
              <div className="text-[10px] text-text-muted italic">
                Detected Transporter: <span className="font-semibold">{formData.transporterId}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Destination Depot</label>
          <select
            required
            disabled={!formData.oilCompanyId}
            value={formData.destinationDepotId}
            onChange={(e) => setFormData({ ...formData, destinationDepotId: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm"
          >
            <option value="">Select Depot...</option>
            {availableDepots.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.location.city})
              </option>
             ))}
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
            placeholder="e.g. Sululta"
            value={formData.dispatchLocation}
            onChange={(e) => setFormData({ ...formData, dispatchLocation: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold mb-1">ETA Date & Time</label>
          <input
            type="datetime-local"
            required
            value={formData.etaDateTime}
            onChange={(e) => setFormData({ ...formData, etaDateTime: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm"
          />
        </div>

      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[#D1D5DB] px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving || !formData.vehicleId}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-strong transition disabled:opacity-50"
        >
          {saving ? 'Creating...' : 'Create Dispatch'}
        </button>
      </div>
    </form>
  )
}

