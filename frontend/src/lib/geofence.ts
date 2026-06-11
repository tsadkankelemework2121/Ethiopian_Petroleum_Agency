export const DJIBOUTI_ZONE: [number, number][] = [
  [11.636092, 43.047172],
  [11.652118, 43.357730],
  [10.968154, 42.936767],
  [11.013997, 42.624213],
  [10.898056, 42.278169],
  [10.873768, 42.028198],
  [10.922290, 41.791997],
  [11.046343, 41.767273],
  [11.243062, 41.756287],
  [11.637216, 41.733316],
  [11.759853, 41.783711],
  [12.012492, 42.047420],
  [12.584056, 42.451197],
  [12.425899, 42.692804],
  [12.616217, 42.827434],
  [12.771588, 43.159808],
  [12.712511, 43.253256],
  [12.109201, 43.472976],
  [11.942621, 43.363035],
  [11.856572, 43.168022],
  [11.671075, 42.755958],
  [11.576925, 42.695591],
  [11.593060, 42.778015],
  [11.636092, 43.047172]
];

export function isPointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  if (isNaN(lat) || isNaN(lng)) return false;
  
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    
    const intersect = ((yi > lng) !== (yj > lng))
        && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function isVehicleInDjibouti(lat: string | number, lng: string | number): boolean {
  const latitude = typeof lat === 'string' ? parseFloat(lat) : lat;
  const longitude = typeof lng === 'string' ? parseFloat(lng) : lng;
  return isPointInPolygon(latitude, longitude, DJIBOUTI_ZONE);
}
