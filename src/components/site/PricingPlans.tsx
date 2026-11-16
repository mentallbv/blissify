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
      {allowAudienceSwitch ? (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
          {([
            ['opleiders', 'Salons & professionals'],
            ['brands', 'Merken & leveranciers'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setAudience(key)}
              style={{
                border: '1px solid ' + (audience === key ? 'var(--palette-slate-ink)' : 'var(--border-strong)'),
                borderRadius: 'var(--radius-pill)',
                background: audience === key ? 'var(--palette-slate-ink)' : 'rgba(255, 255, 255, 0.6)',
                color: audience === key ? '#fff' : 'var(--palette-slate-ink)',
                padding: '10px 18px',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
                fontWeight: 'var(--fw-ui-medium)',
                fontSize: 13,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      {monthlyAvailable ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <div role="radiogroup" aria-label="Betaalperiode" className="bl-cycle-toggle">
            {([['monthly', 'Maandelijks'], ['yearly', 'Jaarlijks']] as const).map(([key, label]) => (
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
          return (
            <div key={tier.key} className="bl-pricing-card" style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 14, color: 'var(--text-strong)' }}>{tier.name}</span>
                {tier.recommended ? <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff', background: 'var(--blissify-terracotta)', borderRadius: 999, padding: '3px 9px' }}>Aanbevolen</span> : null}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '14px 0 6px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 48, color: 'var(--text-brand)' }}>{euro(amount)}</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)' }}>/maand excl. btw</span>
              </div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, lineHeight: 1.5, color: 'var(--text-meta)', margin: '0 0 14px', minHeight: 18 }}>
                {effectiveCycle === 'yearly'
                  ? <>Jaarlijkse facturatie.{saving ? <> <span style={{ color: 'var(--text-accent)', fontWeight: 'var(--fw-ui-medium)' }}>Bespaar {euro(saving)} per jaar.</span></> : null}</>
                  : 'Maandelijkse facturatie, maandelijks opzegbaar.'}
              </p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.6, color: 'var(--text-body)', minHeight: 44 }}>{tier.desc}</p>
              <ButtonLink href={compact ? detailHref : `/registreren?type=${audience === 'brands' ? 'brand' : 'trainer'}&tier=${tier.key}&billing=${effectiveCycle}`} variant={tier.recommended ? 'accent' : 'primary'} fullWidth>
                {compact ? 'Bekijk alle details' : `Kies ${tier.name}`}
              </ButtonLink>
              <div style={{ height: 1, background: 'var(--border-hairline)', margin: '22px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tier.features.slice(0, compact ? 3 : tier.features.length).map((feature) => {
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
