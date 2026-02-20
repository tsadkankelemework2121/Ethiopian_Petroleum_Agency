import type { ComponentType, SVGProps } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  AdjustmentsHorizontalIcon,
  BellIcon,
  BuildingOffice2Icon,
  ChartBarSquareIcon,
  ClipboardDocumentListIcon,
  MapIcon,
  Squares2X2Icon,
  TruckIcon,
} from '@heroicons/react/24/outline'
import { getDashboardKpis } from '../../data/mockApi'
import { cn } from '../../lib/cn'

type NavItem = {
  to: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  end?: boolean
}

const primaryNav: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: Squares2X2Icon, end: true },
  { to: '/tracking', label: 'GPS Tracking', icon: MapIcon },
  { to: '/fuel-dispatch', label: 'Fuel Dispatch', icon: ClipboardDocumentListIcon },
  { to: '/reports', label: 'Reports', icon: ChartBarSquareIcon },
]

const entitiesNav: NavItem[] = [
  { to: '/entities/oil-companies', label: 'Oil Companies', icon: BuildingOffice2Icon },
  { to: '/entities/transporters', label: 'Transporters', icon: TruckIcon },
  { to: '/entities/depots', label: 'Depots', icon: MapIcon },
]

const footerNav: NavItem[] = [{ to: '/settings', label: 'Settings', icon: AdjustmentsHorizontalIcon }]

function NavItemLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition',
          'text-gray-600 hover:bg-[#27A2D8]/10 hover:text-gray-900',
          isActive && 'bg-[#27A2D8]/15 text-[#27A2D8] ring-1 ring-[#27A2D8]/30',
        )
      }
    >
      <Icon className="size-5 shrink-0" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  )
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="grid size-10 place-items-center overflow-hidden rounded-xl bg-[#27A2D8]/10 ring-1 ring-[#27A2D8]/20">
          <img
            src="/logo-placeholder.png"
            alt="Company logo"
            className="size-10 object-cover"
          />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-gray-900">EPA GPS & Fuel Tracking</div>
          <div className="truncate text-xs text-gray-500">Transport monitoring</div>
        </div>
      </div>

      <div className="px-3">
        <div className="space-y-1">
          {primaryNav.map((item) => (
            <NavItemLink key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </div>

        <div className="mt-6">
          <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Entities
          </div>
          <div className="space-y-1">
            {entitiesNav.map((item) => (
              <NavItemLink key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto px-3 pb-4 pt-6">
        <div className="space-y-1">
          {footerNav.map((item) => (
            <NavItemLink key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </div>
  )
}

function routeTitle(pathname: string) {
  if (pathname === '/') return 'Dashboard'
  if (pathname.startsWith('/tracking')) return 'GPS Tracking'
  if (pathname.startsWith('/fuel-dispatch')) return 'Fuel Dispatch & Transit'
  if (pathname.startsWith('/reports')) return 'Reports'
  if (pathname.startsWith('/entities/oil-companies')) return 'Oil Companies'
  if (pathname.startsWith('/entities/transporters')) return 'Transporters'
  if (pathname.startsWith('/entities/depots')) return 'Depots'
  if (pathname.startsWith('/settings')) return 'Settings'
  return 'EPA Dashboard'
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const [alertsCount, setAlertsCount] = useState(0)

  const title = useMemo(() => routeTitle(location.pathname), [location.pathname])

  useEffect(() => {
    void getDashboardKpis().then((kpis) => {
      const total = kpis.exceededEta + kpis.gpsOfflineOver24h + kpis.stoppedOver5h
      setAlertsCount(total)
    })
  }, [])

  return (
    <div className="h-full bg-white">
      <div className="flex h-full">
        {/* Desktop sidebar */}
        <aside className="hidden w-[280px] shrink-0 border-r border-gray-200 bg-white md:block">
          <Sidebar />
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileOpen ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-gray-900/50"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            />
            <aside className="absolute left-0 top-0 h-full w-[280px] border-r border-gray-200 bg-white">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        ) : null}

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 md:hidden"
                  onClick={() => setMobileOpen(true)}
                >
                  Menu
                </button>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{title}</div>
                  <div className="text-xs text-gray-500">Ethiopian Petroleum Agency</div>
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-3">
                <div className="hidden md:block">
                  <input
                    className="w-[340px] rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#27A2D8]/30"
                    placeholder="Search dispatch, vehicle, transporter…"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/fuel-dispatch')}
                    className="relative inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-2 text-gray-700 hover:bg-gray-50"
                    aria-label={`${alertsCount} alerts`}
                  >
                    <BellIcon className="size-5" />
                    {alertsCount > 0 ? (
                      <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {alertsCount > 99 ? '99+' : alertsCount}
                      </span>
                    ) : null}
                  </button>
                  <div className="hidden sm:block text-right">
                    <div className="text-xs font-semibold text-gray-900">PEA Admin</div>
                    <div className="text-xs text-gray-500">Regulator view</div>
                  </div>
                  <div className="grid size-10 place-items-center rounded-full bg-[#27A2D8]/15 text-[#27A2D8] ring-1 ring-[#27A2D8]/30">
                    <span className="text-xs font-bold">PA</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 bg-white p-4 sm:p-6">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}