import type { ComponentType, SVGProps } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import logo from "../../assets/logo.png"
import {
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
import { useAuth } from '../../context/AuthContext'

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



function NavItemLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 relative',
          'text-text-muted hover:bg-muted hover:text-text focus-visible:ring-[rgba(6,124,193,0.35)]',
          isActive && 'bg-[#067cc1] text-white shadow-card',
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
        <div className="grid size-10 place-items-center overflow-hidden rounded-lg bg-white">
          <img
            src={logo}
            alt="Company logo"
            className="size-10 object-cover"
          />
        </div>

        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-text">EPA ETHIOPIA</div>
          <div className="truncate text-xs text-text-muted">Ops Command Center</div>
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
            Stakeholders
          </div>

          <div className="space-y-1">
            {entitiesNav.map((item) => (
              <NavItemLink key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const [alertsCount, setAlertsCount] = useState(0)
  const [globalSearch, setGlobalSearch] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getPageTitle = (pathname: string): string => {
    if (pathname === '/' || pathname === '') return 'Operations Overview'
    if (pathname === '/tracking') return 'GPS Real-time Tracking'
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
  const isTracking = location.pathname === '/tracking'

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
        {!isTracking && (
          <aside className="hidden w-70 shrink-0 border-r border-[#D1D5DB] bg-white shadow-[2px_0_12px_rgba(0,0,0,0.04)] md:block">
            <Sidebar />
          </aside>
        )}

        {/* Toggle button when sidebar is hidden (e.g. GPS Tracking) */}
        {/* Removed from absolute overlay, moved to header */}

        {/* Slide-in Sidebar (all screen sizes when open) */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50">
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
                  className={cn("border px-3 py-2 rounded-lg", !isTracking && "md:hidden")}
                  onClick={() => setMobileOpen(true)}
                >
                  <span className="hidden md:block">☰ Menu</span>
                  <span className="md:hidden">Menu</span>
                </button>

                <h2 className="text-sm font-semibold text-text">{title}</h2>
              </div>

              <div className="hidden flex-1 px-6 lg:block">
                {!isTracking && (
                  <div className="relative max-w-xl mx-auto">
                    <input
                      value={globalSearch}
                      onChange={(e) => setGlobalSearch(e.target.value)}
                      placeholder="Search dispatches, vehicles, or depots..."
                      className="w-full rounded-xl border border-[#D1D5DB] bg-muted/40 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                )}
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

                {/* Profile Dropdown */}
                <div className="relative group text-left">
                  <button className="flex items-center gap-3 py-2 cursor-pointer">
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

                  <div className="absolute right-0 top-full mt-0 w-48 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                    <div className="py-1">
                      <button
                        onClick={() => navigate('/profile')}
                        className="block w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => navigate('/settings')}
                        className="block w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Settings
                      </button>
                      <div className="my-1 border-t border-gray-100"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className={cn("flex-1 bg-bg overflow-y-auto", isTracking && "p-0 overflow-hidden")}>
            <div className={cn("mx-auto w-full h-full", isTracking ? "max-w-none" : "max-w-7xl p-6")}>
              <Outlet />
            </div>
          </main>

        </div>
      </div>
    </div>
  )
}