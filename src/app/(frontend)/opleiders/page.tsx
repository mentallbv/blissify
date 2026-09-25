import React from 'react'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'
import { ProviderCard, Eyebrow } from '@/components/ui'
import { MerkenFilterBar } from '@/components/site/MerkenFilterBar'
import { getProviderCards, getTrainerFilterOptions } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Wellness opleiders in België - Beauty en wellness academies',
  description:
    'Ontdek wellness opleiders in België. Massageacademies, beautyscholen, yogascholen en meer. Vergelijk profielen en opleidingen op Blissify.',
}

const one = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v || '')
const many = (v: string | string[] | undefined): string[] => one(v).split(',').map((s) => s.trim()).filter(Boolean)

type SP = Promise<Record<string, string | string[] | undefined>>

export default async function OpleidersPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const specialisaties = many(sp.specialisatie)
  const city = one(sp.locatie) || undefined

  const [{ cards }, opts] = await Promise.all([
    getProviderCards({ specialisaties, city, limit: 48 }),
    getTrainerFilterOptions(),
  ])

  return (
    <SiteChrome>
      <section className="bl-container" style={{ paddingTop: 72, paddingBottom: 24 }}>
        <Eyebrow tone="meta">Opleiders</Eyebrow>
        <h1
          style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-light)', fontSize: 48, letterSpacing: '-0.01em', color: 'var(--text-brand)', lineHeight: 1.1, margin: '14px 0 0', maxWidth: 760 }}
        >
          Opleiders in België
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', maxWidth: 640, margin: '20px 0 0' }}>
          Ontdek beauty- en wellnessopleiders in heel België. Vergelijk hun profielen en opleidingen en
          vraag rechtstreeks informatie aan.
        </p>
      </section>

      <section className="bl-container" style={{ paddingTop: 8, paddingBottom: 0 }}>
        <MerkenFilterBar facets={opts.facets} groups={opts.groups} basePath="/opleiders" />
      </section>

      <section className="bl-container" style={{ paddingTop: 24, paddingBottom: 64 }}>
        {cards.length ? (
          <div className="bl-grid-3">
            {cards.map((p) => (
              <ProviderCard key={p.slug} {...p} />
            ))}
          </div>
        ) : (
          <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '72px 48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-meta)', margin: 0, maxWidth: 380 }}>
              Geen opleiders gevonden voor deze filters.
            </p>
          </div>
        )}
      </section>

      <section style={{ background: 'var(--surface-card)', borderTop: '0.5px solid var(--border-hairline)', borderBottom: '0.5px solid var(--border-hairline)' }}>
        <div className="bl-container" style={{ paddingTop: 64, paddingBottom: 80 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-display-regular)', fontSize: 28, color: 'var(--text-brand)', margin: '0 0 16px' }}>
            Vergelijk zelf wat bij je past
          </h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', maxWidth: 720, margin: 0 }}>
            Blissify brengt beauty- en wellnessopleiders op één plek samen. De informatie op ieder profiel wordt door
            de aanbieder aangeleverd. Vergelijk prijs, duur, locatie, certificaatinformatie, website en aanbod, en neem
            rechtstreeks contact op met de opleider die bij jou past.
          </p>
        </div>
      </section>
    </SiteChrome>
  )
}
