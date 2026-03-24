import type { Depot, DispatchTask, OilCompany, RegionFuelSummary, Transporter, Vehicle } from './types'
import { depots, dispatchTasks, oilCompanies, regionalFuelDispatchedThisWeek, transporters } from './mockData'

export type DashboardKpis = {
  vehiclesOnTransit: number
  gpsOfflineOver24h: number
  exceededEta: number
  stoppedOver5h: number
}

function uniqBy<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>()
  const out: T[] = []
  for (const item of items) {
    const k = key(item)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(item)
  }
  return out
}

export async function getOilCompanies(): Promise<OilCompany[]> {
  return oilCompanies
}

export async function getTransporters(oilCompanyId?: string): Promise<Transporter[]> {
  if (oilCompanyId) {
    return transporters.filter(t => t.oilCompanyId === oilCompanyId || t.name === 'No Owner' /* Handle case if you want them to see specific unowned transporters */)
  }
  return transporters
}

export async function getDepots(oilCompanyId?: string): Promise<Depot[]> {
  if (oilCompanyId) {
    return depots.filter(d => d.oilCompanyId === oilCompanyId)
  }
  return depots
}

export async function getVehicles(oilCompanyId?: string): Promise<Vehicle[]> {
  const filteredTransporters = await getTransporters(oilCompanyId);
  return filteredTransporters.flatMap((t) => t.vehicles)
}

export async function getDispatchTasks(oilCompanyId?: string): Promise<DispatchTask[]> {
  if (oilCompanyId) {
    return dispatchTasks.filter(t => t.oilCompanyId === oilCompanyId)
  }
  return dispatchTasks
}

export async function getDashboardKpis(oilCompanyId?: string): Promise<DashboardKpis> {
  const tasks = await getDispatchTasks(oilCompanyId)

  const vehiclesOnTransit = tasks.filter((t) => t.status === 'On transit').length
  const gpsOfflineOver24h = tasks.filter((t) => t.status === 'GPS Offline >24h').length
  const exceededEta = tasks.filter((t) => t.status === 'Exceeded ETA').length
  const stoppedOver5h = tasks.filter((t) => t.status === 'Stopped >5h').length

  return { vehiclesOnTransit, gpsOfflineOver24h, exceededEta, stoppedOver5h }
}

export async function getRegionalFuelDispatchedThisWeek(oilCompanyId?: string): Promise<RegionFuelSummary[]> {
  // We don't have this granularly mapped per dispatch easily in the mock right now
  // We'll just return the static mock for now or optionally scale it down if oilCompanyId is present.
  if (oilCompanyId) {
    // For demo purposes, let's half the numbers if it's a specific company
    return regionalFuelDispatchedThisWeek.map(r => ({
      ...r,
      benzineM3: Math.floor(r.benzineM3 * 0.4),
      dieselM3: Math.floor(r.dieselM3 * 0.4),
      jetFuelM3: Math.floor(r.jetFuelM3 * 0.4),
    }))
  }
  return regionalFuelDispatchedThisWeek
}

export async function getVehiclesOnTransit(oilCompanyId?: string): Promise<
  Array<
    DispatchTask & {
      oilCompanyName: string
      transporterName: string
      vehiclePlate: string
      destinationDepotName: string
    }
  >
> {
  const companiesById = new Map(oilCompanies.map((c) => [c.id, c] as const))
  const transportersById = new Map(transporters.map((t) => [t.id, t] as const))
  const depotsById = new Map(depots.map((d) => [d.id, d] as const))
  const vehiclesById = new Map(transporters.flatMap((t) => t.vehicles).map((v) => [v.id, v] as const))

  let filteredTasks = dispatchTasks;
  if (oilCompanyId) {
    filteredTasks = filteredTasks.filter(t => t.oilCompanyId === oilCompanyId);
  }

  return filteredTasks
    .filter((t) => t.status === 'On transit' || t.status === 'Exceeded ETA' || t.status === 'GPS Offline >24h' || t.status === 'Stopped >5h')
    .map((t) => ({
      ...t,
      oilCompanyName: companiesById.get(t.oilCompanyId)?.name ?? '—',
      transporterName: transportersById.get(t.transporterId)?.name ?? '—',
      vehiclePlate: vehiclesById.get(t.vehicleId)?.plateRegNo ?? '—',
      destinationDepotName: depotsById.get(t.destinationDepotId)?.name ?? '—',
    }))
}

export async function getEntitiesSummary(oilCompanyId?: string): Promise<{
  oilCompanies: number
  transporters: number
  depots: number
  vehicles: number
}> {
  const filteredTransporters = await getTransporters(oilCompanyId);
  const filteredDepots = await getDepots(oilCompanyId);
  const vehicles = uniqBy(filteredTransporters.flatMap((t) => t.vehicles), (v) => v.id).length
  
  return {
    oilCompanies: oilCompanies.length,
    transporters: filteredTransporters.length,
    depots: filteredDepots.length,
    vehicles,
  }
}

export type DashboardCharts = {
  statusCounts: Array<{ status: DispatchTask['status']; count: number }>
  fuelTotals: Array<{ fuelType: DispatchTask['fuelType']; liters: number }>
  dailyLiters: Array<{ day: string; liters: number }>
}

export async function getDashboardCharts(oilCompanyId?: string): Promise<DashboardCharts> {
  const statusCountsMap = new Map<DispatchTask['status'], number>()
  const fuelTotalsMap = new Map<DispatchTask['fuelType'], number>()
  const dailyMap = new Map<string, number>()

  const tasks = await getDispatchTasks(oilCompanyId);

  for (const t of tasks) {
    statusCountsMap.set(t.status, (statusCountsMap.get(t.status) ?? 0) + 1)
    fuelTotalsMap.set(t.fuelType, (fuelTotalsMap.get(t.fuelType) ?? 0) + t.dispatchedLiters)

    const day = t.dispatchDateTime.slice(0, 10) // YYYY-MM-DD
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + t.dispatchedLiters)
  }

  const statusCounts = [...statusCountsMap.entries()]
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count)

  const fuelTotals = [...fuelTotalsMap.entries()]
    .map(([fuelType, liters]) => ({ fuelType, liters }))
    .sort((a, b) => b.liters - a.liters)

  const dailyLiters = [...dailyMap.entries()]
    .map(([day, liters]) => ({ day, liters }))
    .sort((a, b) => (a.day < b.day ? -1 : 1))

  return { statusCounts, fuelTotals, dailyLiters }
}

