import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Card({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[#D1D5DB] bg-white shadow-card',
        'transition-shadow duration-200 hover:shadow-elevated',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: string
  subtitle?: string
  right?: ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 border-b border-[#D1D5DB] px-4 py-3 sm:px-5 sm:py-4">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-text break-words whitespace-normal">{title}</div>
        {subtitle ? <div className="mt-1 text-xs text-text-muted">{subtitle}</div> : null}
      </div>
      {right ? <div className="shrink-0 self-start sm:self-auto">{right}</div> : null}
    </div>
  )
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('px-5 py-5', className)}>{children}</div>
}

