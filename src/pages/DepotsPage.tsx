import { useEffect, useState } from 'react'
import { getDepots } from '../data/mockApi'
import type { Depot } from '../data/types'
import PageHeader from '../components/layout/PageHeader'
import MapView from '../components/map/MapView'

export default function DepotsPage() {
  const [items, setItems] = useState<Depot[]>([])

  useEffect(() => {
    void getDepots().then(setItems)
  }, [])

  return (
    <div>
      <PageHeader
        title="Depots"
        subtitle="Depots with contact details and map location (mock)."
      />
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
              <div className="text-xs font-semibold text-text-muted">Address</div>
              <div className="mt-1 text-sm text-text">{d.location.address}</div>

              <div className="mt-4 text-xs font-semibold text-text-muted">Contact person</div>
              <div className="mt-1 text-sm text-text">{d.contacts.person1 ?? '—'}</div>

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

