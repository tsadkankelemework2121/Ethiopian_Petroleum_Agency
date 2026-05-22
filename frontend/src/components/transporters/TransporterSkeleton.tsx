import { Skeleton } from '../ui/Skeleton'

export default function TransporterSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-[#D1D5DB] bg-white shadow-card max-h-[600px] overflow-hidden">
      <div className="border-b border-[#D1D5DB] p-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-2 h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>
      </div>

      <div className="p-4 shrink-0 border-b border-[#D1D5DB]">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-40 rounded-md" />
            <Skeleton className="h-7 w-20 rounded-md" />
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-2">
        <Skeleton className="h-10 w-full rounded-md" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-full rounded-md" />
        ))}
      </div>
    </div>
  )
}
