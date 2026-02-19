import { useEffect, useState } from 'react'
import { getTransporters } from '../data/mockApi'
import type { Transporter } from '../data/types'
import PageHeader from '../components/layout/PageHeader'

export default function TransportersPage() {
  const [items, setItems] = useState<Transporter[]>([])

  useEffect(() => {
    void getTransporters().then(setItems)
  }, [])

  return (
    <div>
      <PageHeader
        title="Transporters"
        subtitle="Transporters and their fleet details (read-only mock)."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((t) => (
          <div key={t.id} className="rounded-xl border border-border bg-surface shadow-soft">
            <div className="border-b border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-text">{t.name}</div>
                  <div className="mt-1 text-xs text-text-muted">
                    {t.location.city} • {t.location.region}
                  </div>
                </div>
                <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-strong">
                  {t.vehicles.length} vehicles
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  t.contacts.person1,
                  t.contacts.person2,
                  t.contacts.phone1,
                  t.contacts.email1,
                ]
                  .filter(Boolean)
                  .map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-text-muted"
                    >
                      {c}
                    </span>
                  ))}
              </div>
            </div>

            <div className="p-4">
              <div className="text-xs font-semibold text-text-muted">Vehicle details</div>
              <div className="mt-3 overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-xs text-text-muted">
                    <tr>
                      {['Plate', 'Trailer', 'Side', 'Driver'].map((h) => (
                        <th key={h} className="whitespace-nowrap px-3 py-2 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {t.vehicles.map((v) => (
                      <tr key={v.id} className="hover:bg-muted/40">
                        <td className="whitespace-nowrap px-3 py-2 text-text">{v.plateRegNo}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-text">{v.trailerRegNo}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-text">{v.sideNo}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-text">{v.driverName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

