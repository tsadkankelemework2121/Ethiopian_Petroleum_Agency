import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'

export default function SettingsPage() {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')
  const [provider, setProvider] = useState<'abstract' | 'google' | 'mapbox'>('abstract')

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Theme + map provider placeholders (frontend-only for now)."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#D1D5DB] bg-white p-4">
          <div className="text-sm font-semibold text-text">Theme</div>
          <div className="mt-2 text-sm text-text-muted">
            This UI uses a light background with a light-cyan primary accent. Later we can add
            density, dark mode, and per-user preferences.
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-slate-900">
              Primary
            </span>
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-strong">
              Primary soft
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-text-muted">
              Surface
            </span>
          </div>

          <div className="mt-5 rounded-xl border border-[#D1D5DB] bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">Table density</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { id: 'comfortable' as const, label: 'Comfortable' },
                { id: 'compact' as const, label: 'Compact' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDensity(opt.id)}
                  className={[
                    'rounded-full px-4 py-2 text-sm font-semibold transition',
                    density === opt.id
                      ? 'bg-primary text-slate-900'
                      : 'bg-muted text-text hover:bg-muted/70',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="mt-3 text-xs text-text-muted">
              Preview: row spacing will be adjustable here later (no functional change yet).
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#D1D5DB] bg-white p-4">
          <div className="text-sm font-semibold text-text">Map provider</div>
          <div className="mt-2 text-sm text-text-muted">
            The app will receive GPS coordinates from the backend. The map component is designed to
            remain provider-agnostic so you can plug in Google Maps later without rewriting pages.
          </div>

          <div className="mt-4 rounded-xl border border-[#D1D5DB] bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">Provider</div>
            <div className="mt-3 grid gap-2">
              {[
                { id: 'abstract' as const, label: 'Abstract (default)', hint: 'Current placeholder implementation' },
                { id: 'google' as const, label: 'Google Maps (future)', hint: 'Pluggable once backend is ready' },
                { id: 'mapbox' as const, label: 'Mapbox (future)', hint: 'Alternative provider option' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#D1D5DB] bg-muted p-3 hover:bg-muted/60"
                >
                  <input
                    type="radio"
                    name="provider"
                    className="mt-1"
                    checked={provider === opt.id}
                    onChange={() => setProvider(opt.id)}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-text">{opt.label}</div>
                    <div className="mt-1 text-xs text-text-muted">{opt.hint}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-text">
              Selected: <span className="font-semibold">{provider}</span>
            </div>
            <div className="mt-2 text-xs text-text-muted">
              When enabling Google Maps later, we’ll read the API key from{' '}
              <span className="font-semibold text-text">VITE_GOOGLE_MAPS_API_KEY</span> and load it only inside the
              `MapView` implementation.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

