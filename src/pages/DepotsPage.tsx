import { useEffect, useState } from 'react'
import { getDepots } from '../data/mockApi'
import type { Depot } from '../data/types'
import PageHeader from '../components/layout/PageHeader'
import MapView from '../components/map/MapView'
import { Card, CardBody } from '../components/ui/Card'
import { ModalOverlay } from '../components/ui/ModelOverlay'
import { EnvelopeIcon, MapPinIcon, PhoneIcon, PlusIcon } from '@heroicons/react/24/outline'
import EmptyState from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'

export default function DepotsPage() {
  const [items, setItems] = useState<Depot[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    void getDepots()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

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
      <div className="grid gap-4 lg:grid-cols-3">
        {loading ? (
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="border-b border-[#D1D5DB] bg-muted/40 p-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-2 h-3 w-24" />
                </div>
                <CardBody className="pt-0">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-2 h-4 w-full" />
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="mt-4 h-24 w-full rounded-lg" />
                </CardBody>
              </Card>
            ))}
          </>
        ) : items.length === 0 ? (
          <div className="lg:col-span-3">
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
          </div>
        ) : (
          items.map((d, i) => (
            <div
              key={d.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
            <Card className="overflow-hidden">
              <div className="border-b border-[#D1D5DB] bg-muted/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-text">
                      {d.name} <span className="text-text-muted">({d.id})</span>
                    </div>
                    <div className="mt-1 text-xs text-text-muted">
                      {d.location.city} • {d.location.region}
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-strong">
                    Map location
                  </span>
                </div>
              </div>

              <CardBody className="pt-0">
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">Address</div>
                <div className="mt-1 text-sm text-text">{d.location.address}</div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">Contact Person</div>
                    <div className="mt-1 text-sm font-medium text-text">{d.contacts.person1 ?? '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">Primary Contact</div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-text">
                      <PhoneIcon className="size-4 shrink-0 text-text-muted" />
                      {d.contacts.phone1 ?? '—'}
                    </div>
                  </div>
                  {d.contacts.phone2 && (
                    <div>
                      <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">Secondary Contact</div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-text">
                        <PhoneIcon className="size-4 shrink-0 text-text-muted" />
                        {d.contacts.phone2}
                      </div>
                    </div>
                  )}
                  {d.contacts.email1 && (
                    <div>
                      <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">Email</div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-text">
                        <EnvelopeIcon className="size-4 shrink-0 text-text-muted" />
                        <span className="truncate">{d.contacts.email1}</span>
                      </div>
                    </div>
                  )}
                </div>

                {d.mapLocation ? (
                  <div className="mt-4">
                    <MapView
                      center={d.mapLocation}
                      zoom={11}
                      markers={[
                        {
                          id: d.id,
                          position: d.mapLocation,
                          label: d.id,
                          status: 'On transit',
                          subtitle: d.name,
                        },
                      ]}
                    />
                    <div className="mt-2 text-xs text-text-muted">Map preview</div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-lg border border-[#D1D5DB] bg-muted/40 p-3 text-xs text-text-muted">
                    No map location available.
                  </div>
                )}
              </CardBody>
            </Card>
            </div>
          ))
        )}
      </div>
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
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Region *</label>
          <input
            type="text"
            required
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">City *</label>
          <input
            type="text"
            required
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
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Contact Person 1</label>
          <input
            type="text"
            value={formData.person1}
            onChange={(e) => setFormData({ ...formData, person1: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Contact Person 2</label>
          <input
            type="text"
            value={formData.person2}
            onChange={(e) => setFormData({ ...formData, person2: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Phone 1</label>
          <input
            type="tel"
            value={formData.phone1}
            onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Phone 2</label>
          <input
            type="tel"
            value={formData.phone2}
            onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Email 1</label>
          <input
            type="email"
            value={formData.email1}
            onChange={(e) => setFormData({ ...formData, email1: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Email 2</label>
          <input
            type="email"
            value={formData.email2}
            onChange={(e) => setFormData({ ...formData, email2: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Latitude (optional)</label>
          <input
            type="number"
            step="any"
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
          Create Depot
        </button>
      </div>
    </form>
  )
}

