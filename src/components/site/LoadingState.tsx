import React from 'react'

/** Loading state (copy 10/2026, "Zoekresultaten en foutmeldingen"). */
export function LoadingState() {
  return (
    <div role="status" aria-live="polite" style={{ padding: '120px 24px', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text-meta)' }}>
      We zoeken het aanbod voor je…
    </div>
  )
}
