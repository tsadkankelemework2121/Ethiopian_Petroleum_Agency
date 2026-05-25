import type { GpsVehicle } from '../../data/types'

export default function VehicleDetailCard({
  v,
  dispatch,
  depotName,
}: {
  v: GpsVehicle
  dispatch?: any
  depotName?: string
}) {
  return (
    <div className="px-4 pb-3 pt-1 animate-fade-in-up bg-slate-50/50" style={{ overflowY: 'auto' }}>
      <div className="mb-3 text-[10px] font-semibold text-slate-700 truncate flex items-center gap-1.5">
        <span>{v.name}</span>
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
      <div className="mb-3 grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded border bg-white p-2 shadow-sm">
          <div className="text-slate-500">Speed</div>
          <div className="font-semibold text-slate-900">{v.speed} km/h</div>
        </div>
        <div className="rounded border bg-white p-2 shadow-sm">
          <div className="text-slate-500">Engine</div>
          <div className="font-semibold text-slate-900">{v.engine}</div>
        </div>
        <div className="rounded border bg-white p-2 shadow-sm">
          <div className="text-slate-500">Odometer</div>
          <div className="font-semibold text-slate-900">{v.odometer}</div>
        </div>
        <div className="rounded border bg-white p-2 shadow-sm">
          <div className="text-slate-500">Fuel</div>
          <div className="font-semibold text-slate-900">{v.fuel_1}</div>
        </div>
        <div className="rounded border border-blue-200 bg-blue-50/30 p-2 shadow-sm col-span-2">
          <div className="text-blue-600 font-bold uppercase tracking-widest text-[8px] mb-0.5">Oil Company</div>
          <div className="font-bold text-slate-900">{v.group || '—'}</div>
        </div>
      </div>
      <div className="rounded border bg-white p-2 text-[10px] shadow-sm">
        <div className="text-slate-500 mb-1 font-semibold uppercase tracking-wider">Location Data</div>
        <div>
          <span className="font-medium text-slate-700">GPS:</span> {v.lat}, {v.lng}
        </div>
        <div>
          <span className="font-medium text-slate-700">Latest update:</span> {v.dt_tracker}
        </div>
        <div>
          <span className="font-medium text-slate-700">Latest server:</span> {v.dt_server}
        </div>
      </div>

      {dispatch && (
        <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/50 p-3 shadow-sm">
          <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-2 flex justify-between">
            <span>Current Dispatch</span>
            <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[8px]">{dispatch.status}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
            <div>
              <div className="text-slate-500 text-[9px]">Destination</div>
              <div className="font-semibold text-slate-900">{depotName || '—'}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[9px]">Fuel Type</div>
              <div className="font-semibold text-slate-900">{dispatch.fuelType}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[9px]">Liters</div>
              <div className="font-semibold text-slate-900">
                {Number(dispatch.dispatchedLiters).toLocaleString()} L
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-[9px]">ETA</div>
              <div className="font-semibold text-slate-900">{dispatch.etaDateTime?.split('T')[0]}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
