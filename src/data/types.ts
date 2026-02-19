export type FuelType = 'Benzine' | 'Diesel' | 'Jet Fuel'

export type DispatchStatus =
  | 'On transit'
  | 'Delivered'
  | 'Exceeded ETA'
  | 'GPS Offline >24h'
  | 'Stopped >5h'

export type ContactInfo = {
  person1?: string
  person2?: string
  phone1?: string
  phone2?: string
  email1?: string
  email2?: string
}

export type Location = {
  region: string
  city: string
  address: string
}

export type LatLng = {
  lat: number
  lng: number
}

export type OilCompany = {
  id: string
  name: string
  contacts: ContactInfo
}

export type Vehicle = {
  id: string
  plateRegNo: string
  trailerRegNo: string
  manufacturer: string
  model: string
  yearOfManufacture: number
  sideNo: string
  driverName: string
  driverPhone: string
}

export type Transporter = {
  id: string
  name: string
  contacts: ContactInfo
  location: Location
  vehicles: Vehicle[]
}

export type Depot = {
  id: string
  name: string
  contacts: ContactInfo
  location: Location
  mapLocation?: LatLng
}

export type GpsPoint = {
  position: LatLng
  timestamp: string
}

export type DispatchTask = {
  peaDispatchNo: string
  oilCompanyId: string
  transporterId: string
  vehicleId: string

  dispatchDateTime: string
  dispatchLocation: string

  destinationDepotId: string
  etaDateTime: string

  fuelType: FuelType
  dispatchedLiters: number

  dropOffDateTime?: string
  dropOffLocation?: string

  status: DispatchStatus
  lastGpsPoint?: GpsPoint
}

export type RegionFuelSummary = {
  region: string
  weekLabel: string
  benzineM3: number
  dieselM3: number
  jetFuelM3: number
}

