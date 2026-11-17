import React from 'react'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'
import { ComplaintForm } from '@/components/site/ComplaintForm'

// Meeting Nov 2026, item 7: public complaints page (providers also have "Suggesties & klachten" in their dashboard).
export const metadata: Metadata = {
  title: 'Klacht indienen',
  description: 'Heb je een klacht over Blissify, een aanbieder of een publicatie? Laat het ons weten via het klachtenformulier.',
}

export default function KlachtenPage() {
  return (
    <SiteChrome>
      <section className="bl-container bl-page-hero" style={{ paddingTop: 88, paddingBottom: 96 }}>
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'start' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 'var(--type-label)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-accent)' }}>Klachten</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 'clamp(36px, 5vw, 52px)', lineHeight: 1.05, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: '16px 0 0', textWrap: 'balance' }}>
              Een klacht indienen.
            </h1>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', maxWidth: 460, margin: '22px 0 0' }}>
              Ging er iets mis met Blissify, een aanbieder of een publicatie? Laat het ons weten. We lezen elke klacht en nemen zo snel mogelijk contact met je op.
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, lineHeight: 1.7, color: 'var(--text-meta)', maxWidth: 460, margin: '16px 0 0' }}>
              Blissify brengt aanbieders en professionals samen, maar is geen partij bij de afspraken tussen jou en een aanbieder. Bij een klacht over een aanbieder bekijken we of de publicatie aan onze regels voldoet. Een gewone vraag stel je via de <a href="/contact" className="bl-textlink">contactpagina</a>.
            </p>
          </div>
          <ComplaintForm />
        </div>
      </section>
    </SiteChrome>
  )
}
