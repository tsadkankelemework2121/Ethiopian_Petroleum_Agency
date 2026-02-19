import type { DispatchStatus } from '../../data/types'
import { cn } from '../../lib/cn'

const tones: Record<DispatchStatus, string> = {
  'On transit': 'bg-primary/15 text-primary-strong',
  Delivered: 'bg-emerald-500/15 text-emerald-700',
  'Exceeded ETA': 'bg-amber-500/15 text-amber-700',
  'GPS Offline >24h': 'bg-rose-500/15 text-rose-700',
  'Stopped >5h': 'bg-fuchsia-500/15 text-fuchsia-700',
}

export default function StatusPill({ status, className }: { status: DispatchStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        tones[status],
        className,
      )}
    >
      {status}
    </span>
  )
}

