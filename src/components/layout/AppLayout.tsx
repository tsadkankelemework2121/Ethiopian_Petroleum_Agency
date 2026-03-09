import type { ComponentType, SVGProps } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
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

import profileImg from '../../assets/profile.jpg'

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

const footerNav: NavItem[] = [
  { to: '/settings', label: 'Settings', icon: AdjustmentsHorizontalIcon },
]

function NavItemLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 relative',
          'text-text-muted hover:bg-muted hover:text-text',
          isActive &&
            'font-semibold pl-2.5 bg-[#27A2D8]/10 text-[#27A2D8] border-l-4 border-[#27A2D8]',
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
    <div className="flex h-screen flex-col bg-white border-r border-[#D1D5DB] overflow-y-auto">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="grid size-10 place-items-center overflow-hidden rounded-lg bg-primary text-white font-semibold">
          <img
            src="/logo-placeholder.png"
            alt="Company logo"
            className="size-10 object-cover"
          />
        </div>

        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-text">EPA</div>
          <div className="truncate text-xs text-text-muted">Fuel Tracking</div>
        </div>
      </div>

      <div className="px-3 py-2 flex-1">
        <div className="space-y-1">
          {primaryNav.map((item) => (
            <NavItemLink key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <div className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Entities
          </div>

          <div className="space-y-1">
            {entitiesNav.map((item) => (
              <NavItemLink key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </div>

      <div className="px-3 pb-4 pt-6 border-t border-[#D1D5DB]">
        <div className="space-y-1 pt-3">
          {footerNav.map((item) => (
            <NavItemLink key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [alertsCount, setAlertsCount] = useState(0)

  const getPageTitle = (pathname: string): string => {
    if (pathname === '/' || pathname === '') return 'Dashboard'
    if (pathname === '/tracking') return 'GPS Tracking'
    if (pathname === '/fuel-dispatch') return 'Fuel Dispatch'
    if (pathname === '/reports') return 'Reports'
    if (pathname.includes('/entities/oil-companies')) return 'Oil Companies'
    if (pathname.includes('/entities/transporters')) return 'Transporters'
    if (pathname.includes('/entities/depots')) return 'Depots'
    if (pathname === '/settings') return 'Settings'
    if (pathname === '/profile') return 'Profile'
    return 'EPA Dashboard'
  }

  const title = useMemo(() => getPageTitle(location.pathname), [location.pathname])

  useEffect(() => {
    void getDashboardKpis().then((kpis) => {
      const total = kpis.exceededEta + kpis.gpsOfflineOver24h + kpis.stoppedOver5h
      setAlertsCount(total)
    })
  }, [])

  return (
    <div className="h-full bg-bg">
      <div className="flex h-full">

        {/* Desktop Sidebar */}
        <aside className="hidden w-70 shrink-0 border-r border-[#D1D5DB] bg-white shadow-[2px_0_12px_rgba(0,0,0,0.04)] md:block">
          <Sidebar />
        </aside>

        {/* Mobile Sidebar */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              className="absolute inset-0 bg-text/50"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-70 border-r border-[#D1D5DB] bg-white">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col bg-bg overflow-hidden">

          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-[#D1D5DB] bg-white">
            <div className="flex items-center justify-between gap-4 px-6 py-4">

              <div className="flex items-center gap-4">
                <button
                  className="md:hidden border px-3 py-2 rounded-lg"
                  onClick={() => setMobileOpen(true)}
                >
                  Menu
                </button>

                <h2 className="text-sm font-semibold text-text">{title}</h2>
              </div>

              <div className="flex items-center gap-4">

                {/* Alerts */}
                <button
                  onClick={() => navigate('/fuel-dispatch')}
                  className="relative p-2 rounded-lg border"
                >
                  <BellIcon className="size-5" />

                  {alertsCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {alertsCount > 99 ? '99+' : alertsCount}
                    </span>
                  )}
                </button>

                {/* Profile */}
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-3"
                >
                  <div className="text-right">
                    <div className="text-sm font-semibold text-text">Abebe B.</div>
                    <div className="text-xs text-text-muted">Ops Manager</div>
                  </div>

                  <img
                    src={profileImg}
                    alt="User profile"
                    className="h-10 w-10 rounded-full object-cover border border-[#D1D5DB]"
                  />
                </button>

              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 bg-bg p-6 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>

        </div>
      </div>
    </div>
  )
}