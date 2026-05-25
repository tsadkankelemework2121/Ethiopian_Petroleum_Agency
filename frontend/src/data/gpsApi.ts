import type { GpsVehicle } from './types'
import api from '../api/axios'

const GPS_API_URL =
  'https://mellatech.et/et/api/api.php?api=user&ver=1.0&key=4DC7C24EDCF88C5B3F8B03A72631DBF8&cmd=USER_GET_OBJECTS'

export async function fetchGpsVehicles(): Promise<GpsVehicle[]> {
  let mellaVehicles: GpsVehicle[] = []
  let ztrackVehicles: GpsVehicle[] = []

  // 1. Fetch Mellatech (Mella) vehicles
  try {
    const res = await fetch(GPS_API_URL)
    if (res.ok) {
      const data = (await res.json()) as any[]
      if (Array.isArray(data)) {
        mellaVehicles = data.map((v) => ({
          ...v,
          source: 'mella' as const,
        }))
      }
    } else {
      console.warn(`Mella GPS API request failed with status ${res.status}`)
    }
  } catch (err) {
    console.error('Error fetching Mella GPS vehicles:', err)
  }

  // 2. Fetch ZTrack vehicles from the Laravel backend
  try {
    const ztrackRes = await api.get('/ztrack/vehicles/status')
    if (ztrackRes.data && ztrackRes.data.success && Array.isArray(ztrackRes.data.data)) {
      ztrackVehicles = ztrackRes.data.data.map((v: any) => ({
        imei: v.imei || `ztrack_${v.unitId}`,
        name: v.plateNo || `ZTrack ${v.unitId}`,
        group: 'OLA', // Assign group OLA so they show up for OLA Energy admin and EPA
        odometer: String(v.odometer || '0'),
        engine: v.engine === 'on' ? 'on' : 'off',
        status: v.status || 'Offline',
        dt_server: v.dt_server || new Date().toISOString(),
        dt_tracker: v.dt_tracker || new Date().toISOString(),
        lat: String(v.lat || ''),
        lng: String(v.lng || ''),
        altitude: String(v.altitude || '0'),
        angle: String(v.angle || '0'),
        speed: String(v.speed || '0'),
        fuel_1: String(v.fuel_1 || '0 L'),
        fuel_2: String(v.fuel_2 || '0 L'),
        fuel_can_level_percent: v.fuel_can_level_percent || null,
        fuel_can_level_value: v.fuel_can_level_value || null,
        custom_fields: v.custom_fields || 'ZTrack Vehicle',
        source: 'ztrack' as const,
      }))
    }
  } catch (err) {
    console.error('Error fetching ZTrack vehicles from backend:', err)
  }

  return [...mellaVehicles, ...ztrackVehicles]
}
