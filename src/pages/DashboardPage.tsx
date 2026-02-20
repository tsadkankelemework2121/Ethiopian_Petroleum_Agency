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
        ...t,
        oilCompany: companiesById.get(t.oilCompanyId)?.name ?? '—',
        transporter: transportersById.get(t.transporterId)?.name ?? '—',
        eta: t.etaDateTime.replace('T', ' ').replace('Z', ''),
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

    return charts.statusCounts.reduce(
      (acc, s) => {
        if (s.status === 'Delivered') {
          acc.push({ name: 'Delivered', value: s.count })
        } else if (s.status === 'On transit') {
          acc.push({ name: 'In Transit', value: s.count })
        } else {
          const alertEntry = acc.find((item) => item.name === 'Alerts')
          if (alertEntry) {
            alertEntry.value += s.count
          } else {
            acc.push({ name: 'Alerts', value: s.count })
          }
        }
        return acc
      },
      [] as Array<{ name: string; value: number }>,
    )
  }, [charts])

  const pieColors = {
    'Delivered': '#10b981',
    'In Transit': '#2563EB',
    'Alerts': '#ef4444',
  }

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
              title="Regional fuel dispatch overview"
              subtitle="Grouped view by region (liters) — Benzine / Diesel / Jet Fuel"
              right={
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-strong">
                  <MapPinIcon className="size-4" />
                  Ethiopia regions
                </span>
              }
            />
            <CardBody className="h-80">
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
                    label={{ value: 'Liters', angle: -90, position: 'insideLeft', offset: 10 }}
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
                  <Bar dataKey="benzineM3" name="Benzine" fill="#27A2D8" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="dieselM3" name="Diesel" fill="#2563EB" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="jetFuelM3" name="Jet Fuel" fill="#B1BDD9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card>
            <CardHeader title="Dispatch status" subtitle="Distribution of current dispatch tasks" />
            <CardBody className="h-80">
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
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={95}
                          paddingAngle={3}
                        >
                          {statusPie.map((entry) => (
                            <Cell key={entry.name} fill={pieColors[entry.name as keyof typeof pieColors]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid gap-2">
                    {statusPie.map((s) => (
                      <div key={s.name} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: pieColors[s.name as keyof typeof pieColors] }}
                          />
                          <div className="text-xs font-semibold text-text-muted">{s.name}</div>
                        </div>
                        <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-text">
                          {s.value}
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

        {/* Fuel Type Dispatch Summary */}
        <div className="lg:col-span-12">
          <Card>
            <CardHeader title="Fuel type dispatch summary" subtitle="Total dispatched volume by fuel type" />
            <CardBody className="h-48">
              {charts ? (
                <div className="space-y-4 h-full flex flex-col justify-center">
                  {/* Calculate totals for each fuel type */}
                  {(() => {
                    const fuelData = [
                      {
                        name: 'Benzene',
                        volume: regions.reduce((sum, r) => sum + r.benzineM3, 0),
                        color: '#27A2D8',
                      },
                      {
                        name: 'Diesel',
                        volume: regions.reduce((sum, r) => sum + r.dieselM3, 0),
                        color: '#2563EB',
                      },
                      {
                        name: 'Jet Fuel',
                        volume: regions.reduce((sum, r) => sum + r.jetFuelM3, 0),
                        color: '#B1BDD9',
                      },
                    ]
                    const totalVolume = fuelData.reduce((sum, f) => sum + f.volume, 0)
                    return fuelData.map((fuel) => {
                      const percentage = totalVolume > 0 ? (fuel.volume / totalVolume) * 100 : 0
                      return (
                        <div key={fuel.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-text">{fuel.name}</span>
                            <span className="text-sm font-semibold text-primary">
                              {fuel.volume.toLocaleString()}L ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-full h-5 bg-muted/40 rounded-full overflow-hidden border border-border">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: fuel.color,
                              }}
                            />
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              ) : (
                <div className="grid h-full place-items-center text-sm text-text-muted">Loading…</div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-12">
          <Card>
            <CardHeader title="Recent dispatches" subtitle="Latest dispatch tasks with ETA and status" />
            <div className="overflow-x-auto">
              <table className="min-w-190 w-full text-left text-sm">
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
                        <StatusPill status={r.status} task={r} />
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

