import React from 'react'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'
import { ButtonLink } from '@/components/ui'
import { getPricing } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Prijzen voor opleiders - Blissify abonnementen',
  description:
    'Eenvoudige, jaarlijkse abonnementen voor wellness opleiders op Blissify. Basis, Medium en Premium. Onbeperkte opleidingen, directe leads.',
}

export default async function PrijzenPage() {
  const { intro, tiers, comparison, bottomCta } = await getPricing()
  const cell: React.CSSProperties = { padding: '16px 20px', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 14, color: 'var(--text-body)', textAlign: 'center', borderTop: '0.5px solid var(--border-hairline)' }

  return (
    <SiteChrome>
      {/* HERO */}
      <section className="bl-container" style={{ paddingTop: 80, paddingBottom: 48, textAlign: 'center' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 'var(--type-label)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-accent)' }}>{intro.eyebrow}</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 56, lineHeight: 1.05, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: '16px 0 0', textWrap: 'balance' }}>
            {intro.title}
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 18, lineHeight: 1.7, color: 'var(--text-body)', margin: '18px auto 0', maxWidth: 520 }}>
            {intro.subtitle}
          </p>
        </div>
      </section>

      {/* TIERS */}
      <section className="bl-container" style={{ paddingTop: 0, paddingBottom: 24 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="bl-cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'start' }}>
          {tiers.map((t) => (
            <div key={t.key} style={{ border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', overflow: 'hidden' }}>
              {t.recommended ? (
                <div style={{ background: 'var(--blissify-terracotta)', color: '#fff', textAlign: 'center', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 'var(--type-label)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: 7 }}>
                  Aanbevolen
                </div>
              ) : null}
              <div style={{ padding: '32px 28px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, color: 'var(--text-brand)' }}>{t.name}</div>
                {t.tagline ? <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 'var(--type-sm)', color: 'var(--text-meta)', marginTop: 2 }}>{t.tagline}</div> : null}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '20px 0 24px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 48, lineHeight: 1, letterSpacing: '-0.01em', color: 'var(--text-brand)' }}>{t.price}</span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 14, color: 'var(--text-meta)' }}>{t.period}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {t.features.map((f) => (
                    <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 14, color: 'var(--text-body)', lineHeight: 1.5 }}>
                      <i className="ti ti-check" style={{ fontSize: 17, color: 'var(--text-accent)', flex: 'none', marginTop: 1 }} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <ButtonLink href="/inloggen" variant={t.recommended ? 'accent' : 'primary'} fullWidth>
                  Kies {t.name}
                </ButtonLink>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="bl-container" style={{ paddingTop: 48, paddingBottom: 0 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--surface-card)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', background: 'var(--surface-page)', borderBottom: '0.5px solid var(--border-hairline)' }}>
            {['Functie', comparison.col1, comparison.col2, comparison.col3].map((h, k) => (
              <div key={k} style={{ padding: '14px 20px', fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: k === 0 ? 11 : 13, textTransform: k === 0 ? 'uppercase' : 'none', letterSpacing: k === 0 ? '0.1em' : '0', color: k === 0 ? 'var(--text-meta)' : 'var(--text-strong)', textAlign: k === 0 ? 'left' : 'center' }}>
                {h}
              </div>
            ))}
          </div>
          {comparison.rows.map((r) => (
            <div key={r.feature} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
              <div style={{ ...cell, textAlign: 'left', color: 'var(--text-strong)' }}>{r.feature}</div>
              <div style={cell}>{r.v1 || '–'}</div>
              <div style={cell}>{r.v2 || '–'}</div>
              <div style={cell}>{r.v3 || '–'}</div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ background: 'var(--surface-dark)', marginTop: 88 }}>
        <div className="bl-container" style={{ paddingTop: 80, paddingBottom: 96 }}>
        <div style={{ maxWidth: 920, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 44, letterSpacing: '-0.01em', color: 'var(--blissify-chalk)', lineHeight: 1.1, margin: 0 }}>
            {bottomCta.title}
          </h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 16, lineHeight: 1.7, color: 'rgba(245,240,234,0.7)', margin: '16px auto 28px', maxWidth: 480 }}>
            {bottomCta.body}
          </p>
          <ButtonLink href={bottomCta.buttonUrl || '/inloggen'} variant="accent">
            {bottomCta.buttonLabel}
          </ButtonLink>
        </div>
        </div>
      </section>
    </SiteChrome>
  )
}
