import { useState } from 'react'
import { Card, CardHeader } from '../ui/Card'
import StatusPill from '../ui/StatusPill'
import type { DispatchTask } from '../../data/types'

export default function RecentDispatches({
  recentDispatches,
}: {
  recentDispatches: any[]
}) {
  const [expandedMobileRow, setExpandedMobileRow] = useState<string | null>(null)

  return (
    <div className="md:col-span-12 min-w-0">
      <Card>
        <CardHeader title="Recent dispatches" subtitle="Latest dispatch tasks with ETA and status" />
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-190 w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-muted text-xs font-semibold text-text-muted border-b border-[#D1D5DB]">
              <tr>
                {['Dispatch', 'Oil company', 'Transporter', 'ETA', 'Event'].map((h) => (
                  <th key={h} className="whitespace-nowrap px-5 py-4 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D1D5DB]">
              {recentDispatches.map((r) => (
                <tr key={r.peaDispatchNo} className="hover:bg-muted/50 transition">
                  <td className="whitespace-nowrap px-5 py-4 font-medium text-text">{r.peaDispatchNo}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-text">{r.oilCompany}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-text">{r.transporter}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-text">{r.eta}</td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <StatusPill status={r.status} task={r as DispatchTask} />
                  </td>
                </tr>
              ))}
              {recentDispatches.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-sm text-text-muted" colSpan={5}>
                    No dispatch tasks found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-[#D1D5DB]">
          {recentDispatches.map((r) => (
            <div
              key={r.peaDispatchNo}
              onClick={() => setExpandedMobileRow(expandedMobileRow === r.peaDispatchNo ? null : r.peaDispatchNo)}
              className="p-4 cursor-pointer active:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-text truncate">{r.peaDispatchNo}</div>
                  <div className="text-xs text-text-muted mt-0.5 truncate">{r.oilCompany}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusPill status={r.status} task={r as DispatchTask} />
                  <svg className={`size-4 text-text-muted transition-transform duration-200 ${expandedMobileRow === r.peaDispatchNo ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {expandedMobileRow === r.peaDispatchNo && (
                <div className="mt-3 pt-3 border-t border-[#D1D5DB] grid grid-cols-2 gap-3 text-sm animate-fade-in-up">
                  <div>
                    <div className="text-[11px] text-text-muted font-medium">Transporter</div>
                    <div className="font-medium text-text mt-0.5">{r.transporter}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-text-muted font-medium">ETA</div>
                    <div className="font-medium text-text mt-0.5">{r.eta}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {recentDispatches.length === 0 && (
            <div className="p-6 text-sm text-text-muted text-center">No dispatch tasks found.</div>
          )}
        </div>
      </Card>
    </div>
  )
}
