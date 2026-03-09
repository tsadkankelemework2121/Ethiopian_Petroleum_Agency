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
import profileImage from '../../assets/profile.jpg'

type NavItem = {
  to: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  end?: boolean
  headerTitle?: string
}

const primaryNav: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: Squares2X2Icon, end: true, headerTitle: 'Operations Overview' },
  { to: '/tracking', label: 'GPS Tracking', icon: MapIcon, headerTitle: 'Operations Overview' },
  { to: '/fuel-dispatch', label: 'Fuel Dispatch', icon: ClipboardDocumentListIcon, headerTitle: 'Operations Overview' },
  { to: '/reports', label: 'Reports', icon: ChartBarSquareIcon, headerTitle: 'Operations Overview' },
]

const entitiesNav: NavItem[] = [
  { to: '/entities/oil-companies', label: 'Oil Companies', icon: BuildingOffice2Icon, headerTitle: 'Operations Overview' },
  { to: '/entities/transporters', label: 'Transporters', icon: TruckIcon, headerTitle: 'Operations Overview' },
  { to: '/entities/depots', label: 'Depots', icon: MapIcon, headerTitle: 'Operations Overview' },
]

const footerNav: NavItem[] = [{ to: '/settings', label: 'Settings', icon: AdjustmentsHorizontalIcon, headerTitle: 'Operations Overview' }]

function NavItemLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0687d1]/40 relative',
          'text-text-muted hover:bg-muted hover:text-text',
          isActive &&
            'font-semibold pl-2.5 bg-[#0687d1]/10 text-[#0687d1] border-l-4 border-[#0687d1]',
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

  // Get header title based on current route
  const title = useMemo(() => {
    const allNav = [...primaryNav, ...entitiesNav, ...footerNav]
    const currentNav = allNav.find((nav) => {
      if (nav.end) return location.pathname === nav.to
      return location.pathname.startsWith(nav.to)
    })
    return currentNav?.headerTitle || 'Operations Overview'
  }, [location.pathname])

  useEffect(() => {
    void getDashboardKpis().then((kpis) => {
      const total = kpis.exceededEta + kpis.gpsOfflineOver24h + kpis.stoppedOver5h
      setAlertsCount(total)
    })
  }, [])

  return (
    <div className="h-full bg-bg">
      <div className="flex h-full">
        {/* Desktop sidebar */}
        <aside className="hidden w-70 shrink-0 border-r border-[#D1D5DB] bg-white shadow-[2px_0_12px_rgba(0,0,0,0.04)] md:block">
          <Sidebar />
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileOpen ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-text/50"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            />
            <aside className="absolute left-0 top-0 h-full w-70 border-r border-[#D1D5DB] bg-white">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        ) : null}

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col bg-bg overflow-hidden">
          <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white">
            <div className="flex items-center justify-between gap-4 px-6 py-4">
              {/* Left: Menu button (mobile) + Title */}
              <div className="flex items-center gap-4 min-w-0">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg border border-[#D1D5DB] bg-muted px-3 py-2 text-sm font-medium text-text hover:bg-border transition md:hidden"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open menu"
                >
                  Menu
                </button>
                <h2 className="text-xl font-bold text-[#1F2937] truncate">{title}</h2>
              </div>

              {/* Center: Search bar */}
              <div className="hidden lg:flex flex-1 max-w-md items-center">
                <input
                  className="w-full rounded-lg border border-[#D1D5DB] bg-[#F3F4F6] px-4 py-2.5 text-sm outline-none placeholder:text-[#9CA3AF] focus:bg-white focus:ring-2 focus:ring-[#0687d1]/30 focus:border-[#0687d1] transition"
                  placeholder="Search dispatches, vehicles, or depots..."
                />
              </div>

              {/* Right: Notifications + User */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/fuel-dispatch')
                    setTimeout(() => {
                      const element = document.getElementById('problem-dispatches')
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }, 100)
                  }}
                  className="relative inline-flex items-center justify-center rounded-lg border border-[#D1D5DB] bg-white p-2.5 text-text hover:bg-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0687d1]/40"
                  aria-label={`${alertsCount} alerts`}
                >
                  <BellIcon className="size-5" />
                  {alertsCount > 0 ? (
                    <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {alertsCount > 99 ? '99+' : alertsCount}
                    </span>
                  ) : null}
                </button>

                {/* User section */}
                <div className="flex items-center gap-3 pl-3 border-l border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-3 rounded-lg hover:bg-muted/50 px-2 py-1 transition text-sm"
                    aria-label="User profile"
                  >
                    <div className="text-right">
                      <div className="font-semibold text-[#1F2937]">Abebe B.</div>
                      <div className="text-xs text-[#6B7280]">Ops Manager</div>
                    </div>
                    <img
                      src={profileImage}
                      alt="Abebe B."
                      className="size-10 rounded-full object-cover border-2 border-[#0687d1]"
                    />
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 bg-bg p-6 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
