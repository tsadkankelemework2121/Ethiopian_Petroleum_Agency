import type { GpsVehicle } from './types'

const GPS_API_URL =
  'https://mellatech.et/et/api/api.php?api=user&ver=1.0&key=A8201FF8426454566D4F5A3F740AB880&cmd=USER_GET_OBJECTS'

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

