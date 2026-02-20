import { useEffect, useState } from 'react'
import { getDepots } from '../data/mockApi'
import type { Depot } from '../data/types'
import PageHeader from '../components/layout/PageHeader'
import MapView from '../components/map/MapView'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function DepotsPage() {
  const [items, setItems] = useState<Depot[]>([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    void getDepots().then(setItems)
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
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-primary-strong"
          >
            <PlusIcon className="size-4" />
            New Depot
          </button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <CardHeader title="Add New Depot" />
          <CardBody>
            <NewDepotForm
              onClose={() => setShowForm(false)}
              onSubmit={(newDepot) => {
                setItems([...items, newDepot])
                setShowForm(false)
              }}
            />
          </CardBody>
        </Card>
      )}
      <div className="grid gap-4 lg:grid-cols-3">
        {items.map((d) => (
          <div key={d.id} className="overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
            <div className="border-b border-border bg-muted/40 p-4">
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

            <div className="p-4">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">Address</div>
              <div className="mt-1 text-sm text-text">{d.location.address}</div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">Contact Person</div>
                  <div className="mt-1 text-sm font-medium text-text">{d.contacts.person1 ?? '—'}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">Primary Contact</div>
                  <div className="mt-1 text-sm text-text flex items-center gap-2">
                    <span>📞</span>
                    {d.contacts.phone1 ?? '—'}
                  </div>
                </div>
                {d.contacts.phone2 && (
                  <div>
                    <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">Secondary Contact</div>
                    <div className="mt-1 text-sm text-text flex items-center gap-2">
                      <span>📞</span>
                      {d.contacts.phone2}
                    </div>
                  </div>
                )}
                {d.contacts.email1 && (
                  <div>
                    <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">Email</div>
                    <div className="mt-1 text-sm text-text flex items-center gap-2">
                      <span>✉️</span>
                      <span className="truncate">{d.contacts.email1}</span>
                    </div>
                  </div>
                )}
              </div>

              {d.mapLocation ? (
                <div className="mt-4">
                  <MapView
                    compact
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
                  <div className="mt-2 text-xs text-text-muted">
                    Map preview (abstract). Later this will render with the real map provider + coordinates from backend.
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-xs text-text-muted">
                  No map location in mock data.
                </div>
              )}
            </div>
          </div>
        ))}
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
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Region *</label>
          <input
            type="text"
            required
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">City *</label>
          <input
            type="text"
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-text mb-1">Address *</label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Contact Person 1</label>
          <input
            type="text"
            value={formData.person1}
            onChange={(e) => setFormData({ ...formData, person1: e.target.value })}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Contact Person 2</label>
          <input
            type="text"
            value={formData.person2}
            onChange={(e) => setFormData({ ...formData, person2: e.target.value })}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Phone 1</label>
          <input
            type="tel"
            value={formData.phone1}
            onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Phone 2</label>
          <input
            type="tel"
            value={formData.phone2}
            onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Email 1</label>
          <input
            type="email"
            value={formData.email1}
            onChange={(e) => setFormData({ ...formData, email1: e.target.value })}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Email 2</label>
          <input
            type="email"
            value={formData.email2}
            onChange={(e) => setFormData({ ...formData, email2: e.target.value })}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Latitude (optional)</label>
          <input
            type="number"
            step="any"
            value={formData.lat}
            onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Longitude (optional)</label>
          <input
            type="number"
            step="any"
            value={formData.lng}
            onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text hover:bg-muted/60"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-primary-strong"
        >
          Create Depot
        </button>
      </div>
    </form>
  )
}

