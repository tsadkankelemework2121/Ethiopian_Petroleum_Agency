import { useEffect, useState } from 'react'
import { getOilCompanies } from '../data/mockApi'
import type { OilCompany } from '../data/types'
import PageHeader from '../components/layout/PageHeader'

export default function OilCompaniesPage() {
  const [companies, setCompanies] = useState<OilCompany[]>([])

  useEffect(() => {
    void getOilCompanies().then(setCompanies)
  }, [])

  return (
    <div>
      <PageHeader
        title="Oil Companies"
        subtitle="Registered oil companies and contacts (read-only mock)."
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs text-text-muted">
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
          <tbody className="divide-y divide-border">
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

