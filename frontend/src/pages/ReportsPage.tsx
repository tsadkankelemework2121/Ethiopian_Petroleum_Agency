import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import { fetchGpsVehicles } from '../data/gpsApi'
import type { Depot, DispatchTask, GpsVehicle } from '../data/types'
import PageHeader from '../components/layout/PageHeader'
import StatusPill from '../components/ui/StatusPill'
import { useAuth } from '../context/AuthContext'

type FilterType = 'dispatch' | 'vehicle' | 'depot'

function parseYmd(input: string): Date | null {
  const v = input.trim()
  if (!v) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

function formatDurationMs(ms: number) {
  const totalMin = Math.max(0, Math.floor(ms / 60000))
  const days = Math.floor(totalMin / (60 * 24))
  const hours = Math.floor((totalMin - days * 60 * 24) / 60)
  const mins = totalMin - days * 60 * 24 - hours * 60
  const parts: string[] = []
  if (days) parts.push(`${days}d`)
  if (hours) parts.push(`${hours}h`)
  parts.push(`${mins}m`)
  return parts.join(' ')
}

export default function ReportsPage() {
  const { user } = useAuth()
  const companyId = user?.companyId

  const [filterType, setFilterType] = useState<FilterType>('dispatch')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const [query, setQuery] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [applied, setApplied] = useState<{ query: string; from: string; to: string }>({
    query: '',
    from: '',
    to: '',
  })

  // 1. Fetch Dispatches
  const { data: dispatches = [], isLoading: dispatchesLoading } = useQuery<any[]>({
    queryKey: ['dispatches'],
    queryFn: () => api.get('/dispatches', { params: companyId ? { oil_company_id: companyId } : {} }).then(res => res.data.map((d: any) => ({
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
    })))
  });

  // 2. Fetch Depots
  const { data: depots = [], isLoading: depotsLoading } = useQuery<Depot[]>({
    queryKey: ['depots'],
    queryFn: () => api.get('/depots').then(res => res.data.map((d: any) => ({
      ...d,
      id: d.id.toString(),
      location: { region: d.region, city: d.city, address: d.address },
      oilCompanyId: d.oil_company_id,
    })))
  });

  // 3. Fetch GPS Vehicles
  const { data: gpsVehicles = [], isLoading: gpsLoading } = useQuery<GpsVehicle[]>({
    queryKey: ['gps-vehicles'],
    queryFn: async () => {
      let data = await fetchGpsVehicles();
      if (user?.role?.toUpperCase() === 'OIL_COMPANY' || user?.role?.toUpperCase() === 'OIL_COMPANY_ADMIN') {
        data = data.filter(v => v.group === user.companyId);
      }
      return data;
    },
    staleTime: 60 * 1000,
  });

  const isLoading = dispatchesLoading || depotsLoading || gpsLoading;

  const depotsById = useMemo(() => new Map(depots.map((d) => [d.id, d] as const)), [depots])

  const vehiclesByImeiOrName = useMemo(() => {
    const map = new Map<string, GpsVehicle>()
    gpsVehicles.forEach(v => {
      map.set(v.imei, v)
      map.set(v.name, v)
    })
    return map
  }, [gpsVehicles])

  const getVehicleName = (vid: string) => {
    return vehiclesByImeiOrName.get(vid)?.name || vid;
  }

  const title = useMemo(() => {
    switch (filterType) {
      case 'dispatch':
        return 'Search by PEA Dispatch No. & Period'
      case 'vehicle':
        return 'Search by Vehicle Plate Reg. No. & Period'
      case 'depot':
        return 'Search by Depot'
    }
  }, [filterType])

  const getSearchPlaceholder = () => {
    switch (filterType) {
      case 'dispatch':
        return 'Dispatch No. (e.g., PEA001)'
      case 'vehicle':
        return 'Vehicle Plate (e.g., 3-11111 ET)'
      case 'depot':
        return 'Depot Name/ID (e.g., ID8548)'
    }
  }

  const result = useMemo(() => {
    if (isLoading) return { columns: [], rows: [] }

    const q = applied.query.trim().toLowerCase()
    const fromDate = parseYmd(applied.from)
    const toDate = parseYmd(applied.to)

    const inRange = (iso: string) => {
      if (!iso) return true
      const d = new Date(iso)
      if (Number.isNaN(d.getTime())) return true
      if (fromDate && d < fromDate) return false
      if (toDate) {
        const end = new Date(toDate)
        end.setHours(23, 59, 59, 999)
        if (d > end) return false
      }
      return true
    }

    const filtered = dispatches.filter((t: any) => inRange(t.dispatchDateTime))

    if (filterType === 'dispatch') {
      const rows = filtered
        .filter((t: any) => t.peaDispatchNo.toLowerCase().includes(q))
        .map((t: any) => {
          const plate = getVehicleName(t.vehicleId);
          const dispatchDt = t.dispatchDateTime?.replace('T', ' ').replace('Z', '') || '—'
          const dropDt = t.dropOffDateTime ? t.dropOffDateTime.replace('T', ' ').replace('Z', '') : '—'
          const duration =
            t.dropOffDateTime ? formatDurationMs(new Date(t.dropOffDateTime).getTime() - new Date(t.dispatchDateTime).getTime()) : '—'

          return {
            task: t,
            cells: [t.peaDispatchNo, plate, t.oilCompanyId, t.transporterId || '—', dispatchDt, dropDt, duration],
          }
        })

      return {
        columns: ['Dispatch No.', 'Plate', 'Oil Company', 'Transporter', 'Dispatch Date/Time', 'Drop Off Date/Time', 'Duration', 'Event'],
        rows,
      }
    }

    if (filterType === 'vehicle') {
      const rows = filtered
        .filter((t: any) => {
          if (!q) return true
          const plate = getVehicleName(t.vehicleId);
          return plate.toLowerCase().includes(q)
        })
        .map((t: any) => {
          const plate = getVehicleName(t.vehicleId);
          const dispatchDt = t.dispatchDateTime?.replace('T', ' ').replace('Z', '') || '—'
          const dropDt = t.dropOffDateTime ? t.dropOffDateTime.replace('T', ' ').replace('Z', '') : '—'
          const duration =
            t.dropOffDateTime ? formatDurationMs(new Date(t.dropOffDateTime).getTime() - new Date(t.dispatchDateTime).getTime()) : '—'

          return {
            task: t,
            cells: [
              plate,
              t.transporterId || '—',
              t.oilCompanyId,
              t.peaDispatchNo,
              dispatchDt,
              t.dispatchLocation,
              depotsById.get(t.destinationDepotId)?.name || t.destinationDepotId,
              dropDt,
              duration,
            ],
          }
        })

      return {
        columns: [
          'Vehicle Plate',
          'Transporter',
          'Oil Company',
          'Dispatch ID',
          'Dispatch Date/Time',
          'Dispatch Location',
          'Depot Name',
          'Drop Off Date/Time',
          'Duration',
          'Event',
        ],
        rows,
      }
    }

    // depot
    const rows = filtered
      .filter((t: any) => {
         const depot = depotsById.get(t.destinationDepotId)
         const name = depot?.name || t.destinationDepotId
         if (!q) return true;
         return name.toLowerCase().includes(q) || t.destinationDepotId.toLowerCase().includes(q);
      })
      .map((t: any) => {
        const depot = depotsById.get(t.destinationDepotId)
        const depotName = depot?.name ?? '—'
        const plate = getVehicleName(t.vehicleId)
        const dropDt = t.dropOffDateTime ? t.dropOffDateTime.replace('T', ' ').replace('Z', '') : '—'
        const duration =
          t.dropOffDateTime ? formatDurationMs(new Date(t.dropOffDateTime).getTime() - new Date(t.dispatchDateTime).getTime()) : '—'

        return {
          task: t,
          cells: [t.destinationDepotId, depotName, dropDt, plate, t.oilCompanyId, t.transporterId || '—', duration],
        }
      })

    return {
      columns: ['Depot ID', 'Depot Name', 'Drop Off Date/Time', 'Vehicle', 'Oil Company', 'Transporter', 'Duration', 'Event'],
      rows,
    }
  }, [applied, filterType, dispatches, depotsById, vehiclesByImeiOrName, isLoading])

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Generate report tables using period filters and identifiers."
      />
      
      <div className="flex items-center gap-2 mt-6 relative">
        <div 
          className="relative"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-semibold transition border-b-2 text-primary border-primary bg-primary/5 flex items-center gap-2"
          >
            Formal
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 animate-fade-in">
              {[
                { id: 'dispatch' as const, label: 'By Dispatch' },
                { id: 'vehicle' as const, label: 'By Vehicle' },
                { id: 'depot' as const, label: 'By Depot' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setFilterType(option.id)
                    setIsDropdownOpen(false)
                    setQuery('')
                    setApplied(prev => ({ ...prev, query: '' }))
                  }}
                  className={`
                    w-full text-left px-4 py-2.5 text-sm transition-colors
                    ${filterType === option.id 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="text-sm text-gray-500">
          Active filter: {filterType === 'dispatch' ? 'Dispatch' : filterType === 'vehicle' ? 'Vehicle' : 'Depot'}
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-[#D1D5DB] bg-white p-4">
        <div className="text-sm font-semibold text-text">{title}</div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <input
            className="rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            placeholder={getSearchPlaceholder()}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <input
            type="date"
            className="rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="From"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <input
            type="date"
            className="rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => setApplied({ query, from, to })}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-card hover:shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 bg-primary hover:bg-primary-strong"
          >
            Run report
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[#D1D5DB] bg-white min-h-[300px]">
        {isLoading ? (
            <div className="p-8 flex items-center justify-center">
                 <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        ) : (
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs text-text-muted">
            <tr>
              {result.columns.map((h) => (
                <th key={h} className="whitespace-nowrap px-3 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D1D5DB]">
            {result.rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-muted/40">
                {row.cells.map((cell, cellIdx) => (
                  <td key={cellIdx} className="whitespace-nowrap px-3 py-3 text-text">
                    {cell}
                  </td>
                ))}
                <td className="whitespace-nowrap px-3 py-3">
                   {/* Typecasting for mock/real status logic */}
                  <StatusPill status={row.task.status} task={row.task as DispatchTask} />
                </td>
              </tr>
            ))}

            {result.rows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-sm text-text-muted text-center" colSpan={result.columns.length || 7}>
                  No results for the selected filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}