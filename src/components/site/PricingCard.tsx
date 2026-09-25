import React from 'react'
import { InfoTooltip } from '@/components/site/InfoTooltip'
import { glossaryFor } from '@/lib/pricing-glossary'

export type PricingCardTier = {
  name: string
  tagline?: string
  price: string
  period: string
  features: string[]
  recommended?: boolean
}

/**
 * Shared pricing tier card - the single source of truth for the tier visual
 * used on /prijzen and in the onboarding tier-selection step. The CTA (a link
 * on /prijzen, an action button in onboarding) is passed in as `cta`.
 */
export function PricingCard({ tier, cta }: { tier: PricingCardTier; cta: React.ReactNode }) {
  return (
    <div style={{ border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', overflow: 'hidden' }}>
      {tier.recommended ? (
        <div style={{ background: 'var(--blissify-terracotta)', color: '#fff', textAlign: 'center', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 'var(--type-label)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: 7 }}>
          Aanbevolen
        </div>
      ) : null}
      <div style={{ padding: '32px 28px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)' }}>{tier.name}</div>
        {tier.tagline ? (
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 'var(--type-sm)', color: 'var(--text-meta)', marginTop: 2 }}>{tier.tagline}</div>
        ) : null}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '20px 0 24px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 48, lineHeight: 1, letterSpacing: '-0.01em', color: 'var(--text-brand)' }}>{tier.price}</span>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 14, color: 'var(--text-meta)' }}>{tier.period}</span>
        </div>
        {tier.features.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {tier.features.map((f) => {
              const info = glossaryFor(f)
              return (
                <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 14, color: 'var(--text-body)', lineHeight: 1.5 }}>
                  <i className="ti ti-check" style={{ fontSize: 17, color: 'var(--text-accent)', flex: 'none', marginTop: 1 }} />
                  <span>
                    {f}
                    {info ? <InfoTooltip text={info} label={f} /> : null}
                  </span>
                </div>
              )
            })}
          </div>
        ) : null}
        {cta}
      </div>
    </div>
  )
}
