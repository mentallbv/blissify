'use client'

import React from 'react'

export type PaymentMethod = { id: string; description: string; image: string | null }

/** Loads the methods available for a plan. Returns `null` while still loading. */
export function usePaymentMethods(tier: string, billingCycle: 'yearly' | 'monthly', enabled = true) {
  const [methods, setMethods] = React.useState<PaymentMethod[] | null>(null)

  React.useEffect(() => {
    if (!enabled || !tier) return
    let active = true
    setMethods(null)
    fetch(`/api/subscription/methods?tier=${encodeURIComponent(tier)}&billingCycle=${billingCycle}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (active) setMethods(Array.isArray(data?.methods) ? data.methods : [])
      })
      .catch(() => {
        // Fall back to Mollie's own picker rather than blocking checkout.
        if (active) setMethods([])
      })
    return () => {
      active = false
    }
  }, [tier, billingCycle, enabled])

  return methods
}

/**
 * Lets the user pick their payment method before leaving for Mollie. Renders
 * nothing when only one method exists or none could be loaded - in both cases
 * the hosted checkout page handles the choice.
 */
export function PaymentMethodPicker({
  methods,
  value,
  onChange,
}: {
  methods: PaymentMethod[] | null
  value: string | null
  onChange: (id: string | null) => void
}) {
  if (!methods || methods.length < 2) return null

  return (
    <fieldset style={{ border: 0, margin: '0 0 16px', padding: 0 }}>
      <legend
        style={{
          fontFamily: 'var(--font-ui)',
          fontWeight: 'var(--fw-ui-medium)',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--text-meta)',
          padding: 0,
          marginBottom: 10,
        }}
      >
        Betaalmethode
      </legend>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {methods.map((method) => {
          const selected = value === method.id
          return (
            <label
              key={method.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-card)',
                border: '0.5px solid ' + (selected ? 'var(--blissify-forest)' : 'var(--border-hairline)'),
                fontFamily: 'var(--font-ui)',
                fontSize: 13,
                color: 'var(--text-body)',
              }}
            >
              <input
                type="radio"
                name="mollie-method"
                value={method.id}
                checked={selected}
                onChange={() => onChange(method.id)}
                style={{ margin: 0, accentColor: 'var(--blissify-forest)' }}
              />
              {method.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={method.image} alt="" width={24} height={24} style={{ display: 'block', borderRadius: 3 }} />
              ) : null}
              {method.description}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
