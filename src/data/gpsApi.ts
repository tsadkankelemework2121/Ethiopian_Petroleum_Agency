import type { GpsVehicle } from './types'

const GPS_API_URL = ''

export async function fetchGpsVehicles(): Promise<GpsVehicle[]> {
  const res = await fetch(GPS_API_URL)

  if (!res.ok) {
    throw new Error(`GPS API request failed with status ${res.status}`)
  }

  const data = (await res.json()) as unknown

  if (!Array.isArray(data)) {
    throw new Error('Unexpected GPS API response shape')
  }

  // Trust the backend keys but defensively cast to our type
  return data as GpsVehicle[]
}

