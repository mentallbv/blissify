import React from 'react'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'

// Feedback round 4, item 8.1: disclaimer text by Lonne, two templates (BE / NL).
export const metadata: Metadata = {
  title: 'Modelhuurovereenkomst voor een werkruimte',
  description: 'Download de modelhuurovereenkomst van Blissify voor het verhuren van een professionele werkruimte in België of Nederland.',
}

const DOCS = [
  { country: 'België', href: '/documenten/modelhuurovereenkomst-belgie.pdf' },
  { country: 'Nederland', href: '/documenten/modelhuurovereenkomst-nederland.pdf' },
]

const p: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.75, color: 'var(--text-body)', margin: '0 0 16px', textWrap: 'pretty' }

export default function ModelhuurovereenkomstPage() {
  return (
    <SiteChrome>
      <section className="bl-page-head">
        <div className="bl-container" style={{ paddingTop: 64, paddingBottom: 48 }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 'var(--type-label)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-accent)' }}>Werkruimtes</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 'clamp(30px, 4vw, 40px)', lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: '10px 0 0', textWrap: 'balance' }}>
            Modelhuurovereenkomst
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-body)', margin: '12px 0 0', maxWidth: 680 }}>
            Een voorbeeldovereenkomst voor het verhuren van een professionele werkruimte, voor België en voor Nederland.
          </p>
        </div>
      </section>

      <div className="bl-container" style={{ paddingTop: 48, paddingBottom: 96 }}>
        <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: 'clamp(24px, 4vw, 40px)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 24, lineHeight: 1.2, color: 'var(--text-brand)', margin: '0 0 18px', display: 'flex', gap: 10, alignItems: 'baseline' }}>
            <i className="ti ti-alert-circle" aria-hidden="true" style={{ color: 'var(--blissify-terracotta)', fontSize: 22 }} />
            Belangrijk – lees dit voordat je de overeenkomst gebruikt
          </h2>
          <p style={p}>Deze modelovereenkomst wordt door Blissify uitsluitend aangeboden als voorbeeld en praktisch vertrekpunt voor het vastleggen van afspraken tussen een verhuurder en een huurder van een professionele werkruimte.</p>
          <p style={p}>Het document vormt geen juridisch, fiscaal of boekhoudkundig advies en is geen officieel goedgekeurde of voor iedere situatie juridisch geschikte overeenkomst.</p>
          <p style={p}>Elke huursituatie en samenwerking is anders. Wij raden daarom aan om de overeenkomst vóór ondertekening te laten nakijken en waar nodig aan te passen door een jurist, advocaat of andere bevoegde deskundige. Bij zelfstandige samenwerkingen is het bovendien belangrijk rekening te houden met de regelgeving rond schijnzelfstandigheid.</p>
          <p style={p}>Blissify is geen partij bij de overeenkomst en is niet betrokken bij de onderhandelingen, afspraken of uitvoering ervan. De betrokken partijen blijven zelf verantwoordelijk voor de inhoud van hun overeenkomst en de naleving van de toepasselijke wetgeving.</p>
          <p style={{ ...p, marginBottom: 0 }}>Blissify aanvaardt, voor zover wettelijk toegestaan, geen aansprakelijkheid voor schade die voortvloeit uit het gebruik van deze modelovereenkomst.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 24 }}>
          {DOCS.map((d) => (
            <a key={d.country} href={d.href} target="_blank" rel="noopener" className="bl-listrow" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 22px', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', textDecoration: 'none' }}>
              <i className="ti ti-file-type-pdf" aria-hidden="true" style={{ fontSize: 28, color: 'var(--blissify-terracotta)' }} />
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 15, color: 'var(--text-brand)' }}>Modelhuurovereenkomst {d.country}</span>
                <span style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-meta)', marginTop: 2 }}>PDF · openen of downloaden</span>
              </span>
              <i className="ti ti-download" aria-hidden="true" style={{ fontSize: 20, color: 'var(--text-brand)' }} />
            </a>
          ))}
        </div>
      </div>
    </SiteChrome>
  )
}
