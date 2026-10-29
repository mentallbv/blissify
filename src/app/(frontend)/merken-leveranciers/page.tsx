import React from 'react'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/SiteChrome'
import { Eyebrow } from '@/components/ui'
import { BrandCard } from '@/components/site/BrandCard'
import { NameSearch } from '@/components/site/NameSearch'
import { MerkenFilterBar } from '@/components/site/MerkenFilterBar'
import { getBrandCards, getMerkenFacets, type MerkenFilters } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Merken en leveranciers voor de wellness- en beautysector',
  description:
    'Ontdek merken en leveranciers die samenwerken met opleiders in de wellness- en beautysector in België en Nederland. Vergelijk opleidingen en partners op Blissify.',
}

const one = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v || '')
const list = (v: string | string[] | undefined): string[] => one(v).split(',').filter(Boolean)

export default async function MerkenPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const filters: MerkenFilters = {
    q: one(sp.q) || undefined,
    producttype: list(sp.producttype),
    typePartner: one(sp.typePartner) || undefined,
    herkomst: one(sp.herkomst) || undefined,
    filosofie: list(sp.filosofie),
    extra: list(sp.extra),
  }
  const [{ cards }, facets] = await Promise.all([getBrandCards(filters), getMerkenFacets()])
  return (
    <SiteChrome>
      <section className="bl-container" style={{ paddingTop: 72, paddingBottom: 32 }}>
        <Eyebrow tone="meta">Merken en Leveranciers</Eyebrow>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--fw-display-light)',
            fontSize: 48,
            letterSpacing: '-0.01em',
            color: 'var(--text-brand)',
            lineHeight: 1.1,
            margin: '14px 0 0',
          }}
        >
          Merken en leveranciers voor de beautysector
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)', maxWidth: 640, margin: '20px 0 0' }}>
          Ontdek merken en leveranciers die samenwerken met professionele opleiders in de Belgische wellness- en beautysector.
        </p>
        <div style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <NameSearch basePath="/merken-leveranciers" placeholder="Zoek op merk- of bedrijfsnaam" />
          </div>
          <MerkenFilterBar facets={facets} basePath="/merken-leveranciers" />
        </div>
      </section>

      <section className="bl-container" style={{ paddingTop: 24, paddingBottom: 80 }}>
        {cards.length === 0 ? (
          <div style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '72px 48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-meta)', margin: 0, maxWidth: 380 }}>
              Geen merken gevonden voor deze filter.
            </p>
          </div>
        ) : (
        <div className="bl-grid-3">
          {cards.map((b) => <BrandCard key={b.slug} b={b} />)}
        </div>
        )}
      </section>
    </SiteChrome>
  )
}
