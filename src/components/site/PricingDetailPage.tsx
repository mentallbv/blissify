import React from 'react'
import { SiteChrome } from '@/components/site/SiteChrome'
import { PricingPlans } from '@/components/site/PricingPlans'
import { ButtonLink } from '@/components/ui'
import type { PricingCatalog } from '@/lib/pricing'
import { CtaPanel } from '@/components/site/CtaPanel'

export function PricingDetailPage({
  catalog,
  audience,
}: {
  catalog: PricingCatalog
  audience: 'opleiders' | 'brands'
}) {
  const data = catalog[audience]
  const cell: React.CSSProperties = {
    padding: '16px 20px',
    fontFamily: 'var(--font-ui)',
    fontSize: 14,
    color: 'var(--text-body)',
    textAlign: 'center',
    borderTop: '0.5px solid var(--border-hairline)',
  }

  return (
    <SiteChrome>
      <section className="bl-container bl-page-hero" style={{ paddingTop: 80, paddingBottom: 48, textAlign: 'center' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {/* Both plan families on one page (copy 10/2026). Links rather than
              client state, so the intro and comparison switch with the cards. */}
          <nav aria-label="Kies je categorie" style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
            {([
              ['opleiders', 'Salons & professionals', '/abonnementen-tarieven'],
              ['brands', 'Merken & leveranciers', '/abonnementen-tarieven?voor=merken'],
            ] as const).map(([key, label, href]) => {
              const on = audience === key
              return (
                <a
                  key={key}
                  href={href}
                  aria-current={on ? 'page' : undefined}
                  style={{
                    border: '1px solid ' + (on ? 'var(--palette-slate-ink)' : 'var(--border-strong)'),
                    borderRadius: 'var(--radius-pill)',
                    background: on ? 'var(--palette-slate-ink)' : 'rgba(255, 255, 255, 0.6)',
                    color: on ? '#fff' : 'var(--palette-slate-ink)',
                    padding: '10px 18px',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 'var(--fw-ui-medium)',
                    fontSize: 13,
                    textDecoration: 'none',
                  }}
                >
                  {label}
                </a>
              )
            })}
          </nav>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 'var(--type-label)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-accent)' }}>
            {data.intro.eyebrow}
          </span>
          <h1 className="bl-page-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 56, lineHeight: 1.05, color: 'var(--text-brand)', margin: '16px 0 0', textWrap: 'balance' }}>
            {data.intro.title}
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 18, lineHeight: 1.7, color: 'var(--text-body)', margin: '18px auto 0', maxWidth: 620 }}>
            {data.intro.subtitle}
          </p>
        </div>
      </section>

      <section className="bl-container" style={{ paddingTop: 0, paddingBottom: 24 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <PricingPlans catalog={{ opleiders: catalog.opleiders, brands: catalog.brands }} billing={catalog.billing} initialAudience={audience} />
        </div>
      </section>

      <section className="bl-container" style={{ paddingTop: 48, paddingBottom: 0 }}>
        <div className="bl-comparison-scroll" style={{ maxWidth: 1100, margin: '0 auto', overflowX: 'auto' }}>
          <div style={{ minWidth: 680, border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--surface-card)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', background: 'var(--surface-page)', borderBottom: '0.5px solid var(--border-hairline)' }}>
              {['Functie', data.comparison.col1, data.comparison.col2, data.comparison.col3].map((heading, index) => (
                <div key={heading} style={{ padding: '14px 20px', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: index === 0 ? 11 : 13, textTransform: index === 0 ? 'uppercase' : 'none', letterSpacing: index === 0 ? '0.1em' : 0, color: index === 0 ? 'var(--text-meta)' : 'var(--text-strong)', textAlign: index === 0 ? 'left' : 'center' }}>
                  {heading}
                </div>
              ))}
            </div>
            {data.comparison.rows.map((row) => (
              <div key={row.feature} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                <div style={{ ...cell, textAlign: 'left', color: 'var(--text-strong)' }}>{row.feature}</div>
                <div style={cell}>{row.v1 || '–'}</div>
                <div style={cell}>{row.v2 || '–'}</div>
                <div style={cell}>{row.v3 || '–'}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ marginTop: 64 }} />
      <CtaPanel title={data.bottomCta.title} body={data.bottomCta.body} href={data.bottomCta.buttonUrl || '/registreren'} label={data.bottomCta.buttonLabel} />
    </SiteChrome>
  )
}
