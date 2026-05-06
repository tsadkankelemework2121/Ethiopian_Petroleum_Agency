import { fetchGpsVehicles } from '../data/gpsApi'
import { useMemo, useState } from 'react'
import { Skeleton } from '../components/ui/Skeleton'
import PageHeader from '../components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import type { OilCompany } from '../data/types'
import { ModalOverlay } from '../components/ui/ModelOverlay'

export default function OilCompaniesPage() {
  const [showForm, setShowForm] = useState(false)
  const [expandedMobileRow, setExpandedMobileRow] = useState<string | null>(null)

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['gps-vehicles'],
    queryFn: fetchGpsVehicles,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  })

  // Local state for persistence in current session
  const [localCompanies, setLocalCompanies] = useState<OilCompany[]>([])

  const companies = useMemo(() => {
    const groups = Array.from(new Set(vehicles.map((v) => v.group).filter(Boolean))) as string[];
    const apiCompanies: OilCompany[] = groups.map((group) => ({
      id: `OC-${group}`,
      name: group,
      contacts: {
        person1: undefined,
        person2: undefined,
        phone1: undefined,
        phone2: undefined,
        email1: undefined,
        email2: undefined,
      },
    }));

    // Merge with localCompanies
    const combined = [...apiCompanies]
    localCompanies.forEach(lc => {
      if (!combined.find(c => c.id === lc.id)) {
        combined.push(lc)
      }
    })
    return combined
  }, [vehicles, localCompanies])
  return (
    <div>
      <PageHeader
        title="Oil Companies"
        subtitle="List of oil companies and their contact information."
      />

      <ModalOverlay
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Add New Oil Company"
      >
        <NewOilCompanyForm
          onClose={() => setShowForm(false)}
          onSubmit={(newCompany) => {
            setLocalCompanies([...localCompanies, newCompany])
            setShowForm(false)
          }}
        />
      </ModalOverlay>

      {isLoading ? (
        <>
          {/* Desktop Skeleton */}
          <div className="hidden md:block rounded-xl border border-[#D1D5DB] bg-white">
            <table className="min-w-225 w-full text-left text-sm">
              <thead className="bg-muted text-xs text-text-muted border-b border-[#D1D5DB]">
                <tr>
                  {['Company', 'Contact person 1', 'Contact person 2', 'Phone 1', 'Phone 2', 'Email 1', 'Email 2'].map(
                    (h) => (
                      <th key={h} className="whitespace-nowrap px-3 py-3 font-semibold uppercase tracking-wider">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D1D5DB]">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-3 py-4 text-left">
                        <Skeleton className="h-4 w-full max-w-[120px]" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile Skeleton */}
          <div className="md:hidden space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-[#D1D5DB] bg-white p-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28 mt-2" />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-xl border border-[#D1D5DB] bg-white">
            <table className="min-w-225 w-full text-left text-sm">
              <thead className="bg-muted text-xs text-text-muted border-b border-[#D1D5DB]">
                <tr>
                  {['Company', 'Contact person 1', 'Contact person 2', 'Phone 1', 'Phone 2', 'Email 1', 'Email 2'].map(
                    (h) => (
                      <th key={h} className="whitespace-nowrap px-3 py-3 font-semibold">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D1D5DB]">
                {companies.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/40">
                    <td className="whitespace-nowrap px-3 py-3 text-text font-medium">{c.name}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-text">{c.contacts.person1 ?? '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-text">{c.contacts.person2 ?? '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-text">{c.contacts.phone1 ?? '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-text">{c.contacts.phone2 ?? '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-text">{c.contacts.email1 ?? '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-text">{c.contacts.email2 ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {companies.map((c) => (
              <div
                key={c.id}
                onClick={() => setExpandedMobileRow(expandedMobileRow === c.id ? null : c.id)}
                className="rounded-xl border border-[#D1D5DB] bg-white p-4 cursor-pointer active:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-sm text-text truncate">{c.name}</div>
                  <svg className={`size-5 text-text-muted shrink-0 transition-transform duration-200 ${expandedMobileRow === c.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {expandedMobileRow === c.id && (
                  <div className="mt-3 pt-3 border-t border-[#D1D5DB] grid grid-cols-2 gap-3 text-sm animate-fade-in-up">
                    <div>
                      <div className="text-[11px] text-text-muted font-medium">Contact Person 1</div>
                      <div className="font-medium text-text mt-0.5">{c.contacts.person1 ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted font-medium">Contact Person 2</div>
                      <div className="font-medium text-text mt-0.5">{c.contacts.person2 ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted font-medium">Phone 1</div>
                      <div className="font-medium text-text mt-0.5">{c.contacts.phone1 ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted font-medium">Phone 2</div>
                      <div className="font-medium text-text mt-0.5">{c.contacts.phone2 ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted font-medium">Email 1</div>
                      <div className="font-medium text-text mt-0.5 break-all">{c.contacts.email1 ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted font-medium">Email 2</div>
                      <div className="font-medium text-text mt-0.5 break-all">{c.contacts.email2 ?? '—'}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function NewOilCompanyForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (company: OilCompany) => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    person1: '',
    person2: '',
    phone1: '',
    phone2: '',
    email1: '',
    email2: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newCompany: OilCompany = {
      id: `OC-${Date.now()}`,
      name: formData.name,
      contacts: {
        person1: formData.person1 || undefined,
        person2: formData.person2 || undefined,
        phone1: formData.phone1 || undefined,
        phone2: formData.phone2 || undefined,
        email1: formData.email1 || undefined,
        email2: formData.email2 || undefined,
      },
    }
    onSubmit(newCompany)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-text mb-1">Company Name *</label>
          <input
            type="text"
            required
            placeholder="Enter company name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            placeholder="e.g. +251 911 234 567"
            value={formData.phone1}
            onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Phone 2</label>
          <input
            type="tel"
            placeholder="e.g. +251 911 234 568"
            value={formData.phone2}
            onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Email 1</label>
          <input
            type="email"
            placeholder="e.g. contact@company.com"
            value={formData.email1}
            onChange={(e) => setFormData({ ...formData, email1: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Email 2</label>
          <input
            type="email"
            placeholder="e.g. alt@company.com"
            value={formData.email2}
            onChange={(e) => setFormData({ ...formData, email2: e.target.value })}
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
          Create Oil Company
        </button>
      </div>
    </form>
  )
}

