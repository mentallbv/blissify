'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'

/**
 * Dashboard banner shown whenever the subscription is not active. Re-triggers
 * Mollie checkout for the user's already-selected tier (stored on the user).
 */
export function SubscriptionBanner({ status, tier }: { status: string; tier: string }) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  if (status === 'active') return null

  const pending = status === 'pending_payment'
  const message = pending
    ? 'Je profiel is nog niet actief. Rond je betaling af om opleidingen te publiceren.'
    : 'Je abonnement is niet actief. Activeer een formule om opleidingen te publiceren.'
  const cta = pending ? 'Rond je betaling af' : 'Abonnement activeren'

  async function start() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/subscription/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tier: tier || 'basis' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.checkoutUrl) throw new Error(data?.error || 'Kon de betaling niet starten.')
      window.location.href = data.checkoutUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis.')
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '0.5px solid var(--blissify-terracotta)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <i className="ti ti-alert-circle" style={{ fontSize: 20, color: 'var(--blissify-terracotta)', flex: 'none' }} />
        <div>
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 14, color: 'var(--text-strong)' }}>{message}</div>
          {error ? <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--status-error)', marginTop: 4 }}>{error}</div> : null}
        </div>
      </div>
      <Button variant="accent" size="sm" onClick={start} disabled={loading}>
        {loading ? 'Bezig…' : cta}
      </Button>
    </div>
  )
}

/** Starts a Mollie checkout for a tier and redirects to the hosted payment page. */
export function CheckoutButton({ tier, label, variant = 'primary' }: { tier: string; label: string; variant?: 'primary' | 'accent' | 'ghost' }) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function start() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/subscription/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tier }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.checkoutUrl) throw new Error(data?.error || 'Kon de betaling niet starten.')
      window.location.href = data.checkoutUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis.')
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant={variant} size="sm" fullWidth onClick={start} disabled={loading}>
        {loading ? 'Bezig…' : label}
      </Button>
      {error ? <span style={{ display: 'block', marginTop: 8, fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--status-error)' }}>{error}</span> : null}
    </>
  )
}

/** Cancels the active Mollie subscription. */
export function CancelButton() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  async function cancel() {
    if (!confirm('Weet je zeker dat je je abonnement wil opzeggen?')) return
    setLoading(true)
    await fetch('/api/subscription/cancel', { method: 'POST', credentials: 'include' }).catch(() => {})
    setLoading(false)
    router.refresh()
  }

  return (
    <Button variant="ghost" onClick={cancel} disabled={loading}>
      {loading ? 'Bezig…' : 'Abonnement opzeggen'}
    </Button>
  )
}
