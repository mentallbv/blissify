'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { PaymentMethodPicker, usePaymentMethods } from '@/components/dashboard/PaymentMethodPicker'

/**
 * Dashboard banner shown whenever the subscription is not active. Re-triggers
 * Mollie checkout for the user's already-selected tier (stored on the user).
 */
export function SubscriptionBanner({
  status,
  tier,
  entitledUntil = null,
}: {
  status: string
  tier: string
  /** Set when a cancelled subscription is still inside its paid period. */
  entitledUntil?: string | null
}) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  if (status === 'active') return null

  const pending = status === 'pending_payment'
  const message = entitledUntil
    ? `Je abonnement is opgezegd. Je opleidingen blijven online tot ${new Date(entitledUntil).toLocaleDateString('nl-BE')}; daarna gaan ze offline.`
    : pending
      ? 'Je profiel is nog niet actief. Rond je betaling af om opleidingen te publiceren.'
      : 'Je abonnement is niet actief. Activeer een formule om opleidingen te publiceren.'
  const cta = entitledUntil ? 'Opnieuw abonneren' : pending ? 'Rond je betaling af' : 'Abonnement activeren'

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
export function CheckoutButton({
  tier,
  label,
  billingCycle = 'yearly',
  variant = 'primary',
}: {
  tier: string
  label: string
  billingCycle?: 'yearly' | 'monthly'
  variant?: 'primary' | 'accent' | 'ghost'
}) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [method, setMethod] = React.useState<string | null>(null)
  // Methods are only fetched once this tier is chosen, so a page full of tier
  // cards does not fire a request per card.
  const [armed, setArmed] = React.useState(false)
  const methods = usePaymentMethods(tier, billingCycle, armed)
  const choosing = armed && methods !== null && methods.length > 1

  // Nothing to choose between -> let Mollie's hosted checkout handle it.
  React.useEffect(() => {
    if (armed && methods !== null && methods.length < 2) void start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed, methods])

  async function start() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/subscription/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tier, billingCycle, method }),
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
      {choosing ? <PaymentMethodPicker methods={methods} value={method} onChange={setMethod} /> : null}
      <Button
        variant={variant}
        size="sm"
        fullWidth
        onClick={choosing ? start : () => setArmed(true)}
        disabled={loading || (armed && !choosing) || (choosing && !method)}
      >
        {loading || (armed && !choosing) ? 'Bezig…' : choosing ? 'Doorgaan naar betaling' : label}
      </Button>
      {error ? <span style={{ display: 'block', marginTop: 8, fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--status-error)' }}>{error}</span> : null}
    </>
  )
}

/** Cancels the active Mollie subscription. */
export function CancelButton({ inTrial = false, entitledUntil = null }: { inTrial?: boolean; entitledUntil?: string | null }) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function cancel() {
    const question = inTrial
      ? 'Je proefperiode stopt meteen en er wordt niets afgerekend. Wil je doorgaan?'
      : entitledUntil
        ? `Je abonnement wordt niet verlengd. Je opleidingen blijven online tot ${new Date(entitledUntil).toLocaleDateString('nl-BE')}. Wil je doorgaan?`
        : 'Weet je zeker dat je je abonnement wil opzeggen?'
    if (!confirm(question)) return
    setLoading(true)
    setError(null)
    const response = await fetch('/api/subscription/cancel', { method: 'POST', credentials: 'include' }).catch(() => null)
    const data = await response?.json().catch(() => ({}))
    if (!response?.ok) setError(data?.error || 'Annuleren is niet gelukt.')
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <Button variant="ghost" onClick={cancel} disabled={loading}>
        {loading ? 'Bezig…' : inTrial ? 'Proefperiode stoppen' : 'Abonnement opzeggen'}
      </Button>
      {error ? <span style={{ display: 'block', marginTop: 8, fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--status-error)' }}>{error}</span> : null}
    </>
  )
}
