import { useEffect, useState } from 'react'
import { getTransporters } from '../data/mockApi'
import type { Transporter } from '../data/types'
import PageHeader from '../components/layout/PageHeader'

function TransporterCard({ t }: { t: Transporter }) {
  const [search, setSearch] = useState('')

  const filteredVehicles = t.vehicles.filter(v => 
    v.plateRegNo.toLowerCase().includes(search.toLowerCase()) || 
    v.driverName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col rounded-xl border border-[#D1D5DB] bg-white shadow-card max-h-[600px]">
      <div className="border-b border-[#D1D5DB] p-4 shrink-0">
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

      <div className="p-4 shrink-0 border-b border-[#D1D5DB]">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-semibold text-text-muted">Vehicle Fleet</div>
          <input
            type="text"
            placeholder="Search plate or driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 rounded-md border border-[#D1D5DB] bg-white px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/30 rounded-b-xl">
        <table className="w-full text-left text-sm relative">
          <thead className="bg-muted text-xs text-text-muted sticky top-0 z-10 shadow-sm">
            <tr>
              {['Plate', 'Trailer', 'Side', 'Driver'].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold border-b border-[#D1D5DB]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D1D5DB]">
            {filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-muted text-xs">
                  No vehicles found matching your search.
                </td>
              </tr>
            ) : (
              filteredVehicles.map((v) => (
                <tr key={v.id} className="hover:bg-white transition-colors">
                  <td className="whitespace-nowrap px-4 py-2.5 text-text font-medium">{v.plateRegNo}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-text">{v.trailerRegNo}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-text">{v.sideNo}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-text">{v.driverName}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function TransportersPage() {
  const [items, setItems] = useState<Transporter[]>([])

  useEffect(() => {
    void getTransporters().then(setItems)
  }, [])

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Transporters"
        subtitle="Transporters and their fleet details (read-only mock)."
      />
      <div className="grid gap-6 lg:grid-cols-2 mt-2">
        {items.map((t) => (
          <TransporterCard key={t.id} t={t} />
        ))}
      </div>
    </div>
  )
}

