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
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 relative',
          'text-text-muted hover:bg-muted hover:text-text',
          isActive && 'bg-primary/12 text-primary font-semibold border-l-3 border-primary pl-2.5',
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

function routeTitle(pathname: string) {
  if (pathname === '/') return 'Dashboard'
  if (pathname.startsWith('/tracking')) return 'GPS Tracking'
  if (pathname.startsWith('/fuel-dispatch')) return 'Fuel Dispatch & Transit'
  if (pathname.startsWith('/reports')) return 'Reports'
  if (pathname.startsWith('/entities/oil-companies')) return 'Oil Companies'
  if (pathname.startsWith('/entities/transporters')) return 'Transporters'
  if (pathname.startsWith('/entities/depots')) return 'Depots'
  if (pathname.startsWith('/settings')) return 'Settings'
  if (pathname.startsWith('/profile')) return 'Admin Profile'
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
    <div className="h-full bg-bg">
      <div className="flex h-full">
        {/* Desktop sidebar */}
        <aside className="hidden w-[280px] shrink-0 border-r border-[#D1D5DB] bg-white shadow-[2px_0_12px_rgba(0,0,0,0.04)] md:block">
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
            <aside className="absolute left-0 top-0 h-full w-[280px] border-r border-[#D1D5DB] bg-white">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        ) : null}

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col bg-bg overflow-hidden">
          <header className="sticky top-0 z-40 border-b border-[#D1D5DB] bg-white blur-backdrop">
            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="flex items-center gap-4 min-w-0">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg border border-[#D1D5DB] bg-muted px-3 py-2 text-sm font-medium text-text hover:bg-border transition md:hidden"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open menu"
                >
                  Menu
                </button>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-text truncate">{title}</h2>
                  <p className="text-xs text-text-muted">Ethiopian Petroleum Agency</p>
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-4">
                <div className="hidden lg:block">
                  <input
                    className="w-80 rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                    placeholder="Search dispatch, vehicle, transporter…"
                  />
                </div>
                <div className="flex items-center gap-3">
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
                    className="relative inline-flex items-center justify-center rounded-lg border border-[#D1D5DB] bg-white p-2.5 text-text hover:bg-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    aria-label={`${alertsCount} alerts`}
                  >
                    <BellIcon className="size-5" />
                    {alertsCount > 0 ? (
                      <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {alertsCount > 99 ? '99+' : alertsCount}
                      </span>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="inline-flex items-center justify-center rounded-lg border border-[#D1D5DB] bg-white p-2.5 text-text hover:bg-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    aria-label="User profile"
                  >
                    <div className="grid size-9 place-items-center rounded-lg bg-primary text-white font-bold text-sm">
                      PA
                    </div>
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
