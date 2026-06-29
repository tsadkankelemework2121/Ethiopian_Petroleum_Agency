import type { GpsVehicle } from './types'
import api from '../api/axios'

const GPS_API_URL =
  'https://mellatech.et/et/api/api.php?api=user&ver=1.0&cmd=USER_GET_OBJECTS'

export async function fetchGpsVehicles(): Promise<GpsVehicle[]> {
  // Start Mellatech and ZTrack fetches in parallel
  const mellaPromise = (async (): Promise<GpsVehicle[]> => {
    let mellaVehicles: GpsVehicle[] = []
    let cachedMella: GpsVehicle[] = []
    
    try {
      const stored = localStorage.getItem('pea_cached_mella_vehicles')
      if (stored) {
        cachedMella = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Error parsing cached Mella vehicles:', e)
    }

    try {
      const res = await fetch(GPS_API_URL, {
        headers: {
          'key': '4DC7C24EDCF88C5B3F8B03A72631DBF8'
        }
      })
      if (res.ok) {
        const data = (await res.json()) as any[]
        if (Array.isArray(data) && data.length > 0) {
          mellaVehicles = data.map((v) => ({
            ...v,
            source: 'mella' as const,
          }))
          localStorage.setItem('pea_cached_mella_vehicles', JSON.stringify(mellaVehicles))
        }
      }
    } catch (err) {
      console.error('Error fetching Mella GPS vehicles:', err)
    }

    if (mellaVehicles.length === 0 && cachedMella.length > 0) {
      mellaVehicles = cachedMella
    }
    return mellaVehicles
  })()

  const ztrackPromise = (async (): Promise<GpsVehicle[]> => {
    let ztrackVehicles: GpsVehicle[] = []
    try {
      // Fetch vehicle lists and status in parallel to optimize wait time
      const [listRes, statusRes] = await Promise.all([
        api.get('/ztrack/vehicles'),
        api.get('/ztrack/vehicles/status')
      ])
      
      const vehicleList = Array.isArray(listRes.data?.data) ? listRes.data.data : []
      const statusList = Array.isArray(statusRes.data?.data) ? statusRes.data.data : []

      const statusMap = new Map<number, any>()
      statusList.forEach((s: any) => {
        if (s.unitId) {
          statusMap.set(s.unitId, s)
        }
      })

      ztrackVehicles = vehicleList.map((v: any) => {
        const statusInfo = statusMap.get(v.unitId) || {}
        return {
          imei: statusInfo.imei || `ztrack_${v.unitId}`,
          name: v.plateNo || statusInfo.plateNo || `ZTrack ${v.unitId}`,
          group: v.group || statusInfo.group || 'OLA',
          odometer: String(statusInfo.odometer || '0'),
          engine: statusInfo.engine === 'on' ? 'on' : 'off',
          status: statusInfo.status || 'Offline',
          dt_server: statusInfo.dt_server || new Date().toISOString(),
          dt_tracker: statusInfo.dt_tracker || new Date().toISOString(),
          lat: String(statusInfo.lat || ''),
          lng: String(statusInfo.lng || ''),
          altitude: String(statusInfo.altitude || '0'),
          angle: String(statusInfo.angle || '0'),
          speed: String(statusInfo.speed || '0'),
          fuel_1: String(statusInfo.fuel_1 || '0 L'),
          fuel_2: String(statusInfo.fuel_2 || '0 L'),
          fuel_can_level_percent: statusInfo.fuel_can_level_percent !== undefined ? statusInfo.fuel_can_level_percent : null,
          fuel_can_level_value: statusInfo.fuel_can_level_value !== undefined ? statusInfo.fuel_can_level_value : null,
          custom_fields: statusInfo.custom_fields || 'ZTrack Vehicle',
          source: 'ztrack' as const,
        }
      })
    } catch (err) {
      console.error('Error fetching ZTrack GPS vehicles:', err)
    }
    return ztrackVehicles
  })()

  // Wait for both promises to complete concurrently
  const [mellaVehicles, ztrackVehicles] = await Promise.all([mellaPromise, ztrackPromise])

  return [...mellaVehicles, ...ztrackVehicles]
}
