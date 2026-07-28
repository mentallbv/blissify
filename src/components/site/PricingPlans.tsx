'use client'

import React from 'react'
import { ButtonLink } from '@/components/ui'
import { monthlyPrice, type BillingSettings, type PricingData } from '@/lib/pricing'

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
  const detailHref = audience === 'brands' ? '/prijzen/merken-leveranciers' : '/prijzen/opleiders'

  return (
    <>
      {allowAudienceSwitch ? (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
          {([
            ['opleiders', 'Opleiders'],
            ['brands', 'Merken & Leveranciers'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setAudience(key)}
              style={{
                border: '0.5px solid var(--border-hairline)',
                borderRadius: 'var(--radius-pill)',
                background: audience === key ? 'var(--surface-dark)' : 'var(--surface-card)',
                color: audience === key ? 'var(--blissify-chalk)' : 'var(--text-body)',
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

      {billing.monthlyEnabled ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <button type="button" onClick={() => setCycle('yearly')} className={cycle === 'yearly' ? 'bl-textlink' : undefined} style={{ border: 0, background: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', color: cycle === 'yearly' ? 'var(--text-brand)' : 'var(--text-meta)' }}>
            Jaarlijks
          </button>
          <button type="button" onClick={() => setCycle('monthly')} className={cycle === 'monthly' ? 'bl-textlink' : undefined} style={{ border: 0, background: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', color: cycle === 'monthly' ? 'var(--text-brand)' : 'var(--text-meta)' }}>
            Maandelijks
          </button>
          {cycle === 'monthly' ? (
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-accent)' }}>+{billing.monthlyMarkupPercent}%</span>
          ) : null}
        </div>
      ) : null}

      <div className="bl-cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'start' }}>
        {data.tiers.map((tier) => {
          const annual = tier.annualPrice || Number(tier.price.replace(/[^\d]/g, ''))
          const amount = cycle === 'monthly' ? monthlyPrice(annual, billing.monthlyMarkupPercent) : annual
          const formatted = amount.toLocaleString('nl-BE', { minimumFractionDigits: cycle === 'monthly' ? 2 : 0, maximumFractionDigits: 2 })
          return (
            <div key={tier.key} style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 14, color: 'var(--text-strong)' }}>{tier.name}</span>
                {tier.recommended ? <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff', background: 'var(--blissify-terracotta)', borderRadius: 999, padding: '3px 9px' }}>Aanbevolen</span> : null}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '14px 0 6px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 48, color: 'var(--text-brand)' }}>€ {formatted}</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)' }}>{cycle === 'monthly' ? '/maand' : '/jaar'}</span>
              </div>
              {cycle === 'monthly' ? (
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-meta)', margin: '0 0 12px' }}>
                  {billing.monthlyCommitment === 'annual' ? '12 maanden commitment, maandelijks betaald' : 'Maandelijks opzegbaar'}
                </p>
              ) : null}
              {billing.trialEnabled ? <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 12, color: 'var(--text-accent)', margin: '0 0 12px' }}>{billing.trialDays} dagen gratis proberen</p> : null}
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.6, color: 'var(--text-body)', minHeight: 44 }}>{tier.desc}</p>
              <ButtonLink href={compact ? detailHref : `/registreren?type=${audience === 'brands' ? 'brand' : 'trainer'}&tier=${tier.key}&billing=${cycle}`} variant={tier.recommended ? 'accent' : 'primary'} fullWidth>
                {compact ? 'Bekijk alle details' : `Kies ${tier.name}`}
              </ButtonLink>
              <div style={{ height: 1, background: 'var(--border-hairline)', margin: '22px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tier.features.slice(0, compact ? 3 : tier.features.length).map((feature) => (
                  <div key={feature} style={{ display: 'flex', gap: 9, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-body)' }}>
                    <i className="ti ti-check" style={{ color: 'var(--text-accent)' }} />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
