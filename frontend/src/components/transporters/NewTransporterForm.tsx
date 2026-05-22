import { useState } from 'react'
import type { Transporter } from '../../data/types'

export default function NewTransporterForm({
  onClose,
  onSubmit,
  companyId,
}: {
  onClose: () => void
  onSubmit: (t: Transporter) => void
  companyId?: string
}) {
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    city: '',
    address: '',
    person1: '',
    person2: '',
    phone1: '',
    phone2: '',
    email1: '',
    email2: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newTransporter: Transporter = {
      id: `TR-${Date.now()}`,
      name: formData.name,
      location: { region: formData.region, city: formData.city, address: formData.address },
      contacts: {
        person1: formData.person1 || undefined,
        person2: formData.person2 || undefined,
        phone1: formData.phone1 || undefined,
        phone2: formData.phone2 || undefined,
        email1: formData.email1 || undefined,
        email2: formData.email2 || undefined,
      },
      vehicles: [],
      oilCompanyId: companyId,
    }
    onSubmit(newTransporter)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-text mb-1">Name *</label>
          <input
            required
            type="text"
            placeholder="Enter transporter name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Region *</label>
          <input
            required
            type="text"
            placeholder="Enter region"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">City *</label>
          <input
            required
            type="text"
            placeholder="Enter city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-text mb-1">Address</label>
          <input
            type="text"
            placeholder="Enter full address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Contact Person 1</label>
          <input
            type="text"
            placeholder="Enter primary contact name"
            value={formData.person1}
            onChange={(e) => setFormData({ ...formData, person1: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Contact Person 2</label>
          <input
            type="text"
            placeholder="Enter secondary contact name"
            value={formData.person2}
            onChange={(e) => setFormData({ ...formData, person2: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Phone 1</label>
          <input
            type="tel"
            placeholder="e.g. +251 911 234 567"
            value={formData.phone1}
            onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Phone 2</label>
          <input
            type="tel"
            placeholder="e.g. +251 911 234 568"
            value={formData.phone2}
            onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Email 1</label>
          <input
            type="email"
            placeholder="e.g. contact@transporter.com"
            value={formData.email1}
            onChange={(e) => setFormData({ ...formData, email1: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Email 2</label>
          <input
            type="email"
            placeholder="e.g. alt@transporter.com"
            value={formData.email2}
            onChange={(e) => setFormData({ ...formData, email2: e.target.value })}
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
          Create
        </button>
      </div>
    </form>
  )
}
