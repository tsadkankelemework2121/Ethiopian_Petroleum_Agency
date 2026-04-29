import { useState } from 'react'
import api from '../api/axios'
import type { Depot } from '../data/types'
import PageHeader from '../components/layout/PageHeader'
import { ModalOverlay } from '../components/ui/ModelOverlay'
import { EnvelopeIcon, MapPinIcon, PhoneIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import EmptyState from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { useAuth } from '../context/AuthContext'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export default function DepotsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingDepot, setEditingDepot] = useState<any | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const canManage = user?.role === 'OIL_COMPANY_ADMIN' || user?.role?.toUpperCase() === 'OIL_COMPANY' || user?.role === 'EPA_ADMIN'

  const { data: items = [], isLoading } = useQuery<Depot[]>({
    queryKey: ['depots', user?.companyId],
    queryFn: async () => {
      const res = await api.get('/depots', { params: { oil_company_id: user?.companyId } });
      return res.data.map((d: any) => ({
        ...d,
        location: { region: d.region, city: d.city, address: d.address },
        contacts: {
          person1: d.person1, person2: d.person2,
          phone1: d.phone1, phone2: d.phone2,
          email1: d.email1, email2: d.email2
        },
        mapLocation: d.lat && d.lng ? { lat: Number(d.lat), lng: Number(d.lng) } : undefined,
        mapLink: d.map_link,
        hasDispatches: d.has_dispatches ?? false,
      }));
    },
    enabled: !!user?.companyId || user?.role === 'EPA_ADMIN',
    refetchInterval: 5 * 60 * 1000,
  })

  const openGoogleMaps = (depot: Depot) => {
    if (depot.mapLink) {
      window.open(depot.mapLink, '_blank')
    } else if (depot.mapLocation) {
      const { lat, lng } = depot.mapLocation
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')
    } else {
      const query = encodeURIComponent(`${depot.location.address}, ${depot.location.city}, ${depot.location.region}`)
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
    }
  }

  const handleDelete = async (depot: Depot) => {
    if (depot.hasDispatches) {
      alert('Cannot delete this depot — it has dispatches assigned to it.')
      return
    }
    if (!window.confirm(`Are you sure you want to delete "${depot.name}"? This action cannot be undone.`)) return
    setDeleting(depot.id)
    try {
      await api.delete(`/depots/${depot.id}`)
      queryClient.invalidateQueries({ queryKey: ['depots'] })
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to delete depot.'
      alert(msg)
    } finally {
      setDeleting(null)
    }
  }

  const handleEdit = (depot: any) => {
    setEditingDepot(depot)
    setShowForm(true)
  }

  const handleFormSubmit = async (payload: any) => {
    try {
      if (editingDepot) {
        await api.put(`/depots/${editingDepot.id}`, payload)
      } else {
        await api.post('/depots', payload)
      }
      setShowForm(false)
      setEditingDepot(null)
      queryClient.invalidateQueries({ queryKey: ['depots'] })
    } catch (err) {
      console.error(err)
      alert('Error saving depot. Please check your data.')
    }
  }

  return (
    <div>
      <PageHeader
        title="Depots"
        subtitle="Depots with contact details and map location."
        right={
          canManage && (
            <button
              type="button"
              onClick={() => { setEditingDepot(null); setShowForm(!showForm) }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-primary-strong transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <PlusIcon className="size-4" />
              New Depot
            </button>
          )
        }
      />

      <ModalOverlay
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingDepot(null) }}
        title={editingDepot ? `Edit Depot: ${editingDepot.name}` : "Add New Depot"}
      >
        <DepotForm
          companyId={user?.companyId}
          editingDepot={editingDepot}
          onClose={() => { setShowForm(false); setEditingDepot(null) }}
          onSubmit={handleFormSubmit}
        />
      </ModalOverlay>

      {isLoading ? (
        <div className="rounded-xl border border-[#D1D5DB] bg-white overflow-x-auto">
          <table className="min-w-[800px] w-full divide-y divide-[#D1D5DB]">
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
                  <td className="px-6 py-4"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24 mt-2" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-32 mt-2" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-8 w-20 rounded-lg" /></td>
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
            canManage ? (
              <button
                type="button"
                onClick={() => { setEditingDepot(null); setShowForm(true) }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-primary-strong transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <PlusIcon className="size-4" />
                Add your first depot
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-xl border border-[#D1D5DB] bg-white overflow-x-auto">
          <table className="min-w-[800px] w-full divide-y divide-[#D1D5DB]">
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
                        onClick={() => openGoogleMaps(depot)}
                        className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
                        title="Open in Google Maps"
                      >
                        <MapPinIcon className="size-4" />
                        <span>Map</span>
                      </button>
                      {canManage && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEdit(depot)}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition"
                            title="Edit Depot"
                          >
                            <PencilIcon className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(depot)}
                            disabled={!!depot.hasDispatches || deleting === depot.id}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            title={depot.hasDispatches ? "Cannot delete: has dispatches assigned" : "Delete Depot"}
                          >
                            {deleting === depot.id ? (
                              <div className="size-3.5 border-2 border-red-300 border-t-red-700 rounded-full animate-spin" />
                            ) : (
                              <TrashIcon className="size-3.5" />
                            )}
                          </button>
                        </>
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

function DepotForm({ onClose, onSubmit, companyId, editingDepot }: { 
  onClose: () => void; 
  onSubmit: (depot: any) => void; 
  companyId?: string;
  editingDepot?: any;
}) {
  const [formData, setFormData] = useState({
    name: editingDepot?.name || '',
    region: editingDepot?.location?.region || editingDepot?.region || '',
    city: editingDepot?.location?.city || editingDepot?.city || '',
    address: editingDepot?.location?.address || editingDepot?.address || '',
    person1: editingDepot?.contacts?.person1 || editingDepot?.person1 || '',
    person2: editingDepot?.contacts?.person2 || editingDepot?.person2 || '',
    phone1: editingDepot?.contacts?.phone1 || editingDepot?.phone1 || '',
    phone2: editingDepot?.contacts?.phone2 || editingDepot?.phone2 || '',
    email1: editingDepot?.contacts?.email1 || editingDepot?.email1 || '',
    email2: editingDepot?.contacts?.email2 || editingDepot?.email2 || '',
    lat: editingDepot?.mapLocation?.lat?.toString() || editingDepot?.lat?.toString() || '',
    lng: editingDepot?.mapLocation?.lng?.toString() || editingDepot?.lng?.toString() || '',
    password: '',
  })

  const [mapLink, setMapLink] = useState(editingDepot?.mapLink || editingDepot?.map_link || '')

  const handleMapLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setMapLink(val)
    
    // Parse Google Maps URLs
    const atMatch = val.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (atMatch) {
      setFormData(prev => ({ ...prev, lat: atMatch[1], lng: atMatch[2] }))
      return
    }
    const dMatch = val.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
    if (dMatch) {
      setFormData(prev => ({ ...prev, lat: dMatch[1], lng: dMatch[2] }))
      return
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload: any = {
      name: formData.name,
      region: formData.region,
      city: formData.city,
      address: formData.address,
      person1: formData.person1 || null,
      person2: formData.person2 || null,
      phone1: formData.phone1 || null,
      phone2: formData.phone2 || null,
      email1: formData.email1 || null,
      email2: formData.email2 || null,
      lat: formData.lat ? Number(formData.lat) : null,
      lng: formData.lng ? Number(formData.lng) : null,
      map_link: mapLink || null,
      oil_company_id: companyId,
    }
    if (formData.password) {
      payload.password = formData.password
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-text mb-1">Depot Name *</label>
          <input
            type="text"
            required
            placeholder="Enter depot name"
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
            placeholder="Enter region"
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
            placeholder="Enter city"
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
            placeholder="Enter full address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
            placeholder="e.g. contact@depot.com"
            value={formData.email1}
            onChange={(e) => setFormData({ ...formData, email1: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Email 2</label>
          <input
            type="email"
            placeholder="e.g. alt@depot.com"
            value={formData.email2}
            onChange={(e) => setFormData({ ...formData, email2: e.target.value })}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Password for depot login */}
        <div className="sm:col-span-2 pt-2 border-t border-[#D1D5DB] mt-2">
          <label className="block text-sm font-semibold text-text mb-1">
            Depot Login Password {editingDepot ? '(leave blank to keep current)' : ''}
          </label>
          <p className="text-xs text-text-muted mb-2">
            If Email 1 and password are provided, a login account will be created for this depot to confirm deliveries.
          </p>
          <input
            type="password"
            placeholder={editingDepot ? "Leave blank to keep current password" : "Set depot login password (min 6 chars)"}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            minLength={formData.password ? 6 : undefined}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="sm:col-span-2 pt-2 border-t border-[#D1D5DB] mt-2">
          <label className="block text-sm font-semibold text-text mb-1">Google Maps Link</label>
          <p className="text-xs text-text-muted mb-2">Paste a Google Maps link to auto-fill Latitude and Longitude.</p>
          <input
            type="url"
            value={mapLink}
            onChange={handleMapLinkChange}
            placeholder="e.g. https://www.google.com/maps/place/..."
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-1">Latitude (optional)</label>
          <input
            type="number"
            step="any"
            placeholder="e.g. 9.0320"
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
            placeholder="e.g. 38.7482"
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
          {editingDepot ? 'Update Depot' : 'Create Depot'}
        </button>
      </div>
    </form>
  )
}