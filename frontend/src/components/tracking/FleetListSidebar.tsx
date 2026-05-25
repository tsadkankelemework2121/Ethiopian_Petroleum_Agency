import { List as VirtualList, type RowComponentProps } from 'react-window'
import type { GpsVehicle } from '../../data/types'
import VehicleDetailCard from './VehicleDetailCard'

type FleetListSidebarProps = {
  search: string
  setSearch: (s: string) => void
  statusFilter: string
  setStatusFilter: (s: string) => void
  assignmentFilter: string
  setAssignmentFilter: (s: string) => void
  isPendingFilter: boolean
  isListLoading: boolean
  queryError: any
  fleetListItems: GpsVehicle[]
  combinedItems: GpsVehicle[]
  selectedId: string | undefined
  onSelect: (v: GpsVehicle) => void
  isListOpen: boolean
  setIsListOpen: (o: boolean) => void
  activeDispatchesByVehicle: Map<string, any>
  depotsById: Map<string, any>
  listHostRef: React.RefObject<HTMLDivElement | null>
  listSize: { width: number; height: number }
  statusTag: (v: GpsVehicle) => { label: string; color: string }
  plateFromName: (name: string) => string
  getItemSize: (index: number) => number
  COLORS: { blue: string; gold: string; gray: string; bg: string }
}

export default function FleetListSidebar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  assignmentFilter,
  setAssignmentFilter,
  isPendingFilter,
  isListLoading,
  queryError,
  fleetListItems,
  combinedItems,
  selectedId,
  onSelect,
  isListOpen,
  activeDispatchesByVehicle,
  depotsById,
  listHostRef,
  listSize,
  statusTag,
  plateFromName,
  getItemSize,
  COLORS,
}: FleetListSidebarProps) {
  
  type RowData = {
    items: GpsVehicle[]
    selectedId: string | undefined
    onSelect: (v: GpsVehicle) => void
  }

  const Row = ({ index, style, items, selectedId: rowSelectedId, onSelect }: RowComponentProps<RowData>) => {
    const v = items[index]
    if (!v) return null

    const tag = statusTag(v)
    const plate = plateFromName(v.name)
    const isSelected = v.imei === rowSelectedId
    const dispatch = activeDispatchesByVehicle.get(v.imei)

    const collapsedHeight = dispatch ? 68 : 52
    const expandedHeight = dispatch ? 360 : 250
    const depotName = dispatch ? (depotsById.get(dispatch.destinationDepotId?.toString() || dispatch.destination_depot_id?.toString())?.name || 'Unknown Depot') : ''

    return (
      <div style={style} className="border-b border-[#EEF2F7]">
        <button
          type="button"
          onClick={() => onSelect(v)}
          className="w-full px-4 py-3 text-left hover:bg-slate-50 transition"
          style={isSelected ? { backgroundColor: 'rgba(28,133,71,0.08)' } : undefined}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="text-sm font-bold" style={{ color: isSelected ? COLORS.blue : '#0f172a' }}>
                  {plate}
                </div>
                {v.source && (
                  <span className={`inline-flex items-center rounded px-1.5 py-0.2 text-[8px] font-extrabold uppercase tracking-wide leading-none border ${
                    v.source === 'ztrack'
                      ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800'
                      : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800'
                  }`}>
                    {v.source}
                  </span>
                )}
              </div>
              {dispatch && (
                <div className="text-[10px] text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                  <div className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                  {dispatch.status} → {depotName}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
                style={{ backgroundColor: `${tag.color}1A`, color: tag.color }}
              >
                {v.status}
              </span>
              {dispatch && (
                <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse border border-blue-200">
                  Task Assigned
                </span>
              )}
            </div>
          </div>
        </button>

        {isSelected && (
          <div
            className="px-4 pb-3 pt-1 bg-slate-50/50"
            style={{ maxHeight: expandedHeight - collapsedHeight + 2, overflowY: 'auto' }}
          >
            <VehicleDetailCard v={v} dispatch={dispatch} depotName={depotName} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`absolute left-4 right-4 md:right-auto md:w-[320px] top-20 md:top-4 bottom-20 md:bottom-4 rounded-2xl border border-[#D1D5DB] bg-white/95 backdrop-blur-sm shadow-elevated flex-col overflow-hidden z-10 transition-opacity ${
        isListOpen ? 'flex' : 'hidden md:flex'
      }`}
    >
      <div className="px-5 py-4 border-b border-[#E5E7EB]">
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#64748b' }}>
          Fleet list
        </div>
        <div className="mt-3 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full bg-transparent text-sm outline-none"
            placeholder="Search fleet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isPendingFilter && (
            <div className="size-3 animate-spin rounded-full border-2 border-primary border-t-transparent shrink-0" />
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
          >
            <option value="All">MOVEMENT: ALL</option>
            <option value="Moving">MOVING</option>
            <option value="Idle">IDLE</option>
            <option value="Stopped">STOPPED</option>
            <option value="Offline">OFFLINE</option>
          </select>

          <div className="relative">
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 appearance-none animate-fade-in-up"
            >
              <option value="All">TASK: ALL</option>
              <option value="Assigned">ASSIGNED</option>
              <option value="Unassigned">NOT ASSIGNED</option>
            </select>
          </div>
        </div>
      </div>

      <div
        ref={listHostRef}
        className={`flex-1 overflow-hidden transition-opacity duration-200 ${
          isPendingFilter ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        {isListLoading ? (
          <div className="p-8 flex items-center justify-center flex-col space-y-3">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <div className="text-xs font-medium text-slate-500">Loading assignments...</div>
          </div>
        ) : queryError ? (
          <div className="p-4 text-sm text-red-600">{(queryError as Error).message}</div>
        ) : listSize.height > 0 && listSize.width > 0 ? (
          <VirtualList
            style={{ height: listSize.height, width: listSize.width }}
            rowCount={fleetListItems.length}
            rowHeight={getItemSize}
            rowComponent={Row}
            rowProps={{
              items: fleetListItems,
              selectedId,
              onSelect,
            }}
          />
        ) : (
          <div className="p-4 text-sm text-slate-600">Loading list…</div>
        )}
      </div>

      <div className="px-5 py-3 border-t border-[#EEF2F7] flex items-center justify-between text-[11px] text-slate-500">
        <span>
          SHOWING {fleetListItems.length} OF {combinedItems.length}
        </span>
        <button type="button" className="font-semibold" style={{ color: COLORS.blue }}>
          VIEW ALL
        </button>
      </div>
    </div>
  )
}
