import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import { fetchGpsVehicles } from '../data/gpsApi'
import type { Depot, DispatchTask, GpsVehicle } from '../data/types'
import PageHeader from '../components/layout/PageHeader'
import StatusPill from '../components/ui/StatusPill'
import { useAuth } from '../context/AuthContext'
import { parseStatusDurationHours, getStatusCategory } from '../lib/parseGpsDuration'

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
  const [expandedReportRow, setExpandedReportRow] = useState<number | null>(null)

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

  // Dashboard Summary Data
  const [showDashboardReport, setShowDashboardReport] = useState(true)

  const dashboardKpis = useMemo(() => {
    const now = new Date();
    const totalVehicles = gpsVehicles.length;
    const djiboutiCount = gpsVehicles.filter(v => {
      const lat = Number(v.lat); const lng = Number(v.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
      return lat >= 10.9 && lat <= 12.7 && lng >= 41.7 && lng <= 43.5;
    }).length;
    const transit = dispatches.filter(d => d.status === 'On transit').length;
    const offline = gpsVehicles.filter(v => {
      const cat = getStatusCategory(v.status);
      if (cat !== 'offline') return false;
      return parseStatusDurationHours(v.status) > 24;
    }).length;
    const exceeded = dispatches.filter(d => d.status !== 'Delivered' && d.etaDateTime && new Date(d.etaDateTime) < now).length;
    return [ { label: 'Total Vehicles', value: totalVehicles }, { label: 'Vehicles in Djibouti', value: djiboutiCount }, { label: 'On Transit', value: transit }, { label: 'GPS Offline >24h', value: offline }, { label: 'Exceeded ETA', value: exceeded } ];
  }, [dispatches, gpsVehicles]);

  const fuelSummary = useMemo(() => {
    let benzine = 0, diesel = 0, jetFuel = 0;
    dispatches.forEach(d => {
      if (d.status === 'Delivered') {
        if (d.fuelType === 'Benzine') benzine += d.dispatchedLiters;
        else if (d.fuelType === 'Diesel') diesel += d.dispatchedLiters;
        else if (d.fuelType === 'Jet Fuel') jetFuel += d.dispatchedLiters;
      }
    });
    return { benzine, diesel, jetFuel, total: benzine + diesel + jetFuel };
  }, [dispatches]);

  const dailyDispatch = useMemo(() => {
    const now = new Date();
    const dow = now.getDay();
    const mondayOff = dow === 0 ? -6 : 1 - dow;
    const mon = new Date(now); mon.setDate(now.getDate() + mondayOff); mon.setHours(0,0,0,0);
    const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const days = dayNames.map((name, i) => {
      const d = new Date(mon); d.setDate(mon.getDate() + i);
      return { day: name, date: d.toISOString().split('T')[0], benzine: 0, diesel: 0, jetFuel: 0 };
    });
    dispatches.forEach(d => {
      if (!d.dispatchDateTime) return;
      const dt = d.dispatchDateTime.split('T')[0];
      const m = days.find(day => day.date === dt);
      if (!m) return;
      if (d.fuelType === 'Benzine') m.benzine += d.dispatchedLiters;
      else if (d.fuelType === 'Diesel') m.diesel += d.dispatchedLiters;
      else if (d.fuelType === 'Jet Fuel') m.jetFuel += d.dispatchedLiters;
    });
    return days;
  }, [dispatches]);

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = { Delivered: 0, 'On transit': 0, 'Exceeded ETA': 0, 'GPS Offline >24h': 0 };
    dispatches.forEach(d => {
      const s = d.status || 'On transit';
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).filter(([,v]) => v > 0);
  }, [dispatches]);

  const recentDispatches = useMemo(() => {
    return [...dispatches]
      .sort((a, b) => new Date(b.dispatchDateTime).getTime() - new Date(a.dispatchDateTime).getTime())
      .slice(0, 10);
  }, [dispatches]);

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Generate report tables using period filters and identifiers."
      />

      {/* Dashboard Summary Report */}
      <div className="mt-6 rounded-xl border border-[#D1D5DB] bg-white overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDashboardReport(!showDashboardReport)}
          className="w-full flex items-center justify-between px-5 py-4 bg-muted/30 hover:bg-muted/50 transition"
        >
          <div>
            <div className="text-sm font-bold text-text">Dashboard Summary Report</div>
            <div className="text-xs text-text-muted mt-0.5">KPIs, fuel summary, daily dispatch, status breakdown</div>
          </div>
          <svg className={`size-5 text-text-muted transition-transform duration-200 ${showDashboardReport ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>

        {showDashboardReport && (
          <div className="p-5 space-y-6 print:space-y-4">
            {/* Report Header */}
            <div className="text-center border-b border-[#D1D5DB] pb-4">
              <div className="text-lg font-bold text-text">Ethiopian Petroleum Agency</div>
              <div className="text-sm text-text-muted">Dashboard Summary Report — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>

            {/* KPI Summary Table */}
            <div>
              <div className="text-sm font-bold text-text mb-2">Key Performance Indicators</div>
              <table className="w-full text-sm border border-[#D1D5DB]">
                <thead className="bg-muted/50">
                  <tr>{dashboardKpis.map(k => <th key={k.label} className="px-3 py-2 text-left font-semibold text-text-muted border border-[#D1D5DB]">{k.label}</th>)}</tr>
                </thead>
                <tbody>
                  <tr>{dashboardKpis.map(k => <td key={k.label} className="px-3 py-2 font-bold text-text border border-[#D1D5DB]">{k.value}</td>)}</tr>
                </tbody>
              </table>
            </div>

            {/* Fuel Type Summary */}
            <div>
              <div className="text-sm font-bold text-text mb-2">Delivered Fuel Summary</div>
              <table className="w-full text-sm border border-[#D1D5DB]">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-text-muted border border-[#D1D5DB]">Fuel Type</th>
                    <th className="px-3 py-2 text-right font-semibold text-text-muted border border-[#D1D5DB]">Volume (L)</th>
                    <th className="px-3 py-2 text-right font-semibold text-text-muted border border-[#D1D5DB]">% Share</th>
                  </tr>
                </thead>
                <tbody>
                  {[{name:'Benzine',vol:fuelSummary.benzine},{name:'Diesel',vol:fuelSummary.diesel},{name:'Jet Fuel',vol:fuelSummary.jetFuel}].map(f => (
                    <tr key={f.name}>
                      <td className="px-3 py-2 text-text border border-[#D1D5DB]">{f.name}</td>
                      <td className="px-3 py-2 text-right text-text border border-[#D1D5DB]">{f.vol.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right text-text border border-[#D1D5DB]">{fuelSummary.total > 0 ? ((f.vol / fuelSummary.total) * 100).toFixed(1) : 0}%</td>
                    </tr>
                  ))}
                  <tr className="bg-muted/30 font-bold">
                    <td className="px-3 py-2 text-text border border-[#D1D5DB]">Total</td>
                    <td className="px-3 py-2 text-right text-primary border border-[#D1D5DB]">{fuelSummary.total.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-text border border-[#D1D5DB]">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Daily Dispatch This Week */}
            <div>
              <div className="text-sm font-bold text-text mb-2">Daily Dispatch — This Week</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-[#D1D5DB]">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-text-muted border border-[#D1D5DB]">Day</th>
                      <th className="px-3 py-2 text-right font-semibold text-text-muted border border-[#D1D5DB]">Benzine (L)</th>
                      <th className="px-3 py-2 text-right font-semibold text-text-muted border border-[#D1D5DB]">Diesel (L)</th>
                      <th className="px-3 py-2 text-right font-semibold text-text-muted border border-[#D1D5DB]">Jet Fuel (L)</th>
                      <th className="px-3 py-2 text-right font-semibold text-text-muted border border-[#D1D5DB]">Total (L)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyDispatch.map(d => (
                      <tr key={d.day}>
                        <td className="px-3 py-2 font-medium text-text border border-[#D1D5DB]">{d.day} <span className="text-text-muted text-xs">({d.date})</span></td>
                        <td className="px-3 py-2 text-right text-text border border-[#D1D5DB]">{d.benzine.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-text border border-[#D1D5DB]">{d.diesel.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-text border border-[#D1D5DB]">{d.jetFuel.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-semibold text-text border border-[#D1D5DB]">{(d.benzine + d.diesel + d.jetFuel).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Status Breakdown */}
            <div>
              <div className="text-sm font-bold text-text mb-2">Dispatch Status Breakdown</div>
              <table className="w-full text-sm border border-[#D1D5DB] max-w-md">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-text-muted border border-[#D1D5DB]">Status</th>
                    <th className="px-3 py-2 text-right font-semibold text-text-muted border border-[#D1D5DB]">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {statusBreakdown.map(([status, count]) => (
                    <tr key={status}>
                      <td className="px-3 py-2 text-text border border-[#D1D5DB]">{status}</td>
                      <td className="px-3 py-2 text-right font-semibold text-text border border-[#D1D5DB]">{count}</td>
                    </tr>
                  ))}
                  <tr className="bg-muted/30 font-bold">
                    <td className="px-3 py-2 text-text border border-[#D1D5DB]">Total</td>
                    <td className="px-3 py-2 text-right text-primary border border-[#D1D5DB]">{dispatches.length}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Recent Dispatches */}
            <div>
              <div className="text-sm font-bold text-text mb-2">Recent Dispatches (Last 10)</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-[#D1D5DB]">
                  <thead className="bg-muted/50">
                    <tr>
                      {['Dispatch No.','Oil Company','Transporter','Fuel Type','Liters','Status','Dispatch Date'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-text-muted border border-[#D1D5DB] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentDispatches.map(d => (
                      <tr key={d.peaDispatchNo}>
                        <td className="px-3 py-2 font-medium text-text border border-[#D1D5DB]">{d.peaDispatchNo}</td>
                        <td className="px-3 py-2 text-text border border-[#D1D5DB]">{d.oilCompanyId}</td>
                        <td className="px-3 py-2 text-text border border-[#D1D5DB]">{d.transporterId || '—'}</td>
                        <td className="px-3 py-2 text-text border border-[#D1D5DB]">{d.fuelType}</td>
                        <td className="px-3 py-2 text-right text-text border border-[#D1D5DB]">{d.dispatchedLiters.toLocaleString()}</td>
                        <td className="px-3 py-2 text-text border border-[#D1D5DB]">{d.status}</td>
                        <td className="px-3 py-2 text-text border border-[#D1D5DB] whitespace-nowrap">{d.dispatchDateTime?.replace('T',' ').replace('Z','')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      
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

      <div className="mt-4 rounded-xl border border-[#D1D5DB] bg-white min-h-[300px]">
        {isLoading ? (
            <div className="p-8 flex items-center justify-center">
                 <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs text-text-muted">
                <tr>
                  {result.columns.map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D1D5DB]">
                {result.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/40">
                    {row.cells.map((cell, cellIdx) => (
                      <td key={cellIdx} className="whitespace-nowrap px-3 py-3 text-text">{cell}</td>
                    ))}
                    <td className="whitespace-nowrap px-3 py-3">
                      <StatusPill status={row.task.status} task={row.task as DispatchTask} />
                    </td>
                  </tr>
                ))}
                {result.rows.length === 0 && (
                  <tr><td className="px-3 py-6 text-sm text-text-muted text-center" colSpan={result.columns.length || 7}>No results for the selected filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-[#D1D5DB]">
            {result.rows.map((row, idx) => (
              <div
                key={idx}
                onClick={() => setExpandedReportRow(expandedReportRow === idx ? null : idx)}
                className="p-4 cursor-pointer active:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-text truncate">{row.cells[0]}</div>
                    <div className="text-xs text-text-muted mt-0.5 truncate">{row.cells[1]}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusPill status={row.task.status} task={row.task as DispatchTask} />
                    <svg className={`size-4 text-text-muted transition-transform duration-200 ${expandedReportRow === idx ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
                {expandedReportRow === idx && (
                  <div className="mt-3 pt-3 border-t border-[#D1D5DB] grid grid-cols-2 gap-3 text-sm animate-fade-in-up">
                    {result.columns.slice(2).map((col, ci) => {
                      const cellVal = row.cells[ci + 2]
                      if (cellVal === undefined) return null
                      return (
                        <div key={col}>
                          <div className="text-[11px] text-text-muted font-medium">{col}</div>
                          <div className="font-medium text-text mt-0.5 break-all">{cellVal}</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
            {result.rows.length === 0 && (
              <div className="p-6 text-sm text-text-muted text-center">No results for the selected filters.</div>
            )}
          </div>
        </>
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