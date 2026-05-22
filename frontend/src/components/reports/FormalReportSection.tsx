import StatusPill from '../ui/StatusPill'
import type { DispatchTask } from '../../data/types'

export default function FormalReportSection({
  filterType,
  setFilterType,
  isDropdownOpen,
  setIsDropdownOpen,
  expandedReportRow,
  setExpandedReportRow,
  query,
  setQuery,
  from,
  setFrom,
  to,
  setTo,
  setApplied,
  title,
  getSearchPlaceholder,
  result,
  isLoading,
}: {
  filterType: 'dispatch' | 'vehicle' | 'depot'
  setFilterType: (f: 'dispatch' | 'vehicle' | 'depot') => void
  isDropdownOpen: boolean
  setIsDropdownOpen: (o: boolean) => void
  expandedReportRow: number | null
  setExpandedReportRow: (r: number | null) => void
  query: string
  setQuery: (q: string) => void
  from: string
  setFrom: (f: string) => void
  to: string
  setTo: (t: string) => void
  setApplied: (a: { query: string; from: string; to: string }) => void
  title: string
  getSearchPlaceholder: () => string
  result: { columns: string[]; rows: any[] }
  isLoading: boolean
}) {
  return (
    <>
      <div className="flex items-center gap-2 mt-6 relative">
        <div
          className="relative"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-semibold transition border-b-2 text-primary border-primary bg-primary/5 flex items-center gap-2"
          >
            Formal
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 animate-fade-in">
              {[
                { id: 'dispatch' as const, label: 'By Dispatch' },
                { id: 'vehicle' as const, label: 'By Vehicle' },
                { id: 'depot' as const, label: 'By Depot' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setFilterType(option.id)
                    setIsDropdownOpen(false)
                    setQuery('')
                    setApplied({ query: '', from: '', to: '' })
                  }}
                  className={`
                    w-full text-left px-4 py-2.5 text-sm transition-colors
                    ${
                      filterType === option.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="text-sm text-gray-500">
          Active filter: {filterType === 'dispatch' ? 'Dispatch' : filterType === 'vehicle' ? 'Vehicle' : 'Depot'}
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-[#D1D5DB] bg-white p-4">
        <div className="text-sm font-semibold text-text">{title}</div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <input
            className="rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            placeholder={getSearchPlaceholder()}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <input
            type="date"
            className="rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="From"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <input
            type="date"
            className="rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => setApplied({ query, from, to })}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-card hover:shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 bg-primary hover:bg-primary-strong"
          >
            Run report
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[#D1D5DB] bg-white min-h-[300px]">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-[980px] w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs text-text-muted">
                  <tr>
                    {result.columns.map((h) => (
                      <th key={h} className="whitespace-nowrap px-3 py-3 font-semibold text-text-muted">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1D5DB]">
                  {result.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/40">
                      {row.cells.map((cell: any, cellIdx: number) => (
                        <td key={cellIdx} className="whitespace-nowrap px-3 py-3 text-text">
                          {cell}
                        </td>
                      ))}
                      <td className="whitespace-nowrap px-3 py-3">
                        <StatusPill status={row.task.status} task={row.task as DispatchTask} />
                      </td>
                    </tr>
                  ))}
                  {result.rows.length === 0 && (
                    <tr>
                      <td
                        className="px-3 py-6 text-sm text-text-muted text-center"
                        colSpan={result.columns.length || 7}
                      >
                        No results for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-[#D1D5DB]">
              {result.rows.map((row, idx) => (
                <div
                  key={idx}
                  onClick={() => setExpandedReportRow(expandedReportRow === idx ? null : idx)}
                  className="p-4 cursor-pointer active:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-text truncate">{row.cells[0]}</div>
                      <div className="text-xs text-text-muted mt-0.5 truncate">{row.cells[1]}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusPill status={row.task.status} task={row.task as DispatchTask} />
                      <svg
                        className={`size-4 text-text-muted transition-transform duration-200 ${
                          expandedReportRow === idx ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {expandedReportRow === idx && (
                    <div className="mt-3 pt-3 border-t border-[#D1D5DB] grid grid-cols-2 gap-3 text-sm animate-fade-in-up">
                      {result.columns.slice(2).map((col, ci) => {
                        const cellVal = row.cells[ci + 2]
                        if (cellVal === undefined) return null
                        return (
                          <div key={col}>
                            <div className="text-[11px] text-text-muted font-medium">{col}</div>
                            <div className="font-medium text-text mt-0.5 break-all">{cellVal}</div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
              {result.rows.length === 0 && (
                <div className="p-6 text-sm text-text-muted text-center">No results for the selected filters.</div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
