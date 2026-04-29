import { useEffect, useLayoutEffect, useMemo, useRef, useState, useDeferredValue } from 'react'
import { List as VirtualList, type RowComponentProps } from 'react-window'
import { fetchGpsVehicles } from '../data/gpsApi'
import type { GpsVehicle } from '../data/types'
import MapView from '../components/map/MapView'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import type { Depot } from '../data/types'

const COLORS = {
  blue: '#1c8547',
  gold: '#f59f0a',
  gray: '#cbd5e1',
  bg: '#f3f4f6',
} as const



export default function TrackingPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState('All')
  const [assignmentFilter, setAssignmentFilter] = useState('All')
  
  const deferredSearch = useDeferredValue(search)
  const deferredStatus = useDeferredValue(statusFilter)
  const deferredAssignment = useDeferredValue(assignmentFilter)
  
  const isPendingFilter = search !== deferredSearch || statusFilter !== deferredStatus || assignmentFilter !== deferredAssignment

  const { data: items = [], isLoading: itemsLoading, error: queryError } = useQuery<GpsVehicle[]>({
    queryKey: ['gps-vehicles'],
    queryFn: async () => {
      let data = await fetchGpsVehicles()
      if (user?.role?.toUpperCase() === 'OIL_COMPANY' || user?.role?.toUpperCase() === 'OIL_COMPANY_ADMIN') {
        data = data.filter(v => v.group === user.companyId)
      }
      return data
    },
    refetchInterval: 30000, // 30 seconds for tracking
  });

  // Fetch Dispatches
  const { data: dispatches = [], isLoading: dispatchesLoading } = useQuery({
    queryKey: ['dispatches-tracking'],
    queryFn: async () => {
      const res = await api.get('/dispatches');
      return res.data;
    },
    refetchInterval: 30000,
  });

  // Fetch Depots for names
  const { data: depots = [] } = useQuery<Depot[]>({
    queryKey: ['depots'],
    queryFn: async () => {
      const res = await api.get('/depots');
      return res.data;
    }
  });

  const depotsById = useMemo(() => {
    const map = new Map<string, any>();
    depots.forEach(d => map.set(d.id.toString(), d));
    return map;
  }, [depots]);

  const activeDispatchesByVehicle = useMemo(() => {
    const map = new Map<string, any>();
    const sorted = [...dispatches].sort((a, b) => 
      new Date(b.dispatch_datetime).getTime() - new Date(a.dispatch_datetime).getTime()
    );
    
    // We want to find the GPS vehicle that corresponds to each dispatch
    // Dispatches store either IMEI or Plate Number in 'vehicle_id'
    sorted.forEach(d => {
      if (d.status !== 'Delivered') {
        const match = items.find(v => v.imei === d.vehicle_id || v.name === d.vehicle_id);
        if (match && !map.has(match.imei)) {
          map.set(match.imei, d);
        }
      }
    });
    return map;
  }, [dispatches, items]);

  const [isClustered, setIsClustered] = useState(false)
  const [hasFitBounds, setHasFitBounds] = useState(false)
  const [isListOpen, setIsListOpen] = useState(false) // Start hidden on mobile
  const mapApiRef = useRef<import('../components/map/MapView').MapApi | null>(null)

  // Center of Ethiopia for initial map view
  const defaultCenter = useMemo(() => ({ lat: 9.0, lng: 39.5 }), [])

  // react-window sizing
  const listHostRef = useRef<HTMLDivElement | null>(null)
  const [listSize, setListSize] = useState({ width: 0, height: 0 })

  const collapsedRowHeight = 82
  const expandedRowHeight = 360
  const expandedDetailsMaxHeight = expandedRowHeight - collapsedRowHeight + 2

  const isListLoading = itemsLoading || dispatchesLoading;

  // Define statusTag function first (hoisted with function declaration)
  const statusTag = (v: GpsVehicle): { label: string; color: string } => {
    const status = v.status.toLowerCase()

    // Map exact raw status to the color tag but preserve the exact status for display elsewhere
    if (status.includes('offline')) return { label: 'OFFLINE', color: COLORS.gray }
    if (status.includes('alert')) return { label: 'ALERT', color: '#ef4444' }
    if (status.includes('idle') || (Number.isFinite(Number(v.speed)) && Number(v.speed) === 0 && v.engine === 'on')) {
      return { label: 'IDLE', color: COLORS.gold }
    }
    if (status.includes('moving') || (Number.isFinite(Number(v.speed)) && Number(v.speed) > 0)) {
      return { label: 'MOVING', color: '#22c55e' }
    }
    return { label: 'STOPPED', color: '#ef4444' }
  }

  const plateFromName = (name: string) => name.trim().split(/\s+/)[0] ?? name

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase()
    
    return items.filter((t) => {
      // 1. Text Search
      const searchHay = [t.name, t.imei, t.group ?? '', t.status, t.engine].join(' ').toLowerCase()
      const searchMatch = !q || searchHay.includes(q)

      // 2. Status Filtering
      const tag = statusTag(t)
      const statusMatch = deferredStatus === 'All' || tag.label.toUpperCase() === deferredStatus.toUpperCase()

      // 3. Assignment Filtering
      const isAssigned = activeDispatchesByVehicle.has(t.imei)
      const assignmentMatch = deferredAssignment === 'All' 
        ? true 
        : deferredAssignment === 'Assigned' 
          ? isAssigned 
          : !isAssigned

      return searchMatch && statusMatch && assignmentMatch
    })
  }, [items, deferredSearch, deferredStatus, deferredAssignment, activeDispatchesByVehicle])

  // Do not slice, show all filtered vehicles
  const fleetListItems = useMemo(() => filtered, [filtered])

  const markers = useMemo(() => {
    const validFleets = fleetListItems.filter((t) => t.lat && t.lng)

    return validFleets
      .map((t) => {
        const lat = Number(t.lat)
        const lng = Number(t.lng)
        const angle = Number(t.angle) || 0
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

        const tag = statusTag(t)
        const dispatch = activeDispatchesByVehicle.get(t.imei);

        let markerColor =
          tag.label === 'MOVING'
            ? '#22c55e'
            : tag.label === 'IDLE'
              ? COLORS.gold
              : tag.label === 'OFFLINE'
                ? COLORS.gray
                : '#ef4444'

        // If dispatched, maybe use a distinct color or label
        const statusLabel = dispatch ? `Dispatch: ${dispatch.status}` : t.status;
        if (dispatch && dispatch.status === 'On transit') markerColor = '#1c8547';

        return {
          id: t.imei,
          position: { lat, lng },
          label: t.name,
          subtitle: statusLabel,
          status: statusLabel,
          angle,
          color: markerColor,
        }
      })
      .filter((m): m is NonNullable<typeof m> => m !== null)
  }, [fleetListItems])

  // Ethiopia bounding box constraints so the map stays focused on Ethiopia
  const ETHIOPIA_BOUNDS = { minLat: 3.0, maxLat: 15.0, minLng: 33.0, maxLng: 48.0 };

  const mapBounds = useMemo(() => {
    // Only consider vehicles with valid coordinates inside Ethiopia
    const validItems = items.filter((t) => {
      if (!t.lat || !t.lng) return false;
      const lat = Number(t.lat);
      const lng = Number(t.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
      // Only include vehicles within Ethiopia's bounding box
      return lat >= ETHIOPIA_BOUNDS.minLat && lat <= ETHIOPIA_BOUNDS.maxLat &&
             lng >= ETHIOPIA_BOUNDS.minLng && lng <= ETHIOPIA_BOUNDS.maxLng;
    });

    // If no vehicles in Ethiopia, use Ethiopia's default bounds
    if (validItems.length === 0) {
      return [[ETHIOPIA_BOUNDS.minLat, ETHIOPIA_BOUNDS.minLng], [ETHIOPIA_BOUNDS.maxLat, ETHIOPIA_BOUNDS.maxLng]] as [[number, number], [number, number]];
    }

    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180
    validItems.forEach((v) => {
      const lat = Number(v.lat)
      const lng = Number(v.lng)
      if (lat < minLat) minLat = lat
      if (lat > maxLat) maxLat = lat
      if (lng < minLng) minLng = lng
      if (lng > maxLng) maxLng = lng
    })

    if (minLat === maxLat) { minLat -= 0.01; maxLat += 0.01 }
    if (minLng === maxLng) { minLng -= 0.01; maxLng += 0.01 }

    return [[minLat, minLng], [maxLat, maxLng]] as [[number, number], [number, number]]
  }, [items])

  useEffect(() => {
    if (mapBounds && mapApiRef.current && !hasFitBounds) {
      mapApiRef.current.fitBounds(mapBounds)
      setHasFitBounds(true)
    }
  }, [mapBounds, hasFitBounds])




  const handleSelectVehicle = (vehicle: GpsVehicle) => {
    setSelectedId(vehicle.imei)

    const lat = Number(vehicle.lat)
    const lng = Number(vehicle.lng)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      // Zoom in to show roads clearly
      mapApiRef.current?.flyTo({ lat, lng }, 18)
    }

    // Hide list on mobile when a truck is selected
    if (window.innerWidth < 768) {
      setIsListOpen(false)
    }
  }

  // Measure the list container so react-window can calculate scroll space.
  useLayoutEffect(() => {
    const el = listHostRef.current
    if (!el) return

    const updateSize = () => {
      setListSize({
        width: el.clientWidth,
        height: el.clientHeight,
      })
    }

    updateSize()

    const ro = new ResizeObserver(() => updateSize())
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const getItemSize = (index: number) => {
    const v = fleetListItems[index]
    return v && v.imei === selectedId ? expandedRowHeight : collapsedRowHeight
  }

  type RowData = {
    items: GpsVehicle[]
    selectedId: string | undefined
    onSelect: (v: GpsVehicle) => void
  }

  const Row = ({ index, style, items, selectedId: rowSelectedId, onSelect }: RowComponentProps<RowData>) => {
    const v = items[index]
    if (!v) return null

    const tag = statusTag(v)
    const plate = plateFromName(v.name)
    const isSelected = v.imei === rowSelectedId
    const dispatch = activeDispatchesByVehicle.get(v.imei)

    return (
      <div style={style} className="border-b border-[#EEF2F7]">
        <button
          type="button"
          onClick={() => onSelect(v)}
          className="w-full px-5 py-4 text-left hover:bg-slate-50 transition"
          style={isSelected ? { backgroundColor: 'rgba(28,133,71,0.08)' } : undefined}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="text-sm font-bold" style={{ color: isSelected ? COLORS.blue : '#0f172a' }}>
                {plate}
              </div>
              {dispatch && (
                <div className="text-[10px] text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                  <div className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                  {dispatch.status} → {depotsById.get(dispatch.destination_depot_id?.toString())?.name || 'Unknown Depot'}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold whitespace-nowrap"
                style={{ backgroundColor: `${tag.color}1A`, color: tag.color }}
              >
                {v.status}
              </span>
              {dispatch && (
                <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse border border-blue-200">
                  Task Assigned
                </span>
              )}
            </div>
          </div>
        </button>

        {isSelected && (
          <div className="px-5 pb-4 pt-1 animate-fade-in-up bg-slate-50/50" style={{ maxHeight: expandedDetailsMaxHeight, overflowY: 'auto' }}>
            <div className="mb-3 text-[10px] font-semibold text-slate-700 truncate">{v.name}</div>
            <div className="mb-3 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded border bg-white p-2 shadow-sm">
                <div className="text-slate-500">Speed</div>
                <div className="font-semibold text-slate-900">{v.speed} km/h</div>
              </div>
              <div className="rounded border bg-white p-2 shadow-sm">
                <div className="text-slate-500">Engine</div>
                <div className="font-semibold text-slate-900">{v.engine}</div>
              </div>
              <div className="rounded border bg-white p-2 shadow-sm">
                <div className="text-slate-500">Odometer</div>
                <div className="font-semibold text-slate-900">{v.odometer}</div>
              </div>
              <div className="rounded border bg-white p-2 shadow-sm">
                <div className="text-slate-500">Fuel</div>
                <div className="font-semibold text-slate-900">{v.fuel_1}</div>
              </div>
              <div className="rounded border border-blue-200 bg-blue-50/30 p-2 shadow-sm col-span-2">
                <div className="text-blue-600 font-bold uppercase tracking-widest text-[8px] mb-0.5">Oil Company</div>
                <div className="font-bold text-slate-900">{v.group || '—'}</div>
              </div>
            </div>
            <div className="rounded border bg-white p-2 text-[10px] shadow-sm">
              <div className="text-slate-500 mb-1 font-semibold uppercase tracking-wider">Location Data</div>
              <div><span className="font-medium text-slate-700">GPS:</span> {v.lat}, {v.lng}</div>
              <div><span className="font-medium text-slate-700">Latest update:</span> {v.dt_tracker}</div>
              <div><span className="font-medium text-slate-700">Latest server:</span> {v.dt_server}</div>
            </div>

            {dispatch && (
              <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/50 p-3 shadow-sm">
                <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-2 flex justify-between">
                  <span>Current Dispatch</span>
                  <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[8px]">{dispatch.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                  <div>
                    <div className="text-slate-500 text-[9px]">Destination</div>
                    <div className="font-semibold text-slate-900">{depotsById.get(dispatch.destination_depot_id?.toString())?.name || '—'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[9px]">Fuel Type</div>
                    <div className="font-semibold text-slate-900">{dispatch.fuel_type}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[9px]">Liters</div>
                    <div className="font-semibold text-slate-900">{Number(dispatch.dispatched_liters).toLocaleString()} L</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[9px]">ETA</div>
                    <div className="font-semibold text-slate-900">{dispatch.eta_datetime?.split(' ')[0]}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative h-full w-full bg-slate-100 overflow-hidden">
      {/* Map background */}
      <MapView
        className="absolute inset-0 h-full w-full"
        center={defaultCenter}
        zoom={6}
        markers={markers}
        isClustered={isClustered}
        selectedMarkerId={selectedId}
        onMarkerSelect={(id) => {
          setSelectedId(id)
          const v = items.find((x) => x.imei === id)
          if (v) handleSelectVehicle(v)
        }}
        onMapReady={(api) => {
          mapApiRef.current = api
          if (mapBounds && !hasFitBounds) {
            api.fitBounds(mapBounds)
            setHasFitBounds(true)
          }
        }}
      />

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden absolute top-4 left-4 z-20 p-2.5 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-[#D1D5DB] text-slate-700 hover:bg-slate-50 transition"
        onClick={() => setIsListOpen(!isListOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Left overlay:  */}
      <div className={`absolute left-4 right-4 md:right-auto md:w-[320px] top-20 md:top-4 bottom-20 md:bottom-4 rounded-2xl border border-[#D1D5DB] bg-white/95 backdrop-blur-sm shadow-elevated flex-col overflow-hidden z-10 transition-opacity ${isListOpen ? 'flex' : 'hidden md:flex'}`}>
        <div className="px-5 py-4 border-b border-[#E5E7EB]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#64748b' }}>
            Fleet list
          </div>
          <div className="mt-3 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Search fleet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {isPendingFilter && (
              <div className="size-3 animate-spin rounded-full border-2 border-primary border-t-transparent shrink-0" />
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
            >
                <option value="All">MOVEMENT: ALL</option>
                <option value="Moving">MOVING</option>
                <option value="Idle">IDLE</option>
                <option value="Stopped">STOPPED</option>
                <option value="Offline">OFFLINE</option>
            </select>

            <div className="relative">
              <select
                  value={assignmentFilter}
                  onChange={(e) => setAssignmentFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 appearance-none"
              >
                  <option value="All">TASK: ALL</option>
                  <option value="Assigned">ASSIGNED</option>
                  <option value="Unassigned">NOT ASSIGNED</option>
              </select>
              {isPendingFilter && assignmentFilter !== deferredAssignment && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                   <div className="size-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div ref={listHostRef} className={`flex-1 overflow-hidden transition-opacity duration-200 ${isPendingFilter ? 'opacity-50 pointer-events-none' : ''}`}>
          {isListLoading ? (
            <div className="p-8 flex items-center justify-center flex-col space-y-3">
              <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <div className="text-xs font-medium text-slate-500">Loading assignments...</div>
            </div>
          ) : queryError ? (
            <div className="p-4 text-sm text-red-600">{(queryError as Error).message}</div>
          ) : listSize.height > 0 && listSize.width > 0 ? (
            <VirtualList
              style={{ height: listSize.height, width: listSize.width }}
              rowCount={fleetListItems.length}
              rowHeight={(index) => getItemSize(index)}
              rowComponent={Row}
              rowProps={{
                items: fleetListItems,
                selectedId,
                onSelect: (v: GpsVehicle) => handleSelectVehicle(v),
              }}
            >
              {/* List renders through rowComponent */}
            </VirtualList>
          ) : (
            <div className="p-4 text-sm text-slate-600">Loading list…</div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-[#EEF2F7] flex items-center justify-between text-[11px] text-slate-500">
          <span>
            SHOWING {fleetListItems.length} OF {items.length}
          </span>
          <button type="button" className="font-semibold" style={{ color: COLORS.blue }}>
            VIEW ALL
          </button>
        </div>
      </div>

      {/* Bottom controls - Simplified */}
      <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-[#D1D5DB] bg-white/95 px-4 py-2 shadow-card">
          <button
            type="button"
            onClick={() => setIsClustered(!isClustered)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold border transition ${isClustered
              ? 'bg-[#1c8547] text-white border-[#1c8547] shadow-md hover:bg-[#166d3a]'
              : 'bg-white text-slate-600 border-[#E5E7EB] hover:bg-slate-50'
              }`}
          >
            CLUSTER {isClustered && 'ON'}
          </button>
          {/* <button 
            type="button" 
            className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 border border-[#E5E7EB] hover:bg-slate-50 transition"
          >
            TRAFFIC
          </button> */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                if (mapBounds) {
                  mapApiRef.current?.fitBounds(mapBounds)
                }
              }}
              className="grid size-9 place-items-center rounded-full bg-white border border-[#D1D5DB] text-slate-700 hover:bg-slate-50 transition"
              aria-label="Zoom out to see all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => mapApiRef.current?.zoomIn()}
              className="grid size-9 place-items-center rounded-full bg-white border border-[#D1D5DB] text-slate-700 hover:bg-slate-50 transition"
              aria-label="Zoom in"
            >
              +
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
