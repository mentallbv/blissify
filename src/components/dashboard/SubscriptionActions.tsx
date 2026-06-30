'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'

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
