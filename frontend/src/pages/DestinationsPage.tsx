import { useState } from 'react'
import api from '../api/axios'
import type { Depot as Destination } from '../data/types'
import { mapDepot as mapDestination } from '../data/types'
import PageHeader from '../components/layout/PageHeader'
import { ModalOverlay } from '../components/ui/ModelOverlay'
import { MapPinIcon, PlusIcon } from '@heroicons/react/24/outline'
import EmptyState from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { useAuth } from '../context/AuthContext'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Child components
import DestinationForm from '../components/destinations/DestinationForm'
import DestinationTable from '../components/destinations/DestinationTable'

export default function DestinationsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null)

  const canAdd = user?.role === 'OIL_COMPANY_ADMIN' || user?.role?.toUpperCase() === 'OIL_COMPANY'
  const canManage = canAdd || user?.role === 'EPA_ADMIN'

  const { data: items = [], isLoading } = useQuery<Destination[]>({
    queryKey: ['depots'],
    queryFn: async () => {
      const res = await api.get('/depots', { params: { oil_company_id: user?.companyId } })
      return res.data.map(mapDestination)
    },
    enabled: !!user?.companyId || user?.role === 'EPA_ADMIN',
  })

  const openGoogleMaps = (destination: Destination) => {
    if (destination.mapLink) {
      window.open(destination.mapLink, '_blank')
    } else if (destination.mapLocation) {
      const { lat, lng } = destination.mapLocation
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')
    } else {
      const query = encodeURIComponent(`${destination.location.address}, ${destination.location.city}, ${destination.location.region}`)
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
    }
  }

  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination)
    setShowForm(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = async (payload: any) => {
    try {
      if (editingDestination) {
        await api.post(`/depots/${editingDestination.id}`, { ...payload, _method: 'PUT' })
      } else {
        await api.post('/depots', payload)
      }
      setShowForm(false)
      setEditingDestination(null)
      queryClient.invalidateQueries({ queryKey: ['depots'] })
    } catch (err) {
      console.error(err)
      alert('Error saving destination. Please check your data.')
    }
  }

  return (
    <div>
      <PageHeader
        title="Destinations"
        subtitle="Destinations with contact details and map location."
        right={
          canAdd && (
            <button
              type="button"
              onClick={() => {
                setEditingDestination(null)
                setShowForm(!showForm)
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-primary-strong transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <PlusIcon className="size-4" />
              New Destination
            </button>
          )
        }
      />

      <ModalOverlay
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingDestination(null)
        }}
        title={editingDestination ? `Edit Destination: ${editingDestination.name}` : 'Add New Destination'}
      >
        <DestinationForm
          companyId={user?.companyId}
          editingDestination={editingDestination}
          onClose={() => {
            setShowForm(false)
            setEditingDestination(null)
          }}
          onSubmit={handleFormSubmit}
        />
      </ModalOverlay>

      {isLoading ? (
        <>
          <div className="hidden md:block rounded-xl border border-[#D1D5DB] bg-white">
            <table className="min-w-[800px] w-full divide-y divide-[#D1D5DB]">
              <thead className="bg-muted/50">
                <tr>
                  {['Destination', 'Location', 'Contact Person', 'Phone', 'Email', 'Actions'].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D1D5DB]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24 mt-2" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-32 mt-2" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-8 w-20 rounded-lg" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-[#D1D5DB] bg-white p-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32 mt-2" />
              </div>
            ))}
          </div>
        </>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<MapPinIcon className="size-8" />}
          title="No destinations yet"
          description="Add your first destination to get started with contact details and map locations."
          action={
            canAdd ? (
              <button
                type="button"
                onClick={() => {
                  setEditingDestination(null)
                  setShowForm(true)
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-primary-strong transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <PlusIcon className="size-4" />
                Add your first destination
              </button>
            ) : undefined
          }
        />
      ) : (
        <DestinationTable
          items={items}
          canManage={canManage}
          openGoogleMaps={openGoogleMaps}
          handleEdit={handleEdit}
        />
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
