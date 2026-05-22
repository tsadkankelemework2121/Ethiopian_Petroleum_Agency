import { useState } from 'react'
import type { Vehicle } from '../../data/types'

export default function NewTruckForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (v: Vehicle) => void
}) {
  const [formData, setFormData] = useState({
    plateRegNo: '',
    trailerRegNo: '',
    manufacturer: '',
    model: '',
    yearOfManufacture: new Date().getFullYear(),
    sideNo: '',
    driverName: '',
    driverPhone: '',
  })

  // Optionally include an upload CSV mock here
  const handleUploadCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      alert('CSV Upload Mocked: Would parse CSV and populate trucks here.')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      id: `VEH-${Date.now()}`,
      ...formData,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-dashed border-[#D1D5DB] mb-4">
        <span className="text-sm font-medium text-text-muted">Bulk upload via CSV?</span>
        <input
          type="file"
          accept=".csv"
          onChange={handleUploadCsv}
          className="text-xs text-text-muted file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Plate Reg No *</label>
          <input
            required
            type="text"
            placeholder="e.g. 3-11111 ET"
            value={formData.plateRegNo}
            onChange={(e) => setFormData({ ...formData, plateRegNo: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Driver Name *</label>
          <input
            required
            type="text"
            placeholder="Enter driver name"
            value={formData.driverName}
            onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Trailer Reg No</label>
          <input
            type="text"
            placeholder="e.g. T-22222 ET"
            value={formData.trailerRegNo}
            onChange={(e) => setFormData({ ...formData, trailerRegNo: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Side No</label>
          <input
            type="text"
            placeholder="e.g. S-101"
            value={formData.sideNo}
            onChange={(e) => setFormData({ ...formData, sideNo: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border px-4 py-2 text-sm font-semibold"
        >
          Cancel
        </button>
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
          Add Truck
        </button>
      </div>
    </form>
  )
}
