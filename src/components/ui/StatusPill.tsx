import type { DispatchStatus, DispatchTask } from '../../data/types'
import { cn } from '../../lib/cn'
import { getStatusDetails } from '../../lib/statusDetails'

const tones: Record<DispatchStatus, string> = {
  'On transit': 'bg-primary/15 text-primary-strong',
  Delivered: 'bg-emerald-500/15 text-emerald-700',
  'Exceeded ETA': 'bg-amber-500/15 text-amber-700',
  'GPS Offline >24h': 'bg-rose-500/15 text-rose-700',
  'Stopped >5h': 'bg-fuchsia-500/15 text-fuchsia-700',
}

export default function StatusPill({
  status,
  task,
  className,
  showDetails = true,
}: {
  status: DispatchStatus
  task?: DispatchTask
  className?: string
  showDetails?: boolean
}) {
  const details = task && showDetails ? getStatusDetails(task) : null

  return (
    <div className={cn('flex flex-col items-end gap-1', className)}>
      <span
        className={cn(
          'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
          tones[status],
        )}
      >
        {status}
      </span>
      {details ? (
        <span className="text-[10px] font-medium text-text-muted">{details}</span>
      ) : null}
    </div>
  )
}

