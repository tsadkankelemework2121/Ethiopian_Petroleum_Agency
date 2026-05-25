import { ModalOverlay } from '../ui/ModelOverlay'
import MapView from '../../components/map/MapView'
import type { DispatchTask, GpsVehicle } from '../../data/types'

export default function DispatchTrackingModal({
  trackingTask,
  vehicles,
  onClose,
}: {
  trackingTask: DispatchTask
  vehicles: GpsVehicle[]
  onClose: () => void
}) {

  if (!trackingTask) return null

  const gpsVehicle = vehicles.find(
    (v) => v.imei === trackingTask.vehicleId || v.name === trackingTask.vehicleId
  )
  const lat = Number(gpsVehicle?.lat || 9.0)
  const lng = Number(gpsVehicle?.lng || 39.5)
  const center = { lat, lng }
  const label = gpsVehicle?.name ?? trackingTask.vehicleId
  const speed = gpsVehicle?.speed || '0'
  const sourceTag = gpsVehicle?.source ? ` [${gpsVehicle.source.toUpperCase()}]` : '';

  return (
    <ModalOverlay isOpen={true} onClose={onClose} title={`Real-time Tracking - ${trackingTask.peaDispatchNo}${sourceTag}`}>
      <div className="h-[450px] relative rounded-lg overflow-hidden border border-[#D1D5DB]">
        <MapView
          center={center}
          zoom={13}
          markers={[
            {
              id: trackingTask.vehicleId,
              position: center,
              label,
              subtitle: `Speed: ${speed} km/h`,
            },
          ]}
        />
      </div>
    </ModalOverlay>
  )
}
