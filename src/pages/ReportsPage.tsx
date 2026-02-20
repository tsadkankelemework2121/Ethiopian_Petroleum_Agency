import { useEffect, useMemo, useState } from 'react'
import { getDepots, getDispatchTasks, getOilCompanies, getTransporters } from '../data/mockApi'
import type { Depot, DispatchTask, OilCompany, Transporter } from '../data/types'
import PageHeader from '../components/layout/PageHeader'
import StatusPill from '../components/ui/StatusPill'

type TabId = 'dispatch' | 'vehicle' | 'depot'

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
  const [tab, setTab] = useState<TabId>('dispatch')
  const [tasks, setTasks] = useState<DispatchTask[]>([])
  const [companies, setCompanies] = useState<OilCompany[]>([])
  const [transporters, setTransporters] = useState<Transporter[]>([])
  const [depots, setDepots] = useState<Depot[]>([])

  const [query, setQuery] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [applied, setApplied] = useState<{ query: string; from: string; to: string }>({
    query: '',
    from: '',
    to: '',
  })

  useEffect(() => {
    void Promise.all([getDispatchTasks(), getOilCompanies(), getTransporters(), getDepots()]).then(
      ([t, c, tr, d]) => {
        setTasks(t)
        setCompanies(c)
        setTransporters(tr)
        setDepots(d)
      },
    )
  }, [])

  const companiesById = useMemo(() => new Map(companies.map((c) => [c.id, c] as const)), [companies])
  const transportersById = useMemo(
    () => new Map(transporters.map((t) => [t.id, t] as const)),
    [transporters],
  )
  const depotsById = useMemo(() => new Map(depots.map((d) => [d.id, d] as const)), [depots])
  const vehiclesById = useMemo(() => {
    const vehicles = transporters.flatMap((t) => t.vehicles)
    return new Map(vehicles.map((v) => [v.id, v] as const))
  }, [transporters])

  const title = useMemo(() => {
    switch (tab) {
      case 'dispatch':
        return 'Search by PEA Dispatch No. & Period'
      case 'vehicle':
        return 'Search by Vehicle Plate Reg. No. & Period'
      case 'depot':
        return 'Search by Depot'
    }
  }, [tab])

  const result = useMemo(() => {
    const q = applied.query.trim().toLowerCase()
    const fromDate = parseYmd(applied.from)
    const toDate = parseYmd(applied.to)

    const inRange = (iso: string) => {
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

    const filtered = tasks.filter((t) => inRange(t.dispatchDateTime))

    if (tab === 'dispatch') {
      const rows = filtered
        .filter((t) => (q ? t.peaDispatchNo.toLowerCase().includes(q) : true))
        .map((t) => {
          const oilCompany = companiesById.get(t.oilCompanyId)?.name ?? '—'
          const transporter = transportersById.get(t.transporterId)?.name ?? '—'
          const dispatchDt = t.dispatchDateTime.replace('T', ' ').replace('Z', '')
          const dropDt = t.dropOffDateTime ? t.dropOffDateTime.replace('T', ' ').replace('Z', '') : '—'
          const duration =
            t.dropOffDateTime ? formatDurationMs(new Date(t.dropOffDateTime).getTime() - new Date(t.dispatchDateTime).getTime()) : '—'

          return {
            task: t,
            cells: [
              oilCompany,
              transporter,
              t.peaDispatchNo,
              dispatchDt,
              t.dispatchLocation,
              t.dropOffLocation ?? '—',
              dropDt,
              duration,
            ],
          }
        })

      return {
        columns: [
          'Oil Company',
          'Transporter',
          'Dispatch ID',
          'Dispatch Date/Time',
          'Dispatch Location',
          'Drop Off Location',
          'Drop Off Date/Time',
          'Duration',
          'Status',
        ],
        rows,
      }
    }

    if (tab === 'vehicle') {
      const rows = filtered
        .filter((t) => {
          if (!q) return true
          const plate = vehiclesById.get(t.vehicleId)?.plateRegNo ?? ''
          return plate.toLowerCase().includes(q)
        })
        .map((t) => {
          const plate = vehiclesById.get(t.vehicleId)?.plateRegNo ?? '—'
          const oilCompany = companiesById.get(t.oilCompanyId)?.name ?? '—'
          const transporter = transportersById.get(t.transporterId)?.name ?? '—'
          const dispatchDt = t.dispatchDateTime.replace('T', ' ').replace('Z', '')
          const dropDt = t.dropOffDateTime ? t.dropOffDateTime.replace('T', ' ').replace('Z', '') : '—'
          const duration =
            t.dropOffDateTime ? formatDurationMs(new Date(t.dropOffDateTime).getTime() - new Date(t.dispatchDateTime).getTime()) : '—'

          return {
            task: t,
            cells: [
              plate,
              transporter,
              oilCompany,
              t.peaDispatchNo,
              dispatchDt,
              t.dispatchLocation,
              t.dropOffLocation ?? '—',
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
          'Drop Off Location',
          'Drop Off Date/Time',
          'Duration',
          'Status',
        ],
        rows,
      }
    }

    // depot
    const rows = filtered
      .filter((t) => (q ? t.destinationDepotId.toLowerCase().includes(q) : true))
      .map((t) => {
        const depot = depotsById.get(t.destinationDepotId)
        const depotName = depot?.name ?? '—'
        const plate = vehiclesById.get(t.vehicleId)?.plateRegNo ?? '—'
        const oilCompany = companiesById.get(t.oilCompanyId)?.name ?? '—'
        const transporter = transportersById.get(t.transporterId)?.name ?? '—'
        const dropDt = t.dropOffDateTime ? t.dropOffDateTime.replace('T', ' ').replace('Z', '') : '—'
        const duration =
          t.dropOffDateTime ? formatDurationMs(new Date(t.dropOffDateTime).getTime() - new Date(t.dispatchDateTime).getTime()) : '—'

        return {
          task: t,
          cells: [t.destinationDepotId, depotName, dropDt, plate, oilCompany, transporter, duration],
        }
      })

    return {
      columns: ['Depot ID', 'Depot Name', 'Drop Off Date/Time', 'Vehicle', 'Oil Company', 'Transporter', 'Duration', 'Status'],
      rows,
    }
  }, [applied.from, applied.query, applied.to, companiesById, depotsById, tab, tasks, transportersById, vehiclesById])

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Generate report tables using period + identifiers (mock data for now)."
      />
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'dispatch' as const, label: 'By Dispatch' },
          { id: 'vehicle' as const, label: 'By Vehicle' },
          { id: 'depot' as const, label: 'By Depot' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={[
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              tab === t.id ? 'bg-primary text-slate-900' : 'bg-muted text-text hover:bg-muted/70',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
        <div className="text-sm font-semibold text-text">{title}</div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <input
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            placeholder={
              tab === 'dispatch'
                ? 'Dispatch No. (e.g., PEA001)'
                : tab === 'vehicle'
                  ? 'Vehicle Plate (e.g., 3-11111 ET)'
                  : 'Depot ID (e.g., ID8548)'
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <input
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="From (YYYY-MM-DD)"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <input
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="To (YYYY-MM-DD)"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => setApplied({ query, from, to })}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-primary-strong"
          >
            Run report
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface">
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
          <tbody className="divide-y divide-border">
            {result.rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-muted/40">
                {row.cells.map((cell, cellIdx) => (
                  <td key={cellIdx} className="whitespace-nowrap px-3 py-3 text-text">
                    {cell}
                  </td>
                ))}
                <td className="whitespace-nowrap px-3 py-3">
                  <StatusPill status={row.task.status} task={row.task} />
                </td>
              </tr>
            ))}

            {result.rows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-sm text-text-muted" colSpan={result.columns.length}>
                  No results for the selected filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

