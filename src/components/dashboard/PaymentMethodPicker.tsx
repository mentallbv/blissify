'use client'

import React from 'react'

export type PaymentMethod = { id: string; description: string; image: string | null }
export type PriceQuote = { rate: number; reverseCharge: boolean; net: string; vat: string; gross: string }
/** Item 13: a valid discount code as previewed by /api/subscription/methods. */
export type DiscountPreview = { code: string; amount: string; full: string; summary: string }
/** Item 14: what switching from the current plan means, from /api/subscription/methods. */
export type PlanChangePreview = {
  kind: 'upgrade' | 'downgrade'
  fromLabel: string
  toLabel: string
  credit: string
  effectiveAt: string | null
  periodEnd: string | null
  renewal: PriceQuote
}

/** Loads the methods available for a plan. Returns `null` while still loading. */
export function usePaymentMethods(
  tier: string,
  billingCycle: 'yearly' | 'monthly',
  enabled = true,
  onPrice?: (price: PriceQuote | null, billingComplete: boolean, discount?: { applied: DiscountPreview | null; error: string | null; change: PlanChangePreview | null }) => void,
  code = '',
) {
  const [methods, setMethods] = React.useState<PaymentMethod[] | null>(null)

  React.useEffect(() => {
    if (!enabled || !tier) return
    let active = true
    setMethods(null)
    fetch(`/api/subscription/methods?tier=${encodeURIComponent(tier)}&billingCycle=${billingCycle}${code ? `&code=${encodeURIComponent(code)}` : ''}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return
        onPrice?.(data?.price || null, data?.billingComplete !== false, { applied: data?.discount || null, error: data?.discountError || null, change: data?.change || null })
        setMethods(Array.isArray(data?.methods) ? data.methods : [])
      })
      .catch(() => {
        // Fall back to Mollie's own picker rather than blocking checkout.
        if (active) setMethods([])
      })
    return () => {
      active = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, billingCycle, enabled, code])

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

const euro = (v: string) => `€ ${Number(v).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/** Excl. btw / btw / total, shown before the user leaves for Mollie. */
export function PriceSummary({ price, billingCycle, discount = null, change = null }: { price: PriceQuote; billingCycle: 'yearly' | 'monthly'; discount?: DiscountPreview | null; change?: PlanChangePreview | null }) {
  const upgrade = change?.kind === 'upgrade' && Number(change.credit) > 0 ? change : null
  const period = billingCycle === 'monthly' ? 'per maand' : 'per jaar'
  const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-body)' }
  return (
    <div style={{ background: 'var(--surface-soft)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', margin: '0 0 12px', display: 'grid', gap: 6 }}>
      {discount ? (
        <>
          <div style={row}><span>Prijs excl. btw</span><span>{euro(discount.full)}</span></div>
          <div style={{ ...row, color: 'var(--status-success)' }}><span>Korting {discount.code}</span><span>− {euro(discount.amount)}</span></div>
        </>
      ) : null}
      {upgrade ? (
        <>
          {!discount ? <div style={row}><span>{upgrade.toLabel} excl. btw</span><span>{euro(upgrade.renewal.net)}</span></div> : null}
          <div style={{ ...row, color: 'var(--status-success)' }}>
            <span>Tegoed {upgrade.fromLabel}{upgrade.periodEnd ? ` (tot ${new Date(upgrade.periodEnd).toLocaleDateString('nl-BE')})` : ''}</span>
            <span>− {euro(upgrade.credit)}</span>
          </div>
        </>
      ) : null}
      <div style={row}><span>{upgrade ? 'Nu te betalen excl. btw' : discount ? 'Na korting excl. btw' : 'Prijs excl. btw'}</span><span>{euro(price.net)}</span></div>
      <div style={row}><span>{price.reverseCharge ? 'Btw verlegd (0%)' : `Btw ${price.rate}%`}</span><span>{euro(price.vat)}</span></div>
      <div style={{ ...row, fontWeight: 'var(--fw-ui-medium)', color: 'var(--text-strong)', borderTop: '0.5px solid var(--border-hairline)', paddingTop: 6 }}>
        <span>{discount || upgrade ? 'Te betalen nu' : `Totaal ${period}`}</span><span>{euro(price.gross)}</span>
      </div>
      {discount ? <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, lineHeight: 1.5, color: 'var(--text-meta)' }}>{discount.summary}.</div> : null}
      {upgrade ? (
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, lineHeight: 1.5, color: 'var(--text-meta)' }}>
          {upgrade.toLabel} start vandaag. Het ongebruikte deel van je huidige periode wordt verrekend. Daarna {euro(upgrade.renewal.gross)} {period} incl. btw.
        </div>
      ) : null}
    </div>
  )
}

