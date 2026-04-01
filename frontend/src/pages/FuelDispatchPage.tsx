import { useEffect, useMemo, useState } from 'react'
import { PlusIcon } from 'lucide-react'
import api from '../api/axios'
import { fetchGpsVehicles } from '../data/gpsApi'
import type { Depot, DispatchTask, FuelType, OilCompany } from '../data/types'
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
  const [showDispatchForm, setShowDispatchForm] = useState(false)
  const [editingTask, setEditingTask] = useState<any | null>(null)
  const [trackingTask, setTrackingTask] = useState<DispatchTask | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const canAddDispatch = user?.role?.toUpperCase() === 'EPA_ADMIN' || user?.role?.toUpperCase() === 'SUPER_ADMIN'

  // Fetch Dispatches
  const { data: rawTasks = [], isLoading: isDispatchesLoading } = useQuery({
    queryKey: ['dispatches'],
    queryFn: async () => {
      const res = await api.get('/dispatches', { 
        params: user?.role?.toUpperCase() === 'OIL_COMPANY' ? { oil_company_id: user?.companyId } : {} 
      });
      return res.data?.map((d: any) => ({
        peaDispatchNo: d.pea_dispatch_no,
        oilCompanyId: d.oil_company_id,
        transporterId: d.transporter_id,
        vehicleId: d.vehicle_id,
        dispatchDateTime: d.dispatch_datetime?.replace(' ', 'T'),
        dispatchLocation: d.dispatch_location,
        destinationDepotId: d.destination_depot_id?.toString() || '',
        etaDateTime: d.eta_datetime?.replace(' ', 'T'),
        dropOffDateTime: d.drop_off_datetime?.replace(' ', 'T'),
        fuelType: d.fuel_type,
        dispatchedLiters: Number(d.dispatched_liters || 0),
        status: d.status,
      })) || [];
    },
    staleTime: 5 * 60 * 1000, 
    refetchInterval: 5 * 60 * 1000,
  });

  // Fetch Depots
  const { data: depots = [], isLoading: isDepotsLoading } = useQuery<Depot[]>({
    queryKey: ['depots'],
    queryFn: async () => {
      const res = await api.get('/depots');
      return res.data?.map((d: any) => ({
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
      })) || [];
    },
    staleTime: 10 * 60 * 1000, 
  });

  // Fetch GPS Vehicles
  const { data: vehicles = [], isLoading: isVehiclesLoading } = useQuery<GpsVehicle[]>({
    queryKey: ['gps-vehicles'],
    queryFn: fetchGpsVehicles,
    staleTime: 60 * 1000, 
    refetchInterval: 5 * 60 * 1000,
  });

  const isInitialLoading = isDispatchesLoading || isDepotsLoading || isVehiclesLoading;

  // Derived Mappings
  const oilCompanies = useMemo(() => {
    const names = Array.from(new Set(vehicles.map(v => v.group).filter(Boolean))) as string[];
    return names.map(name => ({ id: name, name: name, contacts: {} }));
  }, [vehicles]);

  const depotsById = useMemo(() => new Map(depots.map((d) => [d.id, d] as const)), [depots])

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setShowDispatchForm(true);
  };

  const handleDelete = async (peaDispatchNo: string) => {
    if (!window.confirm(`Are you sure you want to delete dispatch ${peaDispatchNo}?`)) return;
    
    try {
      await api.delete(`/dispatches/${peaDispatchNo}`);
      queryClient.invalidateQueries({ queryKey: ['dispatches'] });
    } catch (err) {
      console.error('Failed to delete dispatch:', err);
      alert('Error deleting dispatch. Only EPA admins are authorized.');
    }
  };

  const handleConfirmReceipt = async (peaDispatchNo: string) => {
    if (!window.confirm("Are you sure you have received this dispatch? This will mark it as Delivered.")) return;

    try {
      await api.post(`/dispatches/${peaDispatchNo}/deliver`);
      queryClient.invalidateQueries({ queryKey: ['dispatches'] });
    } catch (err) {
      console.error('Failed to confirm delivery:', err);
      alert('Error confirming delivery. Ensure you have authorized access.');
    }
  };

  const filteredTasks = useMemo(() => {
    return rawTasks.filter((t: any) => {
      const matchesStatus = statusFilter === 'All' ? true : t.status === statusFilter

      const transporter = t.transporterId || '—'
      const vehicle = vehicles.find(v => v.imei === t.vehicleId || v.name === t.vehicleId)?.name ?? t.vehicleId
      const depot = depotsById.get(t.destinationDepotId)?.name ?? t.destinationDepotId
      const oilCompany = t.oilCompanyId

      const text =
        `${t.peaDispatchNo} ${transporter} ${vehicle} ${depot} ${oilCompany} ${t.fuelType}`.toLowerCase()

      const matchesSearch = text.includes(search.toLowerCase())

      return matchesStatus && matchesSearch
    })
  }, [search, statusFilter, vehicles, depotsById, rawTasks])

  if (isInitialLoading && rawTasks.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-text-muted">Loading dispatch data...</p>
      </div>
    )
  }

  return (
    <div>
      <ModalOverlay
        isOpen={showDispatchForm}
        onClose={() => {
            setShowDispatchForm(false)
            setEditingTask(null)
        }}
        title={editingTask ? `Edit Dispatch: ${editingTask.peaDispatchNo}` : "Add New Dispatch"}
      >
        <DispatchForm
           oilCompanies={oilCompanies}
           vehicles={vehicles}
           depots={depots}
           dispatches={rawTasks}
           editingTask={editingTask}
           onClose={() => {
                setShowDispatchForm(false)
                setEditingTask(null)
           }}
           onSubmit={() => {
              queryClient.invalidateQueries({ queryKey: ['dispatches'] })
              setShowDispatchForm(false)
              setEditingTask(null)
           }}
        />
      </ModalOverlay>

      {/* Tracking Modal */}
      <ModalOverlay
        isOpen={trackingTask !== null}
        onClose={() => setTrackingTask(null)}
        title={trackingTask ? `Tracking: ${trackingTask.vehicleId}` : 'Tracking'}
        noPadding
      >
        <div className="h-[65vh] min-h-[500px] w-full relative">
          {(() => {
            const gpsVehicle = vehicles.find(v => v.name === trackingTask?.vehicleId || v.imei === trackingTask?.vehicleId);
             if (gpsVehicle && gpsVehicle.lat && gpsVehicle.lng) {
                 const lat = Number(gpsVehicle.lat);
                 const lng = Number(gpsVehicle.lng);
                 return (
                    <MapView
                      center={{ lat, lng }}
                      zoom={13}
                      markers={[
                        {
                          id: gpsVehicle.imei,
                          position: { lat, lng },
                          label: gpsVehicle.name,
                          status: trackingTask?.status || 'On transit',
                          color: trackingTask?.status === 'Delivered' ? '#22c55e' : '#067cc1'
                        }
                      ]}
                      className="absolute inset-0"
                    />
                 )
             }
             return (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
                      No live GPS coordinates available for this vehicle.
                    </div>
             )
          })()}
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
                   onClick={() => setShowDispatchForm(true)}
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
                  {filteredTasks.map((t: any) => {
                    const vehicle = vehicles.find(v => v.imei === t.vehicleId || v.name === t.vehicleId)?.name ?? t.vehicleId
                    const depot = depotsById.get(t.destinationDepotId)?.name ?? t.destinationDepotId
                    const oilCompany = t.oilCompanyId

                    return (
                      <tr key={t.peaDispatchNo} className="hover:bg-muted/30">
                        <td className="whitespace-nowrap px-4 py-4 font-semibold">
                          {t.peaDispatchNo}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">{oilCompany}</td>
                        <td className="whitespace-nowrap px-4 py-4">{t.transporterId || '—'}</td>
                        <td className="whitespace-nowrap px-4 py-4">{vehicle}</td>
                        <td className="whitespace-nowrap px-4 py-4">{t.fuelType || '—'}</td>
                        <td className="whitespace-nowrap px-4 py-4">
                          {(t.dispatchedLiters || 0).toLocaleString()} L
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
                        <td className="whitespace-nowrap px-4 py-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => setTrackingTask(t)}
                            title="Follow Map"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                          >
                            <MapPinIcon className="size-3.5" />
                          </button>

                          {(user?.role?.toUpperCase() === 'OIL_COMPANY' || user?.role?.toUpperCase() === 'OIL_COMPANY_ADMIN') && t.status !== 'Delivered' && (
                             <button
                               type="button"
                               onClick={() => handleConfirmReceipt(t.peaDispatchNo)}
                               className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100 transition"
                             >
                               Confirm Receipt
                             </button>
                          )}

                          {canAddDispatch && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleEdit(t)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(t.peaDispatchNo)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                              >
                                Delete
                              </button>
                            </>
                          )}
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

function DispatchForm({
  oilCompanies,
  vehicles,
  depots,
  dispatches,
  editingTask,
  onClose,
  onSubmit,
}: {
  oilCompanies: OilCompany[]
  vehicles: GpsVehicle[]
  depots: Depot[]
  dispatches: any[]
  editingTask?: any
  onClose: () => void
  onSubmit: (task: DispatchTask) => void
}) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    oilCompanyId: editingTask?.oilCompanyId || '',
    transporterId: editingTask?.transporterId || '',
    vehicleId: editingTask?.vehicleId || '',
    dispatchDateTime: (editingTask?.dispatchDateTime || '').split('.')[0],
    dispatchLocation: editingTask?.dispatchLocation || '',
    destinationDepotId: editingTask?.destinationDepotId || '',
    etaDateTime: (editingTask?.etaDateTime || '').split('.')[0],
    fuelType: (editingTask?.fuelType || 'Benzine') as FuelType,
    dispatchedLiters: editingTask?.dispatchedLiters || '',
    status: editingTask?.status || 'On transit'
  })

  // Set default company if user is Oil Company
  useEffect(() => {
    if (!editingTask && (user?.role?.toUpperCase() === 'OIL_COMPANY' || user?.role?.toUpperCase() === 'OIL_COMPANY_ADMIN')) {
      setFormData(prev => ({ ...prev, oilCompanyId: user.companyId || '' }));
    }
  }, [user, editingTask]);

  const [vehicleSearch, setVehicleSearch] = useState('')
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false)
  const [saving, setSaving] = useState(false)

  // Initialization: if editing, set the search text to the plate number
  useEffect(() => {
    if (editingTask?.vehicleId) {
       const v = vehicles.find(veh => veh.imei === editingTask.vehicleId);
       if (v) setVehicleSearch(v.name);
    }
  }, [editingTask, vehicles]);

  // Filter valid vehicles for this company
  const availableVehicles = useMemo(() => {
    if (!formData.oilCompanyId) return []
    
    // Identify vehicles already on an active dispatch (EXCLUDING current one if editing)
    const occupiedVehicleIds = new Set(
      dispatches
        .filter(d => d.status !== 'Delivered' && d.peaDispatchNo !== editingTask?.peaDispatchNo)
        .map(d => d.vehicleId)
    )

    return vehicles.filter(v => 
      v.group === formData.oilCompanyId && 
      !occupiedVehicleIds.has(v.imei)
    )
  }, [formData.oilCompanyId, vehicles, dispatches, editingTask])

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
  const handleVehicleSelect = (v: GpsVehicle) => {
    const transporterName = typeof v.custom_fields === 'string' ? v.custom_fields : ''
    setFormData(prev => ({
      ...prev,
      vehicleId: v.name,
      transporterId: transporterName || '' 
    }))
    setVehicleSearch(v.name);
    setShowVehicleDropdown(false);
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
      status: formData.status
    }

    const request = editingTask 
        ? api.put(`/dispatches/${editingTask.peaDispatchNo}`, payload)
        : api.post('/dispatches', payload);

    request.then((res) => {
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
          status: (formData.status || 'On transit') as any,
        })
    }).catch(err => {
         console.error('Failed to save dispatch:', err)
         alert('Error saving dispatch. Please check your data.')
    }).finally(() => setSaving(false))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">

        <div>
           <label className="block text-sm font-semibold mb-1 text-slate-700">Oil Company *</label>
          <select
            required
            disabled={user?.role?.toUpperCase() === 'OIL_COMPANY' || user?.role?.toUpperCase() === 'OIL_COMPANY_ADMIN'}
            value={formData.oilCompanyId}
            onChange={(e) => {
                setFormData({ ...formData, oilCompanyId: e.target.value, destinationDepotId: '', transporterId: '', vehicleId: '' });
                setVehicleSearch('');
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select Company...</option>
            {oilCompanies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
           <label className="block text-sm font-semibold mb-1 text-slate-700">Fuel Type</label>
          <select
            required
            value={formData.fuelType}
            onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as FuelType })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
          >
            <option value="Benzine">Benzine</option>
            <option value="Diesel">Diesel</option>
            <option value="Jet Fuel">Jet Fuel</option>
          </select>
        </div>

        <div className="sm:col-span-2 relative">
          <label className="block text-sm font-semibold mb-1 text-slate-700">Vehicle (Plate Registration) *</label>
          <div className="relative">
            <input
              type="text"
              placeholder={formData.oilCompanyId ? "Search plate number..." : "Select company first..."}
              disabled={!formData.oilCompanyId}
              value={vehicleSearch}
              onFocus={() => setShowVehicleDropdown(true)}
              onChange={(e) => {
                  setVehicleSearch(e.target.value);
                  setShowVehicleDropdown(true);
                  if (formData.vehicleId) setFormData({...formData, vehicleId: '', transporterId: ''});
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
            />
            {showVehicleDropdown && formData.oilCompanyId && (
                <div className="absolute z-[100] mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-xl">
                    {searchedVehicles.length === 0 ? (
                        <div className="p-3 text-sm text-slate-500 italic">No available vehicles match your search.</div>
                    ) : (
                        searchedVehicles.map((v) => (
                            <div 
                                key={v.imei}
                                onClick={() => handleVehicleSelect(v)}
                                className="cursor-pointer px-4 py-2 text-sm hover:bg-slate-100 transition-colors flex justify-between items-center"
                            >
                                <span className="font-semibold text-slate-700">{v.name}</span>
                                <span className="text-[10px] text-slate-400">{v.imei}</span>
                            </div>
                        ))
                    )}
                </div>
            )}
          </div>
        </div>

        <div>
           <label className="block text-sm font-semibold mb-1 text-slate-700">Destination Depot *</label>
          <select
            required
            disabled={!formData.oilCompanyId}
            value={formData.destinationDepotId}
            onChange={(e) => setFormData({ ...formData, destinationDepotId: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
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
          <label className="block text-sm font-semibold mb-1 text-slate-700">Dispatched Liters *</label>
          <input
            type="number"
            required
            min="1"
            placeholder="e.g. 45000"
            value={formData.dispatchedLiters}
            onChange={(e) => setFormData({ ...formData, dispatchedLiters: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-700">Dispatch Date & Time *</label>
          <input
            type="datetime-local"
            required
            value={formData.dispatchDateTime}
            onChange={(e) => setFormData({ ...formData, dispatchDateTime: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-700">Dispatch Location *</label>
          <input
            type="text"
            required
            placeholder="e.g. Sululta"
            value={formData.dispatchLocation}
            onChange={(e) => setFormData({ ...formData, dispatchLocation: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-700">ETA Date & Time *</label>
          <input
            type="datetime-local"
            required
            value={formData.etaDateTime}
            onChange={(e) => setFormData({ ...formData, etaDateTime: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {editingTask && (
             <div>
               <label className="block text-sm font-semibold mb-1 text-slate-700">Status</label>
               <select
                 value={formData.status}
                 onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                 className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
               >
                 <option value="On transit">On transit</option>
                 <option value="Delivered">Delivered</option>
                 <option value="Exceeded ETA">Exceeded ETA</option>
                 <option value="Stopped >5h">Stopped &gt;5h</option>
                 <option value="GPS Offline >24h">GPS Offline &gt;24h</option>
               </select>
             </div>
        )}

      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving || !formData.vehicleId}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary-strong transition disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
              <>
                <div className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
          ) : editingTask ? 'Update Dispatch' : 'Create Dispatch'}
        </button>
      </div>
    </form>
  )
}
