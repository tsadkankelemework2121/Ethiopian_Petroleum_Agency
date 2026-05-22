export default function TrackingMapControls({
  isClustered,
  setIsClustered,
  onFitBounds,
  onZoomIn,
}: {
  isClustered: boolean
  setIsClustered: (c: boolean) => void
  onFitBounds: () => void
  onZoomIn: () => void
}) {
  return (
    <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none z-10">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-[#D1D5DB] bg-white/95 px-4 py-2 shadow-card">
        <button
          type="button"
          onClick={() => setIsClustered(!isClustered)}
          className={`rounded-full px-3 py-1.5 text-[11px] font-bold border transition ${
            isClustered
              ? 'bg-[#1c8547] text-white border-[#1c8547] shadow-md hover:bg-[#166d3a]'
              : 'bg-white text-slate-600 border-[#E5E7EB] hover:bg-slate-50'
          }`}
        >
          CLUSTER {isClustered && 'ON'}
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onFitBounds}
            className="grid size-9 place-items-center rounded-full bg-white border border-[#D1D5DB] text-slate-700 hover:bg-slate-50 transition"
            aria-label="Zoom out to see all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onZoomIn}
            className="grid size-9 place-items-center rounded-full bg-white border border-[#D1D5DB] text-slate-700 hover:bg-slate-50 transition font-bold"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}
