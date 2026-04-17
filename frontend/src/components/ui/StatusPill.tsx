import type { DispatchStatus, DispatchTask } from '../../data/types'
import { cn } from '../../lib/cn'
import { getStatusDetails } from '../../lib/statusDetails'

const tones: Record<DispatchStatus, string> = {
  'On transit': 'bg-slate-500/15 text-slate-700',
  Delivered: 'bg-[#1c8547]/15 text-[#1c8547]',
  'Exceeded ETA': 'bg-[#f59e0b]/15 text-[#f59e0b]',
  'GPS Offline >24h': 'bg-[#f59e0b]/15 text-[#f59e0b]',
  'Stopped >5h': 'bg-[#f59e0b]/15 text-[#f59e0b]',
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

