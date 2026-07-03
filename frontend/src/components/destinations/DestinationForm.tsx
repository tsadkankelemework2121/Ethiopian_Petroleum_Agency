import { useState } from 'react'

export default function DestinationForm({
  onClose,
  onSubmit,
  companyId,
  editingDestination,
}: {
  onClose: () => void
  onSubmit: (destination: any) => void
  companyId?: string
  editingDestination?: any
}) {
  const [formData, setFormData] = useState({
    name: editingDestination?.name || '',
    region: editingDestination?.location?.region || editingDestination?.region || '',
    city: editingDestination?.location?.city || editingDestination?.city || '',
    address: editingDestination?.location?.address || editingDestination?.address || '',
    person1: editingDestination?.contacts?.person1 || editingDestination?.person1 || '',
    person2: editingDestination?.contacts?.person2 || editingDestination?.person2 || '',
    phone1: editingDestination?.contacts?.phone1 || editingDestination?.phone1 || '',
    phone2: editingDestination?.contacts?.phone2 || editingDestination?.phone2 || '',
    email1: editingDestination?.contacts?.email1 || editingDestination?.email1 || '',
    email2: editingDestination?.contacts?.email2 || editingDestination?.email2 || '',
    lat: editingDestination?.mapLocation?.lat?.toString() || editingDestination?.lat?.toString() || '',
    lng: editingDestination?.mapLocation?.lng?.toString() || editingDestination?.lng?.toString() || '',
    password: editingDestination?.password || '',
  })

  const [mapLink, setMapLink] = useState(editingDestination?.mapLink || editingDestination?.map_link || '')

  const handleMapLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setMapLink(val)

    // Parse Google Maps URLs
    const atMatch = val.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (atMatch) {
      setFormData((prev) => ({ ...prev, lat: atMatch[1], lng: atMatch[2] }))
      return
    }
    const dMatch = val.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
    if (dMatch) {
      setFormData((prev) => ({ ...prev, lat: dMatch[1], lng: dMatch[2] }))
      return
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload: any = {
      name: formData.name,
      region: formData.region,
      city: formData.city,
      address: formData.address,
      person1: formData.person1 || null,
      person2: formData.person2 || null,
      phone1: formData.phone1 || null,
      phone2: formData.phone2 || null,
      email1: formData.email1 || null,
      email2: formData.email2 || null,
      lat: formData.lat ? Number(formData.lat) : null,
      lng: formData.lng ? Number(formData.lng) : null,
      map_link: mapLink || null,
      oil_company_id: companyId,
    }
    if (formData.password) {
      payload.password = formData.password
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-text mb-1">Destination Name *</label>
          <input
            type="text"
            required
            placeholder="Enter destination name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Region *</label>
          <select
            required
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Select region...</option>
            {[
              'Afar',
              'Amhara',
              'Benishangul',
              'Gambela',
              'Harari',
              'Oromia',
              'Sidama',
              'Somali',
              'South Eth.',
              'SW Ethiopia',
              'Tigray',
              'Addis Ababa',
              'Dire Dawa',
            ].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">City *</label>
          <input
            type="text"
            required
            placeholder="Enter city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-text mb-1">Address *</label>
          <input
            type="text"
            required
            placeholder="Enter full address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Contact Person 1</label>
          <input
            type="text"
            placeholder="Enter primary contact name"
            value={formData.person1}
            onChange={(e) => setFormData({ ...formData, person1: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Contact Person 2</label>
          <input
            type="text"
            placeholder="Enter secondary contact name"
            value={formData.person2}
            onChange={(e) => setFormData({ ...formData, person2: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Phone 1</label>
          <input
            type="tel"
            placeholder="e.g. 0911234567"
            pattern="[0-9]{10}"
            title="Phone number must be exactly 10 digits (e.g. 0911234567)"
            value={formData.phone1}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 10)
              setFormData({ ...formData, phone1: val })
            }}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Phone 2</label>
          <input
            type="tel"
            placeholder="e.g. 0911234568"
            pattern="[0-9]{10}"
            title="Phone number must be exactly 10 digits (e.g. 0911234568)"
            value={formData.phone2}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 10)
              setFormData({ ...formData, phone2: val })
            }}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Email 1 *</label>
          <input
            type="email"
            required
            placeholder="e.g. contact@destination.com"
            value={formData.email1}
            onChange={(e) => setFormData({ ...formData, email1: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Email 2</label>
          <input
            type="email"
            placeholder="e.g. alt@destination.com"
            value={formData.email2}
            onChange={(e) => setFormData({ ...formData, email2: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Password for destination login */}
        <div className="sm:col-span-2 pt-2 border-t border-[#D1D5DB] mt-2">
          <label className="block text-sm font-semibold text-text mb-1">
            Destination Login Password {editingDestination ? '(leave blank to keep current)' : '*'}
          </label>
          <p className="text-xs text-text-muted mb-2">
            If Email 1 and password are provided, a login account will be created for this destination to confirm deliveries.
          </p>
          <input
            type="password"
            required={!editingDestination}
            placeholder={editingDestination ? 'Leave blank to keep current password' : 'Set destination login password (min 6 chars)'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="sm:col-span-2 pt-2 border-t border-[#D1D5DB] mt-2">
          <label className="block text-sm font-semibold text-text mb-1">Google Maps Link</label>
          <p className="text-xs text-text-muted mb-2">Paste a Google Maps link to auto-fill Latitude and Longitude.</p>
          <input
            type="url"
            value={mapLink}
            onChange={handleMapLinkChange}
            placeholder="e.g. https://www.google.com/maps/place/..."
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Latitude (optional)</label>
          <input
            type="number"
            step="any"
            placeholder="e.g. 9.0320"
            value={formData.lat}
            onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Longitude (optional)</label>
          <input
            type="number"
            step="any"
            placeholder="e.g. 38.7482"
            value={formData.lng}
            onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-semibold text-text hover:bg-muted/60"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-primary-strong transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {editingDestination ? 'Update Destination' : 'Create Destination'}
        </button>
      </div>
    </form>
  )
}
