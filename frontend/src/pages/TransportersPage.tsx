import { useEffect, useState } from 'react'
import { getTransporters } from '../data/mockApi'
import type { Transporter, Vehicle } from '../data/types'
import PageHeader from '../components/layout/PageHeader'
import { useAuth } from '../context/AuthContext'
import { ModalOverlay } from '../components/ui/ModelOverlay'
import { PlusIcon } from '@heroicons/react/24/outline'

function TransporterCard({ t, onAddTruck, userRole }: { t: Transporter, onAddTruck: (tId: string) => void, userRole: string }) {
  const [search, setSearch] = useState('')

  const filteredVehicles = t.vehicles.filter(v => 
    v.plateRegNo.toLowerCase().includes(search.toLowerCase()) || 
    v.driverName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col rounded-xl border border-[#D1D5DB] bg-white shadow-card max-h-[600px]">
      <div className="border-b border-[#D1D5DB] p-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-text break-words">{t.name}</div>
            <div className="mt-1 text-xs text-text-muted">
              {t.location.city} • {t.location.region}
            </div>
          </div>
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-strong self-start sm:self-auto">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-semibold text-text-muted">Vehicle Fleet</div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search plate or driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 rounded-md border border-[#D1D5DB] bg-white px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-primary/40"
            />
            {userRole === 'OIL_COMPANY_ADMIN' && (
              <button
                type="button"
                onClick={() => onAddTruck(t.id)}
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition"
              >
                <PlusIcon className="size-3" />
                Add Truck
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0 bg-slate-50/30 rounded-b-xl">
        <table className="min-w-[500px] w-full text-left text-sm relative">
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

function NewTransporterForm({ onClose, onSubmit, companyId }: { onClose: () => void; onSubmit: (t: Transporter) => void, companyId?: string }) {
  const [formData, setFormData] = useState({
    name: '', region: '', city: '', address: '', person1: '', person2: '', phone1: '', phone2: '', email1: '', email2: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newTransporter: Transporter = {
      id: `TR-${Date.now()}`,
      name: formData.name,
      location: { region: formData.region, city: formData.city, address: formData.address },
      contacts: {
        person1: formData.person1 || undefined,
        person2: formData.person2 || undefined,
        phone1: formData.phone1 || undefined,
        phone2: formData.phone2 || undefined,
        email1: formData.email1 || undefined,
        email2: formData.email2 || undefined,
      },
      vehicles: [],
      oilCompanyId: companyId
    }
    onSubmit(newTransporter)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
         {/* Simplified form for brevity */}
         <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-text mb-1">Name *</label>
          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Region *</label>
          <input required type="text" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">City *</label>
          <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-text mb-1">Address</label>
          <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Contact Person 1</label>
          <input type="text" value={formData.person1} onChange={e => setFormData({...formData, person1: e.target.value})} className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Contact Person 2</label>
          <input type="text" value={formData.person2} onChange={e => setFormData({...formData, person2: e.target.value})} className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Phone 1</label>
          <input type="tel" value={formData.phone1} onChange={e => setFormData({...formData, phone1: e.target.value})} className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Phone 2</label>
          <input type="tel" value={formData.phone2} onChange={e => setFormData({...formData, phone2: e.target.value})} className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Email 1</label>
          <input type="email" value={formData.email1} onChange={e => setFormData({...formData, email1: e.target.value})} className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Email 2</label>
          <input type="email" value={formData.email2} onChange={e => setFormData({...formData, email2: e.target.value})} className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-semibold">Cancel</button>
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Create</button>
      </div>
    </form>
  )
}

function NewTruckForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (v: Vehicle) => void }) {
  const [formData, setFormData] = useState({
    plateRegNo: '', trailerRegNo: '', manufacturer: '', model: '', yearOfManufacture: new Date().getFullYear(), sideNo: '', driverName: '', driverPhone: ''
  })

  // Optionally include an upload CSV mock here
  const handleUploadCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
       alert('CSV Upload Mocked: Would parse CSV and populate trucks here.');
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      id: `VEH-${Date.now()}`,
      ...formData
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-dashed border-[#D1D5DB] mb-4">
         <span className="text-sm font-medium text-text-muted">Bulk upload via CSV?</span>
         <input type="file" accept=".csv" onChange={handleUploadCsv} className="text-xs text-text-muted file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Plate Reg No *</label>
          <input required type="text" value={formData.plateRegNo} onChange={e => setFormData({...formData, plateRegNo: e.target.value})} className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Driver Name *</label>
          <input required type="text" value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Trailer Reg No</label>
          <input type="text" value={formData.trailerRegNo} onChange={e => setFormData({...formData, trailerRegNo: e.target.value})} className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Side No</label>
          <input type="text" value={formData.sideNo} onChange={e => setFormData({...formData, sideNo: e.target.value})} className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-semibold">Cancel</button>
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Add Truck</button>
      </div>
    </form>
  )
}

export default function TransportersPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<Transporter[]>([])
  const [showTransporterForm, setShowTransporterForm] = useState(false)
  const [showTruckFormForTransporter, setShowTruckFormForTransporter] = useState<string | null>(null)

  useEffect(() => {
    void getTransporters(user?.companyId).then(setItems)
  }, [user?.companyId])

  const handleCreateTransporter = (t: Transporter) => {
    setItems((prev) => [...prev, t])
    setShowTransporterForm(false)
    setShowTruckFormForTransporter(t.id)
  }

  const handleAddTruck = (v: Vehicle) => {
    if (showTruckFormForTransporter) {
      setItems((prev) => prev.map(t => {
        if (t.id === showTruckFormForTransporter) {
          return { ...t, vehicles: [...t.vehicles, v] }
        }
        return t;
      }))
    }
    setShowTruckFormForTransporter(null)
  }

  return (
    <div className="min-h-full flex flex-col">
      <PageHeader
        title="Transporters"
        subtitle="Transporters and their fleet details."
        right={
          user?.role === 'OIL_COMPANY_ADMIN' && (
            <button
              onClick={() => setShowTransporterForm(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-strong"
            >
              <PlusIcon className="size-4" />
              New Transporter
            </button>
          )
        }
      />
      
      <ModalOverlay isOpen={showTransporterForm} onClose={() => setShowTransporterForm(false)} title="Add Transporter">
         <NewTransporterForm companyId={user?.companyId} onClose={() => setShowTransporterForm(false)} onSubmit={handleCreateTransporter} />
      </ModalOverlay>

      <ModalOverlay isOpen={!!showTruckFormForTransporter} onClose={() => setShowTruckFormForTransporter(null)} title="Add Truck">
         <NewTruckForm onClose={() => setShowTruckFormForTransporter(null)} onSubmit={handleAddTruck} />
      </ModalOverlay>

      <div className="grid gap-6 lg:grid-cols-2 mt-2">
        {items.map((t) => (
          <TransporterCard key={t.id} t={t} onAddTruck={setShowTruckFormForTransporter} userRole={user?.role || 'EPA_ADMIN'} />
        ))}
      </div>
    </div>
  )
}