/**
 * "Heb je een kortingscode?" (item 13). Collapsed by default; `onApply` gets the
 * normalised code, or "" when the user removes it.
 */
export function DiscountCodeField({
  applied,
  error,
  onApply,
  disabled = false,
}: {
  applied: string
  error?: string | null
  onApply: (code: string) => void
  disabled?: boolean
}) {
  const [open, setOpen] = React.useState(Boolean(applied))
  const [value, setValue] = React.useState(applied)
  const inputId = React.useId()
  const small: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 13 }
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="bl-textlink" style={{ ...small, background: 'none', border: 0, padding: 0, margin: '0 0 12px', cursor: 'pointer' }}>
        Heb je een kortingscode?
      </button>
    )
  }
  const submit = () => onApply(value.trim().toUpperCase().replace(/\s+/g, ''))
  return (
    <div style={{ margin: '0 0 12px' }}>
      <label htmlFor={inputId} style={{ ...small, display: 'block', color: 'var(--text-body)', marginBottom: 6 }}>Kortingscode</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          id={inputId}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              submit()
            }
          }}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-err` : undefined}
          style={{ ...small, flex: 1, minWidth: 0, textTransform: 'uppercase', border: '0.5px solid ' + (error ? 'var(--status-error)' : 'var(--neutral-200)'), borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', padding: '8px 12px', color: 'var(--text-strong)' }}
        />
        {applied && value.trim().toUpperCase() === applied ? (
          <button type="button" disabled={disabled} onClick={() => { setValue(''); onApply('') }} style={{ ...small, border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', padding: '8px 12px', color: 'var(--text-body)', cursor: 'pointer' }}>
            Verwijderen
          </button>
        ) : (
          <button type="button" disabled={disabled || !value.trim()} onClick={submit} style={{ ...small, border: 0, borderRadius: 'var(--radius-sm)', background: 'var(--text-brand)', padding: '8px 14px', color: 'var(--surface-card)', cursor: 'pointer', opacity: disabled || !value.trim() ? 0.5 : 1 }}>
            Toepassen
          </button>
        )}
      </div>
      {error ? <span id={`${inputId}-err`} role="alert" style={{ ...small, fontSize: 12, display: 'block', marginTop: 6, color: 'var(--status-error)' }}>{error}</span> : null}
    </div>
  )
}

/** Item 14: a downgrade only takes effect at the end of the paid period, so nothing is charged now. */
export function DowngradeNotice({ change, billingCycle }: { change: PlanChangePreview; billingCycle: 'yearly' | 'monthly' }) {
  const date = change.effectiveAt ? new Date(change.effectiveAt).toLocaleDateString('nl-BE') : 'het einde van je periode'
  return (
    <div style={{ background: 'var(--surface-soft)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', margin: '0 0 12px', fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.6, color: 'var(--text-body)' }}>
      <strong style={{ fontWeight: 'var(--fw-ui-medium)', color: 'var(--text-strong)' }}>Je betaalt nu niets.</strong>{' '}
      Op {date} stap je over van {change.fromLabel} naar {change.toLabel}. Tot dan behoud je alles van {change.fromLabel}. Daarna betaal je {euro(change.renewal.gross)} {billingCycle === 'monthly' ? 'per maand' : 'per jaar'} incl. btw.
      <span style={{ display: 'block', marginTop: 6, fontSize: 12, color: 'var(--text-meta)' }}>Heb je dan meer publicaties online dan {change.toLabel} toelaat, dan gaan de oudste offline.</span>
    </div>
  )
}
