import React from 'react'
import { Button } from '@/components/ui'

/**
 * User-facing error card. Shows a friendly Dutch message (never raw API/JSON
 * text) with an alert icon and an optional retry action.
 */
export function FormErrorCard({
  message = 'Er ging iets mis. Probeer het opnieuw of neem contact op als het probleem aanhoudt.',
  onRetry,
  retryLabel = 'Probeer opnieuw',
}: {
  message?: string
  onRetry?: () => void
  retryLabel?: string
}) {
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '0.5px solid var(--blissify-terracotta)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
      }}
    >
      <i className="ti ti-alert-circle" style={{ fontSize: 22, color: 'var(--blissify-terracotta)', flex: 'none', marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 14, lineHeight: 1.6, color: 'var(--text-strong)' }}>
          {message}
        </div>
        {onRetry ? (
          <div style={{ marginTop: 14 }}>
            <Button variant="primary" size="sm" onClick={onRetry}>
              {retryLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
