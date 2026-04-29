import { useMemo } from 'react'
import api from '../api/axios'
import { fetchGpsVehicles } from '../data/gpsApi'
import type { Depot, DispatchTask, GpsVehicle } from '../data/types'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { SkeletonCard, SkeletonChart } from '../components/ui/Skeleton'
import StatusPill from '../components/ui/StatusPill'
import { useAuth } from '../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { parseStatusDurationHours, getStatusCategory } from '../lib/parseGpsDuration'
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
  const { user } = useAuth();
  const companyId = user?.companyId

  // 1. Fetch Dispatches
  const { data: dispatches = [], isLoading: dispatchesLoading } = useQuery<DispatchTask[]>({
    queryKey: ['dispatches', user?.role, companyId],
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
    }))),
    refetchInterval: 5000,
  });

  // 2. Fetch Depots
  const { data: depots = [], isLoading: depotsLoading } = useQuery<Depot[]>({
    queryKey: ['depots', user?.role, companyId],
    queryFn: () => api.get('/depots').then(res => res.data.map((d: any) => ({
      ...d,
      id: d.id.toString(),
      location: { region: d.region, city: d.city, address: d.address },
      oilCompanyId: d.oil_company_id,
    })))
  });

  // 3. Fetch GPS Vehicles
  const { data: gpsVehicles = [], isLoading: gpsLoading } = useQuery<GpsVehicle[]>({
    queryKey: ['gps-vehicles', user?.role, companyId],
    queryFn: async () => {
      let data = await fetchGpsVehicles()
      if (user?.role?.toUpperCase() === 'OIL_COMPANY' || user?.role?.toUpperCase() === 'OIL_COMPANY_ADMIN') {
        data = data.filter(v => v.group === companyId)
      }
      return data
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const isLoading = dispatchesLoading || depotsLoading || gpsLoading;

  const chartColors = {
    blue: '#1c8547',
    gray: '#cbd5e1',
    gold: '#f59e0b',
  }

  // 4. Compute KPIs
  const kpiCards = useMemo(() => {
    const now = new Date();
    const transit = dispatches.filter(d => d.status === 'On transit').length;

    // GPS offline > 24 hrs: parse duration from the status field
    const offline = gpsVehicles.filter(v => {
      const cat = getStatusCategory(v.status)
      if (cat !== 'offline') return false
      return parseStatusDurationHours(v.status) > 24
    }).length;

    const exceeded = dispatches.filter(d =>
      d.status !== 'Delivered' &&
      d.etaDateTime &&
      new Date(d.etaDateTime) < now
    ).length;

    // Stops > 5 hours: only vehicles with "Stopped" status (not offline)
    const stopped = gpsVehicles.filter(v => {
      const cat = getStatusCategory(v.status)
      if (cat !== 'stopped') return false
      return parseStatusDurationHours(v.status) > 5
    }).length;

    return [
      { label: 'Vehicles on transit', value: String(transit), hint: 'Active dispatches now', icon: TruckIcon },
      { label: 'GPS offline > 24 hrs', value: String(offline), hint: 'Check connectivity', icon: SignalSlashIcon },
      { label: 'Exceeded ETA', value: String(exceeded), hint: 'Needs attention', icon: ExclamationTriangleIcon },
      { label: 'Stops > 5 hours', value: String(stopped), hint: 'Out of Addis Ababa', icon: StopCircleIcon },
    ] as const
  }, [dispatches, gpsVehicles]);

  // 5. Compute Regional Fuel Summary
  const regionalSummary = useMemo(() => {
    const regionMap = new Map<string, { region: string, benzineM3: number, dieselM3: number, jetFuelM3: number }>();
    const depotsById = new Map(depots.map(d => [d.id, d]));

    dispatches.forEach(d => {
      // Only show active dispatches in graphs (exclude Delivered)
      if (d.status === 'Delivered') return;

      const depot = depotsById.get(d.destinationDepotId);
      if (!depot) return;

      const region = depot.location.region || 'Unknown';
      if (!regionMap.has(region)) {
        regionMap.set(region, { region, benzineM3: 0, dieselM3: 0, jetFuelM3: 0 });
      }

      const row = regionMap.get(region)!;
      if (d.fuelType === 'Benzine') row.benzineM3 += d.dispatchedLiters;
      else if (d.fuelType === 'Diesel') row.dieselM3 += d.dispatchedLiters;
      else if (d.fuelType === 'Jet Fuel') row.jetFuelM3 += d.dispatchedLiters;
    });

    return Array.from(regionMap.values());
  }, [dispatches, depots]);

  // Compute Delivered Fuel Summary
  const deliveredSummary = useMemo(() => {
    let benzineM3 = 0;
    let dieselM3 = 0;
    let jetFuelM3 = 0;

    dispatches.forEach(d => {
      // Only show delivered dispatches
      if (d.status === 'Delivered') {
        if (d.fuelType === 'Benzine') benzineM3 += d.dispatchedLiters;
        else if (d.fuelType === 'Diesel') dieselM3 += d.dispatchedLiters;
        else if (d.fuelType === 'Jet Fuel') jetFuelM3 += d.dispatchedLiters;
      }
    });

    return { benzineM3, dieselM3, jetFuelM3 };
  }, [dispatches]);

  // 6. Compute Pie Chart (Status Counts)
  const statusPie = useMemo(() => {
    const counts = dispatches.reduce((acc, d) => {
      const s = d.status || 'On transit';
      if (s === 'Delivered') acc.Delivered = (acc.Delivered || 0) + 1;
      else if (s === 'On transit') acc['In Transit'] = (acc['In Transit'] || 0) + 1;
      else acc.Alerts = (acc.Alerts || 0) + 1;
      return acc;
    }, { Delivered: 0, 'In Transit': 0, Alerts: 0 } as Record<string, number>);

    return [
      { name: 'Delivered', value: counts.Delivered },
      { name: 'In Transit', value: counts['In Transit'] },
      { name: 'Alerts', value: counts.Alerts },
    ].filter(s => s.value > 0);
  }, [dispatches]);

  // 7. Recent Dispatches
  const recentDispatches = useMemo(() => {
    return [...dispatches]
      .sort((a, b) => new Date(b.dispatchDateTime).getTime() - new Date(a.dispatchDateTime).getTime())
      .slice(0, 6)
      .map(d => ({
        ...d,
        oilCompany: d.oilCompanyId,
        transporter: d.transporterId || '—',
        eta: d.etaDateTime?.replace('T', ' ').replace('Z', '') || '—'
      }));
  }, [dispatches]);

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
            {isLoading ? (
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
              {isLoading ? (
                <SkeletonChart className="h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionalSummary} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
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
            <CardBody className="h-80">
              {!isLoading ? (
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
                          {dispatches.length.toLocaleString()}
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
              {!isLoading ? (
                <div className="space-y-4 h-full flex flex-col justify-center">
                  {/* Calculate totals for each fuel type */}
                  {(() => {
                    const fuelData = [
                      {
                        name: 'Benzine',
                        volume: deliveredSummary.benzineM3,
                        color: chartColors.blue,
                      },
                      {
                        name: 'Diesel',
                        volume: deliveredSummary.dieselM3,
                        color: chartColors.gold,
                      },
                      {
                        name: 'Jet Fuel',
                        volume: deliveredSummary.jetFuelM3,
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
                        No dispatch tasks found.
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
