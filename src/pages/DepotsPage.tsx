import { useEffect, useState } from 'react'
import { getDepots } from '../data/mockApi'
import type { Depot } from '../data/types'
import PageHeader from '../components/layout/PageHeader'
import { ModalOverlay } from '../components/ui/ModelOverlay'
import { EnvelopeIcon, MapPinIcon, PhoneIcon, PlusIcon, EyeIcon } from '@heroicons/react/24/outline'
import EmptyState from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'

export default function DepotsPage() {
  const [items, setItems] = useState<Depot[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedDepot, setSelectedDepot] = useState<Depot | null>(null)
  const [showMapModal, setShowMapModal] = useState(false)

  useEffect(() => {
    void getDepots()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  const openGoogleMaps = (depot: Depot) => {
    if (depot.mapLocation) {
      const { lat, lng } = depot.mapLocation
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')
    } else {
      // If no coordinates, search by address
      const query = encodeURIComponent(`${depot.location.address}, ${depot.location.city}, ${depot.location.region}`)
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
    }
  }

  const viewOnMap = (depot: Depot) => {
    setSelectedDepot(depot)
    setShowMapModal(true)
  }

  return (
    <div>
      <PageHeader
        title="Depots"
        subtitle="Depots with contact details and map location."
        right={
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#27A2D8] px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-[#1d7fb0] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27A2D8]/40"
          >
            <PlusIcon className="size-4" />
            New Depot
          </button>
        }
      />

      <ModalOverlay
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Add New Depot"
      >
        <NewDepotForm
          onClose={() => setShowForm(false)}
          onSubmit={(newDepot) => {
            setItems([...items, newDepot])
            setShowForm(false)
          }}
        />
      </ModalOverlay>

      <ModalOverlay
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        title={`Map Location - ${selectedDepot?.name}`}
      >
        {selectedDepot && (
          <div className="space-y-4">
            {selectedDepot.mapLocation ? (
              <>
                <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200">
                  <iframe
                    title="depot-map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${selectedDepot.mapLocation.lat},${selectedDepot.mapLocation.lng}`}
                    allowFullScreen
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => openGoogleMaps(selectedDepot)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#27A2D8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d7fb0] transition"
                  >
                    <MapPinIcon className="size-4" />
                    Open in Google Maps
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <MapPinIcon className="size-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No map location available</h3>
                <p className="mt-2 text-sm text-gray-500">
                  This depot doesn't have coordinates set. You can still view it by address.
                </p>
                <button
                  type="button"
                  onClick={() => openGoogleMaps(selectedDepot)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#27A2D8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d7fb0] transition"
                >
                  <MapPinIcon className="size-4" />
                  Search by Address
                </button>
              </div>
            )}
          </div>
        )}
      </ModalOverlay>

      {loading ? (
        <div className="rounded-xl border border-[#D1D5DB] bg-white overflow-hidden">
          <table className="min-w-full divide-y divide-[#D1D5DB]">
            <thead className="bg-muted/50">
              <tr>
                {['Depot', 'Location', 'Contact Person', 'Phone', 'Email', 'Actions'].map((header) => (
                  <th key={header} className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D1D5DB]">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24 mt-2" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-32 mt-2" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-8 w-20 rounded-lg" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<MapPinIcon className="size-8" />}
          title="No depots yet"
          description="Add your first depot to get started with contact details and map locations."
          action={
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-primary-strong transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <PlusIcon className="size-4" />
              Add your first depot
            </button>
          }
        />
      ) : (
        <div className="rounded-xl border border-[#D1D5DB] bg-white overflow-hidden">
          <table className="min-w-full divide-y divide-[#D1D5DB]">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Depot</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Contact Person</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D1D5DB]">
              {items.map((depot, index) => (
                <tr 
                  key={depot.id} 
                  className="hover:bg-muted/40 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-text">{depot.name}</div>
                    <div className="text-xs text-text-muted mt-1">ID: {depot.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-text">{depot.location.address}</div>
                    <div className="text-xs text-text-muted mt-1">
                      {depot.location.city}, {depot.location.region}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-text">{depot.contacts.person1 || '—'}</div>
                    {depot.contacts.person2 && (
                      <div className="text-xs text-text-muted mt-1">{depot.contacts.person2}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {depot.contacts.phone1 ? (
                      <>
                        <div className="flex items-center gap-1 text-sm text-text">
                          <PhoneIcon className="size-3.5 text-text-muted" />
                          {depot.contacts.phone1}
                        </div>
                        {depot.contacts.phone2 && (
                          <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
                            <PhoneIcon className="size-3" />
                            {depot.contacts.phone2}
                          </div>
                        )}
                      </>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {depot.contacts.email1 ? (
                      <>
                        <div className="flex items-center gap-1 text-sm text-text">
                          <EnvelopeIcon className="size-3.5 text-text-muted" />
                          <span className="truncate max-w-[150px]">{depot.contacts.email1}</span>
                        </div>
                        {depot.contacts.email2 && (
                          <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
                            <EnvelopeIcon className="size-3" />
                            <span className="truncate max-w-[130px]">{depot.contacts.email2}</span>
                          </div>
                        )}
                      </>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => viewOnMap(depot)}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#27A2D8]/10 px-3 py-1.5 text-sm font-medium text-[#27A2D8] hover:bg-[#27A2D8]/20 transition"
                      >
                        <EyeIcon className="size-4" />
                        View Map
                      </button>
                      {depot.mapLocation && (
                        <button
                          type="button"
                          onClick={() => openGoogleMaps(depot)}
                          className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
                          title="Open in Google Maps"
                        >
                          <MapPinIcon className="size-4" />
                          <span className="sr-only sm:not-sr-only sm:inline">GMaps</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add custom animations */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

function NewDepotForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (depot: Depot) => void }) {
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
    lat: '',
    lng: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newDepot: Depot = {
      id: `DEP-${Date.now()}`,
      name: formData.name,
      location: {
        region: formData.region,
        city: formData.city,
        address: formData.address,
      },
      contacts: {
        person1: formData.person1 || undefined,
        person2: formData.person2 || undefined,
        phone1: formData.phone1 || undefined,
        phone2: formData.phone2 || undefined,
        email1: formData.email1 || undefined,
        email2: formData.email2 || undefined,
      },
      mapLocation:
        formData.lat && formData.lng
          ? { lat: Number(formData.lat), lng: Number(formData.lng) }
          : undefined,
    }
    onSubmit(newDepot)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-text mb-1">Depot Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#27A2D8]/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Region *</label>
          <input
            type="text"
            required
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#27A2D8]/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">City *</label>
          <input
            type="text"
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#27A2D8]/40"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-text mb-1">Address *</label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#27A2D8]/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Contact Person 1</label>
          <input
            type="text"
            value={formData.person1}
            onChange={(e) => setFormData({ ...formData, person1: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#27A2D8]/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Contact Person 2</label>
          <input
            type="text"
            value={formData.person2}
            onChange={(e) => setFormData({ ...formData, person2: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#27A2D8]/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Phone 1</label>
          <input
            type="tel"
            value={formData.phone1}
            onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#27A2D8]/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Phone 2</label>
          <input
            type="tel"
            value={formData.phone2}
            onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#27A2D8]/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Email 1</label>
          <input
            type="email"
            value={formData.email1}
            onChange={(e) => setFormData({ ...formData, email1: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#27A2D8]/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Email 2</label>
          <input
            type="email"
            value={formData.email2}
            onChange={(e) => setFormData({ ...formData, email2: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#27A2D8]/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Latitude (optional)</label>
          <input
            type="number"
            step="any"
            value={formData.lat}
            onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#27A2D8]/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Longitude (optional)</label>
          <input
            type="number"
            step="any"
            value={formData.lng}
            onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#27A2D8]/40"
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
          className="rounded-lg bg-[#27A2D8] px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-[#1d7fb0] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27A2D8]/40"
        >
          Create Depot
        </button>
      </div>
    </form>
  )
}