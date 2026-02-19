import { useEffect, useMemo, useState } from 'react'
import type { RegionFuelSummary } from '../data/types'
import {
  getDashboardCharts,
  getDashboardKpis,
  getDispatchTasks,
  getOilCompanies,
  getTransporters,
  getVehiclesOnTransit,
  getRegionalFuelDispatchedThisWeek,
} from '../data/mockApi'
import type { DispatchTask, OilCompany, Transporter } from '../data/types'
import PageHeader from '../components/layout/PageHeader'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import StatusPill from '../components/ui/StatusPill'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ExclamationTriangleIcon,
  MapPinIcon,
  SignalSlashIcon,
  StopCircleIcon,
  TruckIcon,
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const [kpis, setKpis] = useState<{
    vehiclesOnTransit: number
    gpsOfflineOver24h: number
    exceededEta: number
    stoppedOver5h: number
  } | null>(null)
  const [regions, setRegions] = useState<RegionFuelSummary[]>([])
  const [onTransit, setOnTransit] = useState<Awaited<ReturnType<typeof getVehiclesOnTransit>>>([])
  const [tasks, setTasks] = useState<DispatchTask[]>([])
  const [companies, setCompanies] = useState<OilCompany[]>([])
  const [transporters, setTransporters] = useState<Transporter[]>([])
  const [charts, setCharts] = useState<Awaited<ReturnType<typeof getDashboardCharts>> | null>(null)

  useEffect(() => {
    void Promise.all([getDashboardKpis(), getRegionalFuelDispatchedThisWeek(), getDashboardCharts()]).then(
      ([k, r, ch]) => {
        setKpis(k)
        setRegions(r)
        setCharts(ch)
      },
    )
  }, [])

  useEffect(() => {
    void Promise.all([getVehiclesOnTransit(), getDispatchTasks(), getOilCompanies(), getTransporters()]).then(
      ([vt, t, c, tr]) => {
        setOnTransit(vt)
        setTasks(t)
        setCompanies(c)
        setTransporters(tr)
      },
    )
  }, [])

  const companiesById = useMemo(() => new Map(companies.map((c) => [c.id, c] as const)), [companies])
  const transportersById = useMemo(
    () => new Map(transporters.map((t) => [t.id, t] as const)),
    [transporters],
  )

  const recentDispatches = useMemo(() => {
    return [...tasks]
      .sort((a, b) => (a.dispatchDateTime < b.dispatchDateTime ? 1 : -1))
      .slice(0, 6)
      .map((t) => ({
        peaDispatchNo: t.peaDispatchNo,
        oilCompany: companiesById.get(t.oilCompanyId)?.name ?? '—',
        transporter: transportersById.get(t.transporterId)?.name ?? '—',
        eta: t.etaDateTime.replace('T', ' ').replace('Z', ''),
        status: t.status,
      }))
  }, [companiesById, tasks, transportersById])

  const kpiCards = useMemo(() => {
    return [
      {
        label: 'Vehicles on transit',
        value: kpis ? String(kpis.vehiclesOnTransit) : '—',
        hint: 'Active dispatches now',
        icon: TruckIcon,
      },
      {
        label: 'GPS offline > 24 hrs',
        value: kpis ? String(kpis.gpsOfflineOver24h) : '—',
        hint: 'Inside Ethiopia',
        icon: SignalSlashIcon,
      },
      {
        label: 'Exceeded ETA',
        value: kpis ? String(kpis.exceededEta) : '—',
        hint: 'Needs attention',
        icon: ExclamationTriangleIcon,
      },
      {
        label: 'Stops > 5 hours',
        value: kpis ? String(kpis.stoppedOver5h) : '—',
        hint: 'Out of Addis Ababa',
        icon: StopCircleIcon,
      },
    ] as const
  }, [kpis])

  const statusPie = useMemo(() => {
    if (!charts) return []
    return charts.statusCounts.map((s) => ({ name: s.status, value: s.count }))
  }, [charts])

  const pieColors = ['#06b6d4', '#f59e0b', '#fb7185', '#a78bfa', '#10b981']

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Real-time operations view for dispatch, GPS monitoring, and regional fuel movement."
        right={
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-xs font-semibold text-text shadow-sm hover:bg-muted/60 sm:inline-flex"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              This week
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary px-3 py-2 text-xs font-semibold text-slate-900 shadow-sm hover:bg-primary-strong"
            >
              <span>Export CSV</span>
            </button>
          </div>
        }
      />
      <div className="grid gap-4 lg:grid-cols-12">
        {/* KPIs */}
        <div className="lg:col-span-12">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpiCards.map((k) => {
              const Icon = k.icon
              return (
                <Card key={k.label} className="relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-2xl" />
                  <CardBody className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-text">{k.label}</div>
                        <div className="mt-1 text-xs text-text-muted">{k.hint}</div>
                      </div>
                      <div className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary-strong ring-1 ring-primary/15">
                        <Icon className="size-5" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end justify-between gap-4">
                      <div className="text-4xl font-semibold tracking-tight text-text">{k.value}</div>
                      <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-text-muted">
                        Updated: mock
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Charts row */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader
              title="Regional fuel dispatched (this week)"
              subtitle="Stacked view by region (m³) — Benzine / Diesel / Jet Fuel"
              right={
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-strong">
                  <MapPinIcon className="size-4" />
                  Ethiopia regions
                </span>
              }
            />
            <CardBody className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regions} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="4 6" stroke="rgba(15, 23, 42, 0.08)" />
                  <XAxis
                    dataKey="region"
                    tick={{ fill: 'rgba(71,85,105,0.9)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    height={70}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(71,85,105,0.9)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 14,
                      border: '1px solid rgba(203,213,225,0.9)',
                      background: 'rgba(255,255,255,0.95)',
                    }}
                  />
                  <Bar dataKey="benzineM3" name="Benzine" stackId="a" fill="#22d3ee" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="dieselM3" name="Diesel" stackId="a" fill="#06b6d4" />
                  <Bar dataKey="jetFuelM3" name="Jet Fuel" stackId="a" fill="#0ea5e9" radius={[0, 0, 8, 8]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card>
            <CardHeader title="Dispatch status" subtitle="Distribution of current dispatch tasks" />
            <CardBody className="h-[320px]">
              {charts ? (
                <div className="grid h-full grid-rows-[1fr_auto] gap-3">
                  <div className="h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 14,
                            border: '1px solid rgba(203,213,225,0.9)',
                            background: 'rgba(255,255,255,0.95)',
                          }}
                        />
                        <Pie
                          data={statusPie}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={95}
                          paddingAngle={3}
                        >
                          {statusPie.map((_, idx) => (
                            <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid gap-2">
                    {charts.statusCounts.slice(0, 5).map((s) => (
                      <div key={s.status} className="flex items-center justify-between gap-3">
                        <div className="text-xs font-semibold text-text-muted">{s.status}</div>
                        <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-text">
                          {s.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid h-full place-items-center text-sm text-text-muted">Loading…</div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Trend + tables */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader title="Dispatched volume trend" subtitle="Daily dispatched liters (from dispatch tasks)" />
            <CardBody className="h-[260px]">
              {charts ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.dailyLiters} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="4 6" stroke="rgba(15, 23, 42, 0.08)" />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: 'rgba(71,85,105,0.9)', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'rgba(71,85,105,0.9)', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 14,
                        border: '1px solid rgba(203,213,225,0.9)',
                        background: 'rgba(255,255,255,0.95)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="liters"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="grid h-full place-items-center text-sm text-text-muted">Loading…</div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card>
            <CardHeader title="Vehicles on transit" subtitle="Top active items (click in Tracking for map)" />
            <div className="divide-y divide-border">
              {onTransit.slice(0, 6).map((t) => (
                <div key={t.peaDispatchNo} className="px-5 py-4 hover:bg-muted/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-text">
                        {t.vehiclePlate} • {t.peaDispatchNo}
                      </div>
                      <div className="mt-1 truncate text-xs text-text-muted">
                        {t.oilCompanyName} • {t.transporterName} • Dest: {t.destinationDepotId}
                      </div>
                    </div>
                    <StatusPill status={t.status} />
                  </div>
                </div>
              ))}
              {onTransit.length === 0 ? (
                <div className="px-5 py-6 text-sm text-text-muted">No transit items in mock data.</div>
              ) : null}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-12">
          <Card>
            <CardHeader title="Recent dispatches" subtitle="Latest dispatch tasks with ETA and status" />
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full text-left text-sm">
                <thead className="bg-muted/40 text-xs text-text-muted">
                  <tr>
                    {['Dispatch', 'Oil company', 'Transporter', 'ETA', 'Status'].map((h) => (
                      <th key={h} className="whitespace-nowrap px-5 py-3 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentDispatches.map((r) => (
                    <tr key={r.peaDispatchNo} className="hover:bg-muted/30">
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-text">{r.peaDispatchNo}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-text">{r.oilCompany}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-text">{r.transporter}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-text">{r.eta}</td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <StatusPill status={r.status} />
                      </td>
                    </tr>
                  ))}
                  {recentDispatches.length === 0 ? (
                    <tr>
                      <td className="px-5 py-6 text-sm text-text-muted" colSpan={5}>
                        No dispatch tasks in mock data.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

