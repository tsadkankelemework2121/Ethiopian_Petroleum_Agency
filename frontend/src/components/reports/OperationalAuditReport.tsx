import type { DispatchTask } from '../../data/types'

type OperationalAuditReportProps = {
  dispatches: DispatchTask[]
  dashboardKpis: any[]
  fuelSummary: { benzine: number; diesel: number; jetFuel: number; total: number }
  dailyDispatch: any[]
  dispatchesLength: number
  showDashboardReport: boolean
  setShowDashboardReport: (s: boolean) => void
}

export default function OperationalAuditReport({
  dashboardKpis,
  fuelSummary,
  dailyDispatch,
  showDashboardReport,
  setShowDashboardReport,
}: OperationalAuditReportProps) {
  

  const handlePrint = () => {
    // Force the report open before printing
    if (!showDashboardReport) {
      setShowDashboardReport(true)
      // Small delay to let React render the content before triggering print
      setTimeout(() => window.print(), 100)
    } else {
      window.print()
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-[#D1D5DB] bg-white overflow-hidden shadow-card print:border-none print:shadow-none print:mt-0 print:rounded-none">
      <button
        type="button"
        onClick={() => setShowDashboardReport(!showDashboardReport)}
        className="w-full flex items-center justify-between px-6 py-5 bg-slate-50 hover:bg-slate-100/80 transition no-print"
      >
        <div className="text-left">
          <div className="text-base font-bold text-text">National Fuel Dispatch & Fleet Operational Audit Report</div>
          <div className="text-xs text-text-muted mt-1 font-normal">
            Generate and print official audit reports for fleet statistics, fuel distributions, and logistics schedules.
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
        <div className="p-6 sm:p-8 space-y-8 print:p-0 print:space-y-6 bg-white">
          {/* Action Header - hidden when printing */}
          <div className="flex justify-end gap-3 pb-4 border-b border-slate-100 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Official Report
            </button>
          </div>

          {/* PRINT ONLY: Formal Header */}
          <div className="hidden print:block text-center space-y-2 border-b-2 border-slate-950 pb-6">
            <div className="text-xl font-extrabold tracking-wide uppercase text-slate-950">Ethiopian Petroleum & Energy Authority</div>
            <div className="text-sm font-semibold tracking-wider text-slate-700 uppercase">National Fuel Supply Logistics Command Center</div>
            <div className="text-xs text-slate-500 font-medium">PO Box 2244, Addis Ababa, Ethiopia • command-center@pea.gov.et</div>
            <div className="pt-4 text-base font-extrabold uppercase text-slate-900 tracking-widest">
              National Fuel Dispatch & Fleet Operational Audit Report
            </div>
            <div className="text-xs text-slate-500 font-normal">
              Reference ID: Audit-PEA-{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)} • Generated: {new Date().toLocaleString()}
            </div>
          </div>

          {/* Section 1: Executive KPI Metrics */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
              1. Executive KPI Summary
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 print:border-slate-300">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-4 py-3 border border-slate-200">Metric Indicator</th>
                    <th className="px-4 py-3 border border-slate-200 text-right">Current Value / Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dashboardKpis.map((k) => (
                    <tr key={k.label} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200">{k.label}</td>
                      <td className="px-4 py-3 text-right font-extrabold text-slate-900 border border-slate-200">{k.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Fuel Distribution & Volume Balance Sheet */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
              2. Fuel Product Volume Balance Sheet
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 print:border-slate-300">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-4 py-3 border border-slate-200">Product / Fuel Type</th>
                    <th className="px-4 py-3 border border-slate-200 text-right">Delivered Volume (Liters)</th>
                    <th className="px-4 py-3 border border-slate-200 text-right">Volume Share Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: 'Benzine (Super Plus)', vol: fuelSummary.benzine },
                    { name: 'Diesel (Gasoil)', vol: fuelSummary.diesel },
                    { name: 'Jet A-1 Fuel', vol: fuelSummary.jetFuel },
                  ].map((f) => (
                    <tr key={f.name} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200">{f.name}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900 border border-slate-200">
                        {f.vol.toLocaleString()} L
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 border border-slate-200">
                        {fuelSummary.total > 0 ? ((f.vol / fuelSummary.total) * 100).toFixed(2) : 0}%
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/80 font-bold border-t border-slate-300">
                    <td className="px-4 py-3 text-slate-900 border border-slate-200">Total Liquid Petroleum Products</td>
                    <td className="px-4 py-3 text-right text-slate-900 border border-slate-200">
                      {fuelSummary.total.toLocaleString()} L
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900 border border-slate-200">100.00%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Dispatch Trends & Timelines */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
              3. Weekly Operational Dispatch Timeline
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 print:border-slate-300">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-4 py-3 border border-slate-200">Operational Day</th>
                    <th className="px-4 py-3 border border-slate-200 text-right">Benzine (L)</th>
                    <th className="px-4 py-3 border border-slate-200 text-right">Diesel (L)</th>
                    <th className="px-4 py-3 border border-slate-200 text-right">Jet Fuel (L)</th>
                    <th className="px-4 py-3 border border-slate-200 text-right">Daily Aggregate Volume (L)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dailyDispatch.map((d) => {
                    const dayTotal = d.benzine + d.diesel + d.jetFuel
                    return (
                      <tr key={d.day} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200">
                          {d.day} <span className="text-[10px] text-slate-400 font-normal">({d.date})</span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 border border-slate-200">
                          {d.benzine.toLocaleString()} L
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 border border-slate-200">
                          {d.diesel.toLocaleString()} L
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 border border-slate-200">
                          {d.jetFuel.toLocaleString()} L
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900 border border-slate-200">
                          {dayTotal.toLocaleString()} L
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Signature & Sign-Off - print only */}
          <div className="hidden print:block pt-12">
            <div className="grid grid-cols-2 gap-8 text-xs">
              <div className="border-t border-slate-400 pt-3 text-center space-y-1">
                <div className="font-bold text-slate-700">Audit Prepared & Certified By:</div>
                <div className="text-slate-900 font-semibold">National Logistics Director</div>
                <div className="text-slate-400">Signature: __________________________</div>
              </div>
              <div className="border-t border-slate-400 pt-3 text-center space-y-1">
                <div className="font-bold text-slate-700">Authority Verification Sign-Off:</div>
                <div className="text-slate-900 font-semibold">Director General, PEA</div>
                <div className="text-slate-400">Signature: __________________________</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
