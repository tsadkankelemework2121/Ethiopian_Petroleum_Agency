import type { ReactNode } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '../../lib/cn'

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        aria-label="Close modal"
      />

      {/* Modal Content */}
      <div
        className={cn(
          'relative z-10 w-full max-w-2xl rounded-xl border border-[#D1D5DB] bg-white shadow-elevated',
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D1D5DB] px-6 py-4">
          <h2 className="text-xl font-bold text-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg p-2 text-text-muted hover:bg-muted transition"
            aria-label="Close"
          >
            <XMarkIcon className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
