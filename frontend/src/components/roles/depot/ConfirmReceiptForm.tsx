import { useState, useMemo, useRef } from 'react'
import { CameraIcon, CheckCircleIcon, MapPinIcon } from '@heroicons/react/24/outline'
import api from '../../../api/axios'
import type { GpsVehicle } from '../../../data/types'

export default function ConfirmReceiptForm({ peaDispatchNo, vehicleId, vehicles, onClose, onSuccess }: {
  peaDispatchNo: string;
  vehicleId: string;
  vehicles: GpsVehicle[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const vehicle = useMemo(() => vehicles.find(v => v.imei === vehicleId || v.name === vehicleId), [vehicles, vehicleId])
  const geoStatus = vehicle && vehicle.lat && vehicle.lng 
    ? `Vehicle Location: ${Number(vehicle.lat).toFixed(5)}, ${Number(vehicle.lng).toFixed(5)}` 
    : 'Vehicle GPS location unavailable'

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!image) { alert('Please upload an image.'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('image', image)
      if (vehicle && vehicle.lat && vehicle.lng) {
        fd.append('latitude', vehicle.lat.toString())
        fd.append('longitude', vehicle.lng.toString())
      }
      fd.append('vehicle_status', 'Confirmed at depot')
      await api.post(`/dispatches/${peaDispatchNo}/deliver`, fd)
      onSuccess()
    } catch (err: any) {
      console.error('Delivery confirmation error:', err?.response?.data || err)
      const msg = err?.response?.data?.message || 'Error confirming delivery.'
      const debug = err?.response?.data?.debug ? '\n\nDebug: ' + JSON.stringify(err.response.data.debug) : ''
      alert(msg + debug)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-slate-500">
        Upload a photo of the delivery to confirm receipt.
      </p>

      {/* Show Plate Number */}
      <div className="flex items-center gap-2 text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
        <span className="font-semibold text-slate-700">Vehicle Plate:</span>
        <span className="text-slate-900 font-bold">{vehicle ? vehicle.name : vehicleId}</span>
      </div>

      {/* Image Upload */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition min-h-[200px]"
      >
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-[250px] rounded-lg object-contain" />
        ) : (
          <>
            <CameraIcon className="size-10 text-slate-400 mb-2" />
            <span className="text-sm font-medium text-slate-500">Click to upload photo</span>
            <span className="text-xs text-slate-400 mt-1">JPG, PNG — max 10MB</span>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />

      {/* Location Status */}
      <div className="flex items-center gap-2 text-sm">
        <MapPinIcon className="size-4 text-slate-400" />
        <span className="text-slate-600">{geoStatus}</span>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !image}
          className="rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white shadow-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <><div className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Confirming...</>
          ) : (
            <><CheckCircleIcon className="size-4" /> Confirm Delivery</>
          )}
        </button>
      </div>
    </form>
  )
}
