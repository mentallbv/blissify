'use client'

import React from 'react'
import { ButtonLink } from '@/components/ui'
import { InfoTooltip } from '@/components/site/InfoTooltip'
import { glossaryFor } from '@/lib/pricing-glossary'
import { type BillingSettings, type PricingData, perMonth, yearlySaving, euro } from '@/lib/pricing'

type Audience = 'opleiders' | 'brands'

export function PricingPlans({
  catalog,
  billing,
  initialAudience = 'opleiders',
  allowAudienceSwitch = false,
  compact = false,
}: {
  catalog: { opleiders: PricingData; brands: PricingData }
  billing: BillingSettings
  initialAudience?: Audience
  allowAudienceSwitch?: boolean
  compact?: boolean
}) {
  const [audience, setAudience] = React.useState<Audience>(initialAudience)
  const [cycle, setCycle] = React.useState<'yearly' | 'monthly'>('yearly')
  const data = catalog[audience]
  // Lonne, Nov 2026: always a price per month; the toggle switches between monthly billing and the cheaper yearly rate.
  const monthlyAvailable = billing.monthlyEnabled
  const detailHref = audience === 'brands' ? '/abonnementen-tarieven?voor=merken' : '/abonnementen-tarieven'

  return (
    <>
      {/* Two different controls, two different looks: "for whom" are tabs, "how you pay" is a small switch. */}
      {allowAudienceSwitch ? (
        <div role="tablist" aria-label="Abonnementen voor" className="bl-audience-tabs">
          {([
            ['opleiders', 'Salons & professionals'],
            ['brands', 'Merken & leveranciers'],
          ] as const).map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={audience === key} onClick={() => setAudience(key)} className={audience === key ? 'is-on' : undefined}>
              {label}
            </button>
          ))}
        </div>
      ) : null}

      {monthlyAvailable ? (
        <div className="bl-cycle-row">
          <span className="bl-cycle-label" id="bl-cycle-label">Hoe wil je betalen?</span>
          <div role="radiogroup" aria-labelledby="bl-cycle-label" className="bl-cycle-toggle">
            {([['monthly', 'Per maand'], ['yearly', 'Per jaar']] as const).map(([key, label]) => (
              <button key={key} type="button" role="radio" aria-checked={cycle === key} onClick={() => setCycle(key)} className={cycle === key ? 'is-on' : undefined}>
                {label}
                {key === 'yearly' ? <span className="bl-cycle-badge">Voordeligst</span> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="bl-cat-grid bl-pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'stretch' }}>
        {data.tiers.map((tier) => {
          const effectiveCycle = monthlyAvailable ? cycle : 'yearly'
          const amount = perMonth(tier, effectiveCycle)
          const saving = yearlySaving(tier)
          const monthlyRate = perMonth(tier, 'monthly')
          const showWas = effectiveCycle === 'yearly' && monthlyAvailable && monthlyRate > amount
          return (
            <div key={tier.key} className="bl-pricing-card" style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 14, color: 'var(--text-strong)' }}>{tier.name}</span>
                {tier.recommended ? <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff', background: 'var(--blissify-terracotta)', borderRadius: 999, padding: '3px 9px' }}>Aanbevolen</span> : null}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '14px 0 2px', flexWrap: 'wrap' }}>
                {showWas ? <s className="bl-price-was" aria-label={`Was ${euro(monthlyRate)} per maand`}>{euro(monthlyRate)}</s> : null}
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 48, lineHeight: 1, color: 'var(--text-brand)' }}>{euro(amount)}</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)' }}>per maand</span>
              </div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-meta)', margin: '0 0 12px' }}>excl. btw</p>
              <div className="bl-price-terms">
                {effectiveCycle === 'yearly' ? (
                  <>
                    <span>Jaarlijks betaald</span>
                    {saving ? <span className="bl-price-save">Je bespaart {euro(saving)} per jaar</span> : null}
                  </>
                ) : (
                  <span>Maandelijks betaald, maandelijks opzegbaar</span>
                )}
              </div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.6, color: 'var(--text-body)', minHeight: 44 }}>{tier.desc}</p>
              <ButtonLink href={compact ? detailHref : `/registreren?type=${audience === 'brands' ? 'brand' : 'trainer'}&tier=${tier.key}&billing=${effectiveCycle}`} variant={tier.recommended ? 'accent' : 'primary'} fullWidth>
                {compact ? 'Bekijk alle details' : `Kies ${tier.name}`}
              </ButtonLink>
              <div style={{ height: 1, background: 'var(--border-hairline)', margin: '22px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tier.features.map((feature) => {
                  const info = glossaryFor(feature)
                  return (
                    <div key={feature} style={{ display: 'flex', gap: 9, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-body)' }}>
                      <i className="ti ti-check" style={{ color: 'var(--text-accent)', flex: 'none', marginTop: 1 }} />
                      <span>
                        {feature}
                        {info ? <InfoTooltip text={info} label={feature} /> : null}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
