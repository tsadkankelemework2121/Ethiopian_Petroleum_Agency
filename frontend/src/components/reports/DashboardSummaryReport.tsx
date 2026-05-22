import { useState } from 'react'

export default function DashboardSummaryReport({
  showDashboardReport,
  setShowDashboardReport,
  dashboardKpis,
  fuelSummary,
  dailyDispatch,
  statusBreakdown,
  recentDispatches,
  dispatchesLength,
}: {
  showDashboardReport: boolean
  setShowDashboardReport: (s: boolean) => void
  dashboardKpis: any[]
  fuelSummary: { benzine: number; diesel: number; jetFuel: number; total: number }
  dailyDispatch: any[]
  statusBreakdown: any[]
  recentDispatches: any[]
  dispatchesLength: number
}) {
  return (
    <div className="mt-6 rounded-xl border border-[#D1D5DB] bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setShowDashboardReport(!showDashboardReport)}
        className="w-full flex items-center justify-between px-5 py-4 bg-muted/30 hover:bg-muted/50 transition"
      >
        <div>
          <div className="text-sm font-bold text-text">Dashboard Summary Report</div>
          <div className="text-xs text-text-muted mt-0.5 font-normal">
            KPIs, fuel summary, daily dispatch, status breakdown
          </div>
        </div>
        <svg
          className={`size-5 text-text-muted transition-transform duration-200 ${
            showDashboardReport ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDashboardReport && (
        <div className="p-5 space-y-6 print:space-y-4">
          {/* Report Header */}
          <div className="text-center border-b border-[#D1D5DB] pb-4">
            <div className="text-lg font-bold text-text font-sans">Ethiopian Petroleum Agency</div>
            <div className="text-sm text-text-muted font-normal">
              Dashboard Summary Report —{' '}
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {/* KPI Summary Table */}
          <div>
            <div className="text-sm font-bold text-text mb-2">Key Performance Indicators</div>
            <table className="w-full text-sm border border-[#D1D5DB]">
              <thead className="bg-muted/50">
                <tr>
                  {dashboardKpis.map((k) => (
                    <th
                      key={k.label}
                      className="px-3 py-2 text-left font-semibold text-text-muted border border-[#D1D5DB]"
                    >
                      {k.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {dashboardKpis.map((k) => (
                    <td key={k.label} className="px-3 py-2 font-bold text-text border border-[#D1D5DB]">
                      {k.value}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Fuel Type Summary */}
          <div>
            <div className="text-sm font-bold text-text mb-2">Delivered Fuel Summary</div>
            <table className="w-full text-sm border border-[#D1D5DB]">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-text-muted border border-[#D1D5DB]">
                    Fuel Type
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-text-muted border border-[#D1D5DB]">
                    Volume (L)
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-text-muted border border-[#D1D5DB]">
                    % Share
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Benzine', vol: fuelSummary.benzine },
                  { name: 'Diesel', vol: fuelSummary.diesel },
                  { name: 'Jet Fuel', vol: fuelSummary.jetFuel },
                ].map((f) => (
                  <tr key={f.name}>
                    <td className="px-3 py-2 text-text border border-[#D1D5DB]">{f.name}</td>
                    <td className="px-3 py-2 text-right text-text border border-[#D1D5DB]">
                      {f.vol.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right text-text border border-[#D1D5DB]">
                      {fuelSummary.total > 0 ? ((f.vol / fuelSummary.total) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/30 font-bold">
                  <td className="px-3 py-2 text-text border border-[#D1D5DB]">Total</td>
                  <td className="px-3 py-2 text-right text-primary border border-[#D1D5DB]">
                    {fuelSummary.total.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right text-text border border-[#D1D5DB]">100%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Daily Dispatch This Week */}
          <div>
            <div className="text-sm font-bold text-text mb-2">Daily Dispatch — This Week</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-[#D1D5DB]">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-text-muted border border-[#D1D5DB]">
                      Day
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-text-muted border border-[#D1D5DB]">
                      Benzine (L)
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-text-muted border border-[#D1D5DB]">
                      Diesel (L)
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-text-muted border border-[#D1D5DB]">
                      Jet Fuel (L)
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-text-muted border border-[#D1D5DB]">
                      Total (L)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dailyDispatch.map((d) => (
                    <tr key={d.day}>
                      <td className="px-3 py-2 font-medium text-text border border-[#D1D5DB]">
                        {d.day} <span className="text-text-muted text-xs font-normal">({d.date})</span>
                      </td>
                      <td className="px-3 py-2 text-right text-text border border-[#D1D5DB]">
                        {d.benzine.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right text-text border border-[#D1D5DB]">
                        {d.diesel.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right text-text border border-[#D1D5DB]">
                        {d.jetFuel.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-text border border-[#D1D5DB]">
                        {(d.benzine + d.diesel + d.jetFuel).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Breakdown */}
          <div>
            <div className="text-sm font-bold text-text mb-2">Dispatch Status Breakdown</div>
            <table className="w-full text-sm border border-[#D1D5DB] max-w-md">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-text-muted border border-[#D1D5DB]">
                    Status
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-text-muted border border-[#D1D5DB]">
                    Count
                  </th>
                </tr>
              </thead>
              <tbody>
                {statusBreakdown.map(([status, count]) => (
                  <tr key={status}>
                    <td className="px-3 py-2 text-text border border-[#D1D5DB]">{status}</td>
                    <td className="px-3 py-2 text-right font-semibold text-text border border-[#D1D5DB]">
                      {count}
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/30 font-bold">
                  <td className="px-3 py-2 text-text border border-[#D1D5DB]">Total</td>
                  <td className="px-3 py-2 text-right text-primary border border-[#D1D5DB]">
                    {dispatchesLength}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Recent Dispatches */}
          <div>
            <div className="text-sm font-bold text-text mb-2">Recent Dispatches (Last 10)</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-[#D1D5DB]">
                <thead className="bg-muted/50">
                  <tr>
                    {[
                      'Dispatch No.',
                      'Oil Company',
                      'Transporter',
                      'Fuel Type',
                      'Liters',
                      'Status',
                      'Dispatch Date',
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left font-semibold text-text-muted border border-[#D1D5DB] whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentDispatches.map((d) => (
                    <tr key={d.peaDispatchNo}>
                      <td className="px-3 py-2 font-medium text-text border border-[#D1D5DB]">
                        {d.peaDispatchNo}
                      </td>
                      <td className="px-3 py-2 text-text border border-[#D1D5DB]">{d.oilCompanyId}</td>
                      <td className="px-3 py-2 text-text border border-[#D1D5DB]">{d.transporterId || '—'}</td>
                      <td className="px-3 py-2 text-text border border-[#D1D5DB]">{d.fuelType}</td>
                      <td className="px-3 py-2 text-right text-text border border-[#D1D5DB]">
                        {d.dispatchedLiters.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-text border border-[#D1D5DB]">{d.status}</td>
                      <td className="px-3 py-2 text-text border border-[#D1D5DB] whitespace-nowrap">
                        {d.dispatchDateTime?.replace('T', ' ').replace('Z', '')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
