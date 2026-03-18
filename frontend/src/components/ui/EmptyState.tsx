import type { ReactNode } from 'react'
import { MapPinIcon } from '@heroicons/react/24/outline'

type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-border/60 bg-surface/80 px-8 py-16 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-muted/60 text-text-muted">
        {icon ?? <MapPinIcon className="size-8" />}
      </div>
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
