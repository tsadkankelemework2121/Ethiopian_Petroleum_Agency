import { useMemo, useState } from 'react'
import { fetchGpsVehicles } from '../data/gpsApi'
import type { Transporter, Vehicle } from '../data/types'
import PageHeader from '../components/layout/PageHeader'
import { useAuth } from '../context/AuthContext'
import { ModalOverlay } from '../components/ui/ModelOverlay'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'

// Child components
import TransporterCard from '../components/transporters/TransporterCard'
import TransporterSkeleton from '../components/transporters/TransporterSkeleton'
import NewTransporterForm from '../components/transporters/NewTransporterForm'
import NewTruckForm from '../components/transporters/NewTruckForm'

export default function TransportersPage() {
  const { user } = useAuth()
  const [showTransporterForm, setShowTransporterForm] = useState(false)
  const [showTruckFormForTransporter, setShowTruckFormForTransporter] = useState<string | null>(null)

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['gps-vehicles'],
    queryFn: fetchGpsVehicles,
  })

  // Local state for newly created transporters/trucks (simulating persistence for this session)
  const [localItems, setLocalItems] = useState<Transporter[]>([])

  const items = useMemo(() => {
    const transportersMap = new Map<string, Transporter>()

    // Start with API data
    vehicles.forEach((v) => {
      const transName = typeof v.custom_fields === 'string' ? v.custom_fields : ''
      if (!transName) return

      let transporter = transportersMap.get(transName)
      if (!transporter) {
        transporter = {
          id: `TR-${transName}`,
          name: transName,
          location: { region: '—', city: '—', address: '—' },
          contacts: {},
          vehicles: [],
          oilCompanyId: v.group || undefined,
        }
        transportersMap.set(transName, transporter)
      }

      transporter.vehicles.push({
        id: v.imei,
        plateRegNo: v.name,
        trailerRegNo: '—',
        sideNo: '—',
        driverName: '—',
        manufacturer: '—',
        model: '—',
        yearOfManufacture: new Date().getFullYear(),
        driverPhone: '—',
      })
    })

    // Merge with localItems
    const combined = Array.from(transportersMap.values())
    localItems.forEach((li) => {
      const existing = combined.find((c) => c.id === li.id)
      if (existing) {
        // Merge vehicles if needed, or just replace
        existing.vehicles = [...existing.vehicles, ...li.vehicles]
      } else {
        combined.push(li)
      }
    })

    return combined
  }, [vehicles, localItems])

  const handleCreateTransporter = (t: Transporter) => {
    setLocalItems((prev) => [...prev, t])
    setShowTransporterForm(false)
    setShowTruckFormForTransporter(t.id)
  }

  const handleAddTruck = (v: Vehicle) => {
    if (showTruckFormForTransporter) {
      setLocalItems((prev) =>
        prev.map((t) => {
          if (t.id === showTruckFormForTransporter) {
            return { ...t, vehicles: [...t.vehicles, v] }
          }
          return t
        })
      )
      setShowTruckFormForTransporter(null)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Transporters & Trucks"
        subtitle="Manage transporter fleets, trucks registry, and driver details."
        right={
          user?.role === 'OIL_COMPANY_ADMIN' && (
            <button
              onClick={() => setShowTransporterForm(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-primary-strong transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <PlusIcon className="size-5" />
              New Transporter
            </button>
          )
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <TransporterSkeleton key={i} />
            ))}
          </>
        ) : (
          items.map((t) => (
            <TransporterCard
              key={t.id}
              t={t}
              onAddTruck={(tId) => setShowTruckFormForTransporter(tId)}
              userRole={user?.role || ''}
            />
          ))
        )}
      </div>

      {showTransporterForm && (
        <ModalOverlay
          isOpen={showTransporterForm}
          onClose={() => setShowTransporterForm(false)}
          title="New Transporter Fleet"
        >
          <NewTransporterForm
            onClose={() => setShowTransporterForm(false)}
            onSubmit={handleCreateTransporter}
            companyId={user?.companyId}
          />
        </ModalOverlay>
      )}

      {showTruckFormForTransporter && (
        <ModalOverlay
          isOpen={!!showTruckFormForTransporter}
          onClose={() => setShowTruckFormForTransporter(null)}
          title="Add Truck Registration"
        >
          <NewTruckForm onClose={() => setShowTruckFormForTransporter(null)} onSubmit={handleAddTruck} />
        </ModalOverlay>
      )}
    </div>
  )
}
