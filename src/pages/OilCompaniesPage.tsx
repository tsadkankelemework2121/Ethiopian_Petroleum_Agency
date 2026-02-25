import { useState } from 'react'
import type { OilCompany } from '../data/types'
import PageHeader from '../components/layout/PageHeader'
import { ModalOverlay } from '../components/ui/ModelOverlay'
import { PlusIcon } from '@heroicons/react/24/outline'
import { getOilCompanies } from '../data/mockApi'
import { useEffect } from 'react'

export default function OilCompaniesPage() {
  const [companies, setCompanies] = useState<OilCompany[]>([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    void getOilCompanies().then(setCompanies)
  }, [])

  return (
    <div>
      <PageHeader
        title="Oil Companies"
        subtitle="Registered oil companies and contacts."
        right={
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#27A2D8] px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-[#1d7fb0] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27A2D8]/40"
          >
            <PlusIcon className="size-4" />
            New Oil Company
          </button>
        }
      />

      <ModalOverlay
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Add New Oil Company"
      >
        <NewOilCompanyForm
          onClose={() => setShowForm(false)}
          onSubmit={(newCompany) => {
            setCompanies([...companies, newCompany])
            setShowForm(false)
          }}
        />
      </ModalOverlay>
      <div className="overflow-x-auto rounded-xl border border-[#D1D5DB] bg-white">
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
                <td className="whitespace-nowrap px-3 py-3 text-text">{c.name}</td>
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
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          className="rounded-lg bg-[#27A2D8] px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-primary-strong transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Create Oil Company
        </button>
      </div>
    </form>
  )
}

