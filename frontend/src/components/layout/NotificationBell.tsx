import { useState, useEffect, useRef, useMemo } from 'react'
import { BellIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import type { Depot, DispatchTask } from '../../data/types'
import { mapDepot } from '../../data/types'

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // 1. Fetch Dispatches
  const { data: dispatches = [] } = useQuery<DispatchTask[]>({
    queryKey: ['dispatches'],
    queryFn: () =>
      api.get('/dispatches').then((res) =>
        res.data.map((d: any) => ({
          peaDispatchNo: d.pea_dispatch_no,
          oilCompanyId: d.oil_company_id,
          transporterId: d.transporter_id,
          vehicleId: d.vehicle_id,
          dispatchDateTime: d.dispatch_datetime ? d.dispatch_datetime.split(' ')[0].split('T')[0] : '',
          dispatchLocation: d.dispatch_location,
          destinationDepotId: d.destination_depot_id?.toString() || '',
          etaDateTime: d.eta_datetime ? d.eta_datetime.split(' ')[0].split('T')[0] : '',
          dropOffDateTime: d.drop_off_datetime ? d.drop_off_datetime.split(' ')[0].split('T')[0] : '',
          fuelType: d.fuel_type,
          dispatchedLiters: Number(d.dispatched_liters || 0),
          status: d.status,
          confirmation: d.confirmation || null,
        }))
      ),
    refetchInterval: 60 * 1000, // Refetch every minute
  })

  // 2. Fetch Destinations
  const { data: destinations = [] } = useQuery<Depot[]>({
    queryKey: ['depots'],
    queryFn: () => api.get('/depots').then((res) => res.data.map(mapDepot)),
  })

  const destinationsById = useMemo(() => {
    const map = new Map<string, Depot>()
    destinations.forEach((d) => map.set(d.id.toString(), d))
    return map
  }, [destinations])

  // Filter for ETA exceeded dispatches
  const exceededTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    return dispatches.filter((d) => {
      if (d.status === 'Delivered') return false
      if (!d.etaDateTime) return false
      const etaDateStr = d.etaDateTime.split('T')[0].split(' ')[0]
      return etaDateStr < todayStr
    })
  }, [dispatches])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = (vehicleId: string) => {
    setIsOpen(false)
    navigate(`/tracking?vehicle=${encodeURIComponent(vehicleId)}`)
  }

  const getOverdueDays = (etaDateTime: string) => {
    const etaDateStr = etaDateTime.split('T')[0].split(' ')[0]
    const etaDate = new Date(etaDateStr)
    const today = new Date(new Date().toISOString().split('T')[0])
    const diffTime = today.getTime() - etaDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 0 ? 0 : diffDays
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-600 hover:text-slate-900 cursor-pointer"
        title="Notifications"
      >
        <BellIcon className="size-5.5" />
        {exceededTasks.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
            {exceededTasks.length}
          </span>
        )}
      </button>

      {/* Dropdown Modal/Menu hung to notification button */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-88 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-[100] animate-fade-in-up">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <span className="text-sm font-bold text-slate-800">Alert Center</span>
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-600">
              {exceededTasks.length} Overdue
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2">
            {exceededTasks.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-500 font-medium">All active dispatches are on track.</p>
                <p className="text-[11px] text-slate-400 mt-1">No exceeded ETA alerts.</p>
              </div>
            ) : (
              exceededTasks.map((task) => {
                const overdueDays = getOverdueDays(task.etaDateTime)
                const destName = destinationsById.get(task.destinationDepotId)?.name || 'Unknown Destination'

                return (
                  <div
                    key={task.peaDispatchNo}
                    className="group flex flex-col justify-between p-3 rounded-xl border border-slate-100 hover:border-red-100 hover:bg-red-50/20 transition-all text-left"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800">{task.peaDispatchNo}</span>
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">
                          Overdue {overdueDays}d
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Destination:</span> {destName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        <span className="font-semibold">Vehicle Plate:</span> {task.vehicleId}
                      </div>
                    </div>
                    <div className="mt-2.5 flex justify-end">
                      <button
                        onClick={() => handleNotificationClick(task.vehicleId)}
                        className="inline-flex items-center text-[10px] font-bold text-[#1c8547] hover:text-[#145d31] transition hover:underline"
                      >
                        Track Vehicle →
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Add custom fade in animation styles if not defined globally */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
