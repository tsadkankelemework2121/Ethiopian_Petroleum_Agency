import { useEffect, useMemo, useState, useRef } from 'react'
import { PlusIcon } from 'lucide-react'
import api from '../api/axios'
import { fetchGpsVehicles } from '../data/gpsApi'
import type { Depot, DispatchTask, FuelType, OilCompany } from '../data/types'
import StatusPill from '../components/ui/StatusPill'
import { Skeleton } from '../components/ui/Skeleton'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { ModalOverlay } from '../components/ui/ModelOverlay'
import MapView from '../components/map/MapView'
import { MapPinIcon, CameraIcon, CheckCircleIcon, EyeIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { GpsVehicle } from '../data/types'

export default function FuelDispatchPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showDispatchForm, setShowDispatchForm] = useState(false)
  const [editingTask, setEditingTask] = useState<any | null>(null)
  const [trackingTask, setTrackingTask] = useState<DispatchTask | null>(null)
  const [confirmTask, setConfirmTask] = useState<any | null>(null)
  const [viewConfirmation, setViewConfirmation] = useState<any | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const canAddDispatch = user?.role?.toUpperCase() === 'EPA_ADMIN' || user?.role?.toUpperCase() === 'SUPER_ADMIN'
  const isDepotAdmin = user?.role === 'DEPOT_ADMIN'

  // Fetch Dispatches
  const { data: rawTasks = [], isLoading: isDispatchesLoading } = useQuery({
    queryKey: ['dispatches', user?.role, user?.companyId, user?.depotId],
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
        confirmation: d.confirmation || null,
      })) || [];
    },
    staleTime: 0, 
    refetchInterval: 5000,
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
    queryKey: ['gps-vehicles', user?.role, user?.companyId, user?.depotId],
    queryFn: async () => {
      let data = await fetchGpsVehicles()
      if (user?.role?.toUpperCase() === 'OIL_COMPANY' || user?.role?.toUpperCase() === 'OIL_COMPANY_ADMIN') {
        data = data.filter(v => v.group === user.companyId)
      }
      return data
    },
    staleTime: 0, 
    refetchInterval: 5000,
  });

  const isInitialLoading = isDispatchesLoading || isDepotsLoading || isVehiclesLoading;

  // Derived Mappings
  const oilCompanies = useMemo(() => {
    const names = Array.from(new Set(vehicles.map(v => v.group).filter(Boolean))) as string[];
    return names.map(name => ({ id: name, name: name, contacts: {} }));
  }, [vehicles]);

  const depotsById = useMemo(() => new Map(depots.map((d) => [d.id, d] as const)), [depots])

  // Check if ETA day has arrived (confirm button only active on/after ETA date)
  const isEtaDayReached = (etaDateTime?: string) => {
    if (!etaDateTime) return true
    const etaDate = new Date(etaDateTime)
    const today = new Date()
    return today.toDateString() >= etaDate.toDateString()
  };

  const statusTag = (v?: GpsVehicle) => {
    if (!v) return null;
    const status = v.status.toLowerCase()
    if (status.includes('offline') || status.includes('signal')) return { label: 'OFFLINE', color: '#cbd5e1' }
    if (status.includes('alert')) return { label: 'ALERT', color: '#ef4444' }
    if (status.includes('idle') || (Number.isFinite(Number(v.speed)) && Number(v.speed) === 0 && v.engine === 'on')) {
      return { label: 'IDLE', color: '#f59f0a' }
    }
    if (status.includes('moving') || (Number.isFinite(Number(v.speed)) && Number(v.speed) > 0)) {
      return { label: 'MOVING', color: '#22c55e' }
    }
    return { label: 'STOPPED', color: '#ef4444' }
  }

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
      <div className="space-y-6">
        <Card>
          <CardHeader title="Fuel Dispatches" subtitle="Loading dispatch records..." />
          <CardBody>
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Skeleton className="h-10 w-full md:w-72 rounded-lg" />
              <Skeleton className="h-10 w-full md:w-56 rounded-lg" />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full text-left text-sm divide-y divide-[#D1D5DB]">
                <thead className="bg-muted/50 text-xs text-text-muted">
                  <tr>
                    {[
                      'PEA Dispatch No.', 'Oil Company', 'Transporter', 'Vehicle Plate',
                      'Fuel Type', 'Liters', 'Dispatch Location', 'Destination Depot',
                      'Dispatch Date', 'ETA', 'Drop-off', 'Event'
                    ].map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1D5DB]">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
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
                          status: gpsVehicle.status || trackingTask?.status || 'On transit',
                          color: trackingTask?.status === 'Delivered' ? '#22c55e' : '#1c8547'
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

      {/* Confirm Receipt Modal */}
      <ModalOverlay
        isOpen={confirmTask !== null}
        onClose={() => setConfirmTask(null)}
        title={`Confirm Receipt: ${confirmTask?.peaDispatchNo || ''}`}
      >
        {confirmTask && <ConfirmReceiptForm
          peaDispatchNo={confirmTask.peaDispatchNo}
          vehicleId={confirmTask.vehicleId}
          vehicles={vehicles}
          onClose={() => setConfirmTask(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['dispatches'] })
            setConfirmTask(null)
          }}
        />}
      </ModalOverlay>

      {/* View Confirmation Modal */}
      <ModalOverlay
        isOpen={viewConfirmation !== null}
        onClose={() => setViewConfirmation(null)}
        title={`Delivery Confirmation: ${viewConfirmation?.peaDispatchNo || ''}`}
      >
        {viewConfirmation?.confirmation && (
          <div className="space-y-4">
            <img
              src={`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace('/api', '')}/storage/${viewConfirmation.confirmation.image_path}`}
              alt="Delivery confirmation"
              className="w-full rounded-lg border border-slate-200 max-h-[400px] object-contain bg-slate-50"
            />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="font-semibold text-slate-500">Confirmed At:</span><br/>{new Date(viewConfirmation.confirmation.confirmed_at).toLocaleString()}</div>
              <div><span className="font-semibold text-slate-500">Confirmed By:</span><br/>{viewConfirmation.confirmation.confirmed_by_user?.name || 'N/A'}</div>
              {viewConfirmation.confirmation.latitude && (
                <div>
                  <span className="font-semibold text-slate-500">Location:</span><br/>
                  <a 
                    href={`https://www.google.com/maps?q=${viewConfirmation.confirmation.latitude},${viewConfirmation.confirmation.longitude}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    {viewConfirmation.confirmation.latitude}, {viewConfirmation.confirmation.longitude}
                  </a>
                </div>
              )}
              {viewConfirmation.confirmation.vehicle_status && (
                <div><span className="font-semibold text-slate-500">Vehicle Status:</span><br/>{viewConfirmation.confirmation.vehicle_status}</div>
              )}
            </div>
          </div>
        )}
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
                    const gpsVehicle = vehicles.find(v => v.imei === t.vehicleId || v.name === t.vehicleId)
                    const vehicle = gpsVehicle?.name ?? t.vehicleId
                    const depot = depotsById.get(t.destinationDepotId)?.name ?? t.destinationDepotId
                    const oilCompany = t.oilCompanyId
                    const vTag = statusTag(gpsVehicle)

                    return (
                      <tr key={t.peaDispatchNo} className="hover:bg-muted/30">
                        <td className="whitespace-nowrap px-4 py-4 font-semibold">
                          {t.peaDispatchNo}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">{oilCompany}</td>
                        <td className="whitespace-nowrap px-4 py-4">{t.transporterId || '—'}</td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-medium text-slate-800">{vehicle}</span>
                            {vTag && (
                              <span 
                                className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wider"
                                style={{ backgroundColor: `${vTag.color}1A`, color: vTag.color }}
                              >
                                {vTag.label}
                              </span>
                            )}
                          </div>
                        </td>
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
                          {!isDepotAdmin && (
                            <button
                              type="button"
                              onClick={() => setTrackingTask(t)}
                              title="Follow Map"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                            >
                              <MapPinIcon className="size-3.5" />
                            </button>
                          )}

                          {/* Confirm Receipt - for DEPOT_ADMIN or OIL_COMPANY */}
                          {(isDepotAdmin || user?.role?.toUpperCase() === 'OIL_COMPANY' || user?.role?.toUpperCase() === 'OIL_COMPANY_ADMIN') && t.status !== 'Delivered' && (
                             <button
                               type="button"
                               disabled={!isEtaDayReached(t.etaDateTime)}
                               onClick={() => setConfirmTask(t)}
                               className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                               title={!isEtaDayReached(t.etaDateTime) ? 'Available on ETA date' : 'Confirm delivery'}
                             >
                               <CheckCircleIcon className="size-3.5" />
                               Confirm
                             </button>
                          )}

                          {/* View Confirmation - for delivered dispatches */}
                          {t.status === 'Delivered' && t.confirmation && (
                            <button
                              type="button"
                              onClick={() => setViewConfirmation(t)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                            >
                              <EyeIcon className="size-3.5" />
                              View
                            </button>
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
        ? api.post(`/dispatches/${editingTask.peaDispatchNo}`, { ...payload, _method: 'PUT' })
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

function ConfirmReceiptForm({ peaDispatchNo, vehicleId, vehicles, onClose, onSuccess }: {
  peaDispatchNo: string;
  vehicleId: string;
  vehicles: GpsVehicle[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const vehicle = useMemo(() => vehicles.find(v => v.imei === vehicleId || v.name === vehicleId), [vehicles, vehicleId])
  const geoStatus = vehicle && vehicle.lat && vehicle.lng 
    ? `Vehicle Location: ${Number(vehicle.lat).toFixed(5)}, ${Number(vehicle.lng).toFixed(5)}` 
    : 'Vehicle GPS location unavailable'

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!image) { alert('Please upload an image.'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('image', image)
      if (vehicle && vehicle.lat && vehicle.lng) {
        fd.append('latitude', vehicle.lat.toString())
        fd.append('longitude', vehicle.lng.toString())
      }
      fd.append('vehicle_status', 'Confirmed at depot')
      await api.post(`/dispatches/${peaDispatchNo}/deliver`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      onSuccess()
    } catch (err: any) {
      console.error(err)
      alert(err?.response?.data?.message || 'Error confirming delivery.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-slate-500">
        Upload a photo of the delivery to confirm receipt.
      </p>

      {/* Image Upload */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition min-h-[200px]"
      >
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-[250px] rounded-lg object-contain" />
        ) : (
          <>
            <CameraIcon className="size-10 text-slate-400 mb-2" />
            <span className="text-sm font-medium text-slate-500">Click to upload photo</span>
            <span className="text-xs text-slate-400 mt-1">JPG, PNG — max 10MB</span>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />

      {/* Location Status */}
      <div className="flex items-center gap-2 text-sm">
        <MapPinIcon className="size-4 text-slate-400" />
        <span className="text-slate-600">{geoStatus}</span>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !image}
          className="rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white shadow-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <><div className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Confirming...</>
          ) : (
            <><CheckCircleIcon className="size-4" /> Confirm Delivery</>
          )}
        </button>
      </div>
    </form>
  )
}
