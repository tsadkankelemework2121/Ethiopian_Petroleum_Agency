import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

type Vehicle = {
  imei: string
  name: string
  plate: string
  group: string | null
  odometer: string
  engine: string
  status: string
  dt_server: string
  dt_tracker: string
  lat: string
  lng: string
  altitude: string
  angle: string
  speed: string
  fuel_1: string
  fuel_2: string
  fuel_can_level_percent: string | null
  fuel_can_level_value: string | null
}

type Props = {
  vehicles: Vehicle[]
  selectedVehicle: Vehicle | null
  onVehicleSelect: (vehicle: Vehicle) => void
  onClose: () => void
}

function getStatusColor(status: string, speed: string, engine: string) {
  const speedNum = parseFloat(speed)
  const isMoving = speedNum > 0
  const engineOn = engine === 'on'

  if (isMoving) return { bg: 'bg-green-500', label: 'Moving' }
  if (engineOn && !isMoving) return { bg: 'bg-yellow-500', label: 'Idle' }
  return { bg: 'bg-red-500', label: 'Stopped' }
}

function getVehicleIcon() {
  return '🚛'
}

export default function VehicleCard({ vehicles, selectedVehicle, onVehicleSelect, onClose }: Props) {
  const [showDetails, setShowDetails] = useState(false)
  const [search, setSearch] = useState('')

  const filteredVehicles = vehicles.filter((v) =>
    v.plate.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 w-80 bg-white rounded-xl border border-[#D1D5DB] shadow-lg overflow-hidden flex flex-col max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#D1D5DB] bg-muted shrink-0">
        <h3 className="text-sm font-semibold text-text">Vehicles ({filteredVehicles.length})</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white rounded-lg transition"
          aria-label="Close vehicles"
        >
          <XMarkIcon className="w-5 h-5 text-text" />
        </button>
      </div>

      {/* Search Box */}
      <div className="p-3 border-b border-[#D1D5DB] bg-white shrink-0">
        <input
          type="text"
          placeholder="Search plate..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] bg-white text-sm outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Vehicle List */}
      <div className="overflow-y-auto flex-1">
        {filteredVehicles.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-text-muted">No vehicles found</p>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => {
          const statusInfo = getStatusColor(vehicle.status, vehicle.speed, vehicle.engine)
          const isSelected = selectedVehicle?.imei === vehicle.imei

          return (
            <button
              key={vehicle.imei}
              onClick={() => onVehicleSelect(vehicle)}
              className={`w-full text-left p-4 border-b border-[#D1D5DB] hover:bg-muted/50 transition ${
                isSelected ? 'bg-primary/10 border-l-4 border-primary' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Status Indicator with Vehicle Icon - Smaller */}
                <div
                  className={`${statusInfo.bg} w-7 h-7 rounded-lg flex items-center justify-center text-white font-semibold text-sm shrink-0`}
                >
                  {getVehicleIcon()}
                </div>

                {/* Vehicle Info - Plate Only */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-text truncate">{vehicle.plate}</div>
                </div>

                {/* More Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDetails(true)
                  }}
                  className="px-2 py-1 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-strong transition shrink-0"
                >
                  More
                </button>
              </div>
            </button>
            )
          })
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-[#D1D5DB] w-96 max-h-96 overflow-y-auto shadow-xl">
            {/* Details Header */}
            <div className="p-4 border-b border-[#D1D5DB] bg-muted flex items-center justify-between">
              <h3 className="font-semibold text-text">{selectedVehicle.plate} Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="p-1 hover:bg-white rounded-lg transition"
              >
                <XMarkIcon className="w-5 h-5 text-text" />
              </button>
            </div>

            {/* Details Content */}
            <div className="p-4 space-y-3">
              <DetailRow label="Plate" value={selectedVehicle.plate} />
              <DetailRow label="Vehicle Name" value={selectedVehicle.name} />
              <DetailRow label="IMEI" value={selectedVehicle.imei} />
              <DetailRow label="Status" value={selectedVehicle.status} />
              <DetailRow label="Engine" value={selectedVehicle.engine === 'on' ? 'On' : 'Off'} />
              <DetailRow label="Speed" value={`${selectedVehicle.speed} km/h`} />
              <DetailRow label="Odometer" value={`${selectedVehicle.odometer} km`} />
              <DetailRow label="Group" value={selectedVehicle.group || 'N/A'} />
              <DetailRow label="Latitude" value={selectedVehicle.lat} />
              <DetailRow label="Longitude" value={selectedVehicle.lng} />
              <DetailRow label="Altitude" value={`${selectedVehicle.altitude} m`} />
              <DetailRow label="Angle" value={`${selectedVehicle.angle}°`} />
              <DetailRow label="Fuel Tank 1" value={`${selectedVehicle.fuel_1}%`} />
              <DetailRow label="Fuel Tank 2" value={`${selectedVehicle.fuel_2}%`} />
              <DetailRow label="Server Time" value={selectedVehicle.dt_server} />
              <DetailRow label="Tracker Time" value={selectedVehicle.dt_tracker} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-xs font-medium text-text-muted">{label}:</span>
      <span className="text-xs text-text font-medium text-right">{value}</span>
    </div>
  )
}
