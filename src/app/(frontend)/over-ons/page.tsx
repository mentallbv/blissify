import React from 'react'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'
import { ButtonLink } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Over Blissify - De Europese standaard voor wellnessopleiding',
  description:
    'Blissify is het toonaangevende platform voor professionele wellnessopleidingen in België en Europa. Ontdek onze missie, aanpak en het team achter het platform.',
}

const POINTS = [
  ['Curatorisch, niet algoritmisch', 'Elke opleider wordt handmatig geverifieerd voor publicatie.'],
  ['Professioneel, niet spiritueel', 'Blissify is een vakplatform, geen wellnessapp.'],
  ['Transparant', 'Prijs, duur, erkenning en locatie staan altijd vermeld.'],
  ['Europees', 'Gebouwd in België, schaalbaar naar Nederland en verder.'],
]

export default function OverOnsPage() {
  return (
    <SiteChrome>
      {/* HERO */}
      <section style={{ maxWidth: 920, margin: '0 auto', padding: '96px 32px 64px' }}>
        <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-medium)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-accent)' }}>Over Blissify</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 60, lineHeight: 1.05, letterSpacing: '-0.01em', color: 'var(--text-brand)', margin: '18px 0 0', textWrap: 'balance' }}>
          De Europese standaard voor wellnessopleiding.
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 18, lineHeight: 1.7, color: 'var(--text-body)', maxWidth: 680, margin: '24px 0 0' }}>
          Blissify is gebouwd voor de professional. Het platform dat de wellness- en beautysector serieus neemt, met
          gecureerde opleidingen, geverifieerde opleiders en de duidelijkheid die studenten verdienen.
        </p>
      </section>

      {/* AEO definition */}
      <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)', borderBottom: '0.5px solid var(--border-hairline)' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', padding: '56px 32px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 26, lineHeight: 1.4, color: 'var(--text-brand)', margin: 0 }}>
            Blissify is een Belgisch discovery-platform dat cursisten verbindt met professionele wellness- en
            beauty-opleiders, met een gecureerd overzicht van erkende opleidingen in massage, nagelstyliste,
            schoonheidszorg, yoga, voeding en meer, in Antwerpen, Gent, Limburg, West-Vlaanderen en online.
          </p>
        </div>
      </section>

      {/* MISSIE */}
      <section style={{ maxWidth: 920, margin: '0 auto', padding: '80px 32px 0' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 40, letterSpacing: '-0.01em', color: 'var(--text-brand)', lineHeight: 1.1, margin: '0 0 24px' }}>
          Onze missie
        </h2>
        <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', maxWidth: 680, margin: '0 0 14px' }}>
          De Belgische en Europese wellnesssector is gefragmenteerd. Goede opleidingen zijn moeilijk te vinden. Slechte
          zijn moeilijk te onderscheiden van goede. Blissify bestaat om dat te veranderen.
        </p>
        <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', maxWidth: 680, margin: 0 }}>
          Wij bouwen het platform dat de standaard zet voor professionele wellnessopleiding: transparant, curatorisch en
          opgericht met respect voor iedereen die dit vak serieus neemt.
        </p>
      </section>

      {/* WAT ONS ANDERS MAAKT */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 32px 88px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 28, color: 'var(--text-brand)', lineHeight: 1.15, margin: '0 0 28px' }}>
          Wat ons anders maakt
        </h2>
        <div className="bl-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {POINTS.map(([t, b]) => (
            <div key={t} style={{ border: '0.5px solid var(--border-hairline)', borderRadius: 8, padding: 28, background: 'var(--surface-card)' }}>
              <span style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: 'var(--blissify-terracotta)', marginBottom: 18 }} />
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 22, color: 'var(--text-brand)', lineHeight: 1.2, marginBottom: 8 }}>{t}</div>
              <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-ui-regular)', fontSize: 15, lineHeight: 1.6, color: 'var(--text-body)', margin: 0 }}>{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TAGLINE CTA */}
      <section style={{ background: 'var(--surface-dark)' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', padding: '88px 32px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 48, letterSpacing: '-0.01em', color: 'var(--blissify-chalk)', lineHeight: 1.1, margin: 0 }}>
            Jouw praktijk begint hier.
          </h2>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
            <ButtonLink href="/voor-aanbieders" variant="accent">
              Bied mijn opleidingen aan
            </ButtonLink>
            <ButtonLink href="/prijzen" variant="ghost-dark">
              Bekijk de prijzen
            </ButtonLink>
          </div>
        </div>
      </section>
    </SiteChrome>
  )
}
