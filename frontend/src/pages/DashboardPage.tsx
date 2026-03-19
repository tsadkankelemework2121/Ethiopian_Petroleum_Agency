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
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { SkeletonCard, SkeletonChart } from '../components/ui/Skeleton'
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
  const [, setOnTransit] = useState<Awaited<ReturnType<typeof getVehiclesOnTransit>>>([])
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

  const chartColors = {
    blue: '#067cc1',
    gray: '#cbd5e1',
    gold: '#f59e0b',
  }
  const pieColors: Record<string, string> = {
    Delivered: chartColors.blue,
    'In Transit': chartColors.gray,
    Alerts: chartColors.gold,
  }

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-12">
        {/* KPIs */}
        <div className="md:col-span-12 min-w-0">
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {kpis === null ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </>
            ) : (
              kpiCards.map((k, i) => {
                const Icon = k.icon
                return (
                  <div
                    key={k.label}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <Card>
                      <CardBody>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-semibold text-text truncate">{k.label}</div>
                            <div className="mt-0.5 text-[10px] sm:text-xs text-text-muted truncate">{k.hint}</div>
                          </div>
                          <div className="grid size-8 sm:size-10 place-items-center rounded-lg bg-primary/10 text-primary shrink-0">
                            <Icon className="size-4 sm:size-5" />
                          </div>
                        </div>
                        <div className="flex items-end justify-between gap-2">
                          <div className="text-xl sm:text-3xl font-bold tracking-tight text-text">{k.value}</div>
                          <div className="rounded-md bg-muted px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-medium text-text-muted">
                            Live
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Charts row */}
        <div className="md:col-span-12 lg:col-span-8 min-w-0">
          <Card>
            <CardHeader
              title="Regional fuel dispatch overview"
              subtitle="Grouped view by region (liters) — Benzine / Diesel / Jet Fuel"
              right={
                <span className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <MapPinIcon className="size-4" />
                  Ethiopia regions
                </span>
              }
            />
            <CardBody className="h-[360px]">
              {regions.length === 0 ? (
                <SkeletonChart className="h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regions} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="4 6" stroke="rgba(15, 23, 42, 0.08)" />
                    <XAxis
                      dataKey="region"
                      tick={{ fill: 'rgba(71,85,105,0.9)', fontSize: 11 }}
                      angle={-35}
                      textAnchor="end"
                      dy={17}
                      tickLine={false}
                      axisLine={false}
                      height={65}
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
                    <Bar dataKey="benzineM3" name="Benzine" fill={chartColors.blue} radius={[8, 8, 0, 0]} />
                    <Bar dataKey="dieselM3" name="Diesel" fill={chartColors.gold} radius={[8, 8, 0, 0]} />
                    <Bar dataKey="jetFuelM3" name="Jet Fuel" fill={chartColors.gray} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="md:col-span-12 lg:col-span-4 min-w-0">
          <Card>
            <CardHeader title="Dispatch Events" subtitle="Distribution of current dispatch tasks" />
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
                        <text
                          x="50%"
                          y="46%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-text text-2xl font-bold"
                        >
                          {statusPie.reduce((sum, s) => sum + s.value, 0).toLocaleString()}
                        </text>
                        <text
                          x="50%"
                          y="58%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-text-muted text-[10px] font-semibold tracking-wide"
                        >
                          TOTAL DISPATCHES
                        </text>
                        <Pie
                          data={statusPie}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={62}
                          outerRadius={96}
                          paddingAngle={2}
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
                          <div className="text-xs font-medium text-text-muted">{s.name}</div>
                        </div>
                        <div className="text-xs font-semibold text-text">{s.value.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <SkeletonChart className="h-full" />
              )}
            </CardBody>
          </Card>
        </div>

        {/* Fuel Type Dispatch Summary */}
        <div className="md:col-span-12 min-w-0">
          <Card>
            <CardHeader title="Fuel type dispatch summary" subtitle="Total dispatched volume by fuel type" />
            <CardBody className="h-48">
              {charts ? (
                <div className="space-y-4 h-full flex flex-col justify-center">
                  {/* Calculate totals for each fuel type */}
                  {(() => {
                    const fuelData = [
                      {
                        name: 'Benzine',
                        volume: regions.reduce((sum, r) => sum + r.benzineM3, 0),
                        color: chartColors.blue,
                      },
                      {
                        name: 'Diesel',
                        volume: regions.reduce((sum, r) => sum + r.dieselM3, 0),
                        color: chartColors.gold,
                      },
                      {
                        name: 'Jet Fuel',
                        volume: regions.reduce((sum, r) => sum + r.jetFuelM3, 0),
                        color: chartColors.gray,
                      },
                    ]
                    const totalVolume = fuelData.reduce((sum, f) => sum + f.volume, 0)
                    return fuelData.map((fuel) => {
                      const percentage = totalVolume > 0 ? (fuel.volume / totalVolume) * 100 : 0
                      return (
                        <div key={fuel.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-text">{fuel.name}</span>
                            <span className="text-sm font-semibold text-text">
                              {fuel.volume.toLocaleString()}L
                              <span className="text-text-muted"> ({percentage.toFixed(0)}%)</span>
                            </span>
                          </div>
                          <div className="w-full h-3 rounded-lg overflow-hidden border border-[#CBD5E1] bg-transparent">
                            <div
                              className="h-full transition-all duration-300 rounded-lg"
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
                <SkeletonChart className="h-full" />
              )}
            </CardBody>
          </Card>
        </div>

        <div className="md:col-span-12 min-w-0">
          <Card>
            <CardHeader title="Recent dispatches" subtitle="Latest dispatch tasks with ETA and status" />
            <div className="overflow-x-auto">
              <table className="min-w-190 w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-muted text-xs font-semibold text-text-muted border-b border-[#D1D5DB]">
                  <tr>
                    {['Dispatch', 'Oil company', 'Transporter', 'ETA', 'Event'].map((h) => (
                      <th key={h} className="whitespace-nowrap px-5 py-4 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1D5DB]">
                  {recentDispatches.map((r) => (
                    <tr key={r.peaDispatchNo} className="hover:bg-muted/50 transition">
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-text">{r.peaDispatchNo}</td>
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

