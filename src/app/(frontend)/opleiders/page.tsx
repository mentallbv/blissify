import React from 'react'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'
import { ProviderCard, Eyebrow } from '@/components/ui'
import { getProviderCards } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Wellness opleiders in België - Geverifieerde academies',
  description:
    'Ontdek geverifieerde wellness opleiders in België. Massageacademies, beautyscholen, yogascholen en meer. Elke opleider op Blissify is handmatig geverifieerd.',
}

export default async function OpleidersPage() {
  const { cards } = await getProviderCards(24)
  return (
    <SiteChrome>
      <section style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '72px 32px 32px' }}>
        <Eyebrow tone="meta">Opleiders</Eyebrow>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--fw-display-light)',
            fontSize: 48,
            letterSpacing: '-0.01em',
            color: 'var(--text-brand)',
            lineHeight: 1.1,
            margin: '14px 0 0',
            maxWidth: 760,
          }}
        >
          Geverifieerde opleiders in België
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', maxWidth: 640, margin: '20px 0 0' }}>
          Elke opleider op Blissify is handmatig geverifieerd. Dat betekent: echte academies, echte certificaten, echte
          expertise.
        </p>
      </section>

      <section style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '24px 32px 64px' }}>
        <div className="bl-grid-3">
          {cards.map((p) => (
            <ProviderCard key={p.slug} {...p} />
          ))}
        </div>
      </section>

      {/* Trust band */}
      <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)', borderBottom: '0.5px solid var(--border-hairline)' }}>
        <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '64px 32px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 28, color: 'var(--text-brand)', margin: '0 0 16px' }}>
            Hoe Blissify opleiders verifieert
          </h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', maxWidth: 720, margin: 0 }}>
            Voordat een opleider wordt toegelaten op Blissify, controleert ons team de identiteit van de organisatie, de
            kwalificaties van de docenten, de inhoud van het programma en de gecommuniceerde erkenning. Niet iedereen
            wordt goedgekeurd. Dat is precies waarom een Blissify-vermelding iets betekent.
          </p>
        </div>
      </section>
    </SiteChrome>
  )
}
