import type { ReactNode } from 'react'

export function ModalOverlay({ isOpen, onClose, children, title }: { isOpen: boolean; onClose: () => void; children: ReactNode; title: string }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        aria-label="Close modal"
      />
      <div className="relative z-10 w-full max-w-2xl mx-4 rounded-xl border border-[#D1D5DB] bg-white shadow-elevated max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-4 border-b border-[#D1D5DB] p-6">
          <h2 className="text-lg font-bold text-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg text-text-muted hover:text-text transition"
            aria-label="Close"
          >
            <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
